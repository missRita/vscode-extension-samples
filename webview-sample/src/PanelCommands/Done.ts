import * as vscode from 'vscode';
import { PrepareToParsing, PrepareToPublishing } from './CommentHelper';
import { CommentsPanel } from "../CommentsPanel";
import { GetComments } from '../extension';

/**
 * Устанвливает или удаляет атрибут готовности комментария
 *
 *  @param id идентификатор комментария
 *  @param flag флаг готовности
 */
export async function Done(id : string, flag: boolean)
{
	// текст редактора
	const text = CommentsPanel.currentEditor.document.getText();

	const commentRegexp = new RegExp('<\\?oxy_comment_start.*?id="(.*?)"[^>]*?>.*?<\\?oxy_comment_end\\s*\\?>', 'sig');

	// определяем начало искомого комментария
	let comIndex: number | undefined;
	let fullComment : string|undefined;

	const comMatches = [...text.matchAll(commentRegexp)];
	// фильтруем по id
	comMatches.forEach((match) => {
		if(match[1] === id) { 
			comIndex = match.index;
			fullComment = match[0];
			return;
		}
	});

	if (comIndex === undefined || fullComment === undefined) { return; }
	
	// подготовка к работе парсера
	let m1 = PrepareToParsing(fullComment);

	let fs = require('fs'), 
	xml2js = require('xml2js');

	const parser = new xml2js.Parser();

	let newcomment;

	// парсим DOM
	parser.parseString(m1, function (err: any, result: any) {

		if(!flag) result.oxy_comment_start.$.flag = 'done';
		else delete result.oxy_comment_start.$.flag;

		newcomment = result;
	});

	// собираем комментарий обратно
	var builder = new xml2js.Builder();
	let xml = '';
	xml = builder.buildObject(newcomment);

	let replaceText = PrepareToPublishing(xml);
	if (replaceText === undefined) return;

	let editor = CommentsPanel.currentEditor;
	// дожидаемся замены и форматирования документа
	await editor.edit(editBuilder => {
		if (comIndex === undefined) { return; }
		let p1 = editor.document.positionAt(comIndex);
		if (replaceText === undefined) return;
		let p2 = editor.document.positionAt(comIndex + replaceText.length);
		editBuilder.replace(new vscode.Range(p1, p2), replaceText);
	}).then(() => {
		vscode.commands.executeCommand('editor.action.formatDocument');
	});

	if (CommentsPanel.currentPanel) {
		CommentsPanel._coms = GetComments();
		CommentsPanel.currentPanel.Refresh();
	}
}
