import * as vscode from 'vscode';
import { CommentsPanel } from "../CommentsPanel";
import { PrepareToParsing } from './CommentHelper';

/**
 * Удаление комментария
 *
 *  @param id идентификатор комментария
 */
export function RemoveSingle(id : string)
{
	const editor = CommentsPanel.currentEditor;
	if (!editor || editor === undefined) { return; }

	// текст редактора
	const text = editor.document.getText();

	// опредеяем начало и длину комментария
	let commentIndex: number | undefined;
	let commentLength : number;
	let comment : string;
	const commentRegexp = new RegExp('<\\?oxy_comment_start(.*?)<\\?oxy_comment_end\\s*\\?>','sig');
	const commentIdRegexp = new RegExp('id="(.*?)"');
	const comMatches = [...text.matchAll(commentRegexp)];

	comMatches.forEach((match) => {
		// ищем id
		let m = commentIdRegexp.exec(match[1]);
		if (m === null || m === undefined) { return; }

		// фильтруем по id
		if(m[1] === id){
			commentIndex = match.index;
			comment = match[0];
			commentLength = match[0].length;
			return;
		}
	});

	if (commentIndex === undefined) { return; }

	// подготовка к работе парсера
	let m1 = PrepareToParsing(comment);

	let fs = require('fs'),
		xml2js = require('xml2js');

	const parser = new xml2js.Parser();

	let content = '';

	// парсим DOM
	parser.parseString(m1, function (err: any, result: any) {

		content =  result.oxy_comment_start._;
		if(content === undefined) return;
		
	});

	editor.edit(editBuilder => {
		if (commentIndex === undefined) return;
		let p1 = editor.document.positionAt(commentIndex);
		let p2 = editor.document.positionAt(commentIndex + commentLength);
		editBuilder.replace(new vscode.Range(p1, p2), content);
	}).then(() => {
		vscode.commands.executeCommand('editor.action.formatDocument');
	});

	// убрать из списка комментарий
	CommentsPanel._coms = CommentsPanel._coms.filter(el => el.id !== id);
	// обновить панель
	CommentsPanel.currentPanel?.Refresh();
}