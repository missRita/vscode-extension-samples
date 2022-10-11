import * as vscode from 'vscode';
import { workspace, Disposable } from "vscode";
import { PrepareToParsing } from './PanelCommands/CommentHelper';
import { CommentsPanel } from './CommentsPanel';
//import * as uuid from 'uuid';

export interface CommObj {
	content: string;
	id: string;
	author : string;
	date: Date;
	flag: boolean;
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('comments.OpenCommentsPanel', () => {
			// получаем текущий эдитор для передачи 
			let editor = vscode.window.activeTextEditor;
			if (!editor || editor === undefined) { return; }
			// создаем панель комментариев
			CommentsPanel.createOrShow(context.extensionUri, GetComments(), editor);
		})
	);

	context.subscriptions.push(vscode.commands.registerCommand('comments.AddComment', async () => { AddComment(); }));

	context.subscriptions.push(Change());
}

function Change() : vscode.Disposable
{
	let disposables: Disposable[] = [];

	workspace.onDidChangeTextDocument(event => onDidChangeTextDocument(), null, disposables);

	return Disposable.from(...disposables);
}

function onDidChangeTextDocument()
{
	if (CommentsPanel.currentPanel) {
		CommentsPanel._coms = GetComments();
		CommentsPanel.currentPanel.Refresh();
	}
}

/**
 * Добавление комментария
 *
 */
async function AddComment()
{
	let editor = vscode.window.activeTextEditor;
	if (!editor || editor === undefined) { return; }

	let commentText : string|undefined;

	await vscode.window.showInputBox({
		placeHolder: 'Текст коментария',
		prompt: 'Добавьте комментарий',
		// валидация вводимых значений
		validateInput: (val) => {
			if (val.indexOf('<') !== -1) return 'Служебные символы XML в комментариях запрещены. Используйте &lt;';
			if (val.indexOf('>') !== -1) return 'Служебные символы XML в комментариях запрещены. Используйте &gt;';
			if (val.indexOf('"') !== -1) return 'Служебные символы XML в комментариях запрещены. Используйте « или »';
		},
	},
	).then(s => { commentText = s; });

	if(commentText === undefined) return;

	// текст редактора
	let text = editor.document.getText();

	// позиции начала и конца выделения/курсора
	let end = editor.document.offsetAt(editor.selection.active);
	let start = editor.document.offsetAt(editor.selection.anchor);

	// разворачиваем выделенную область
	if (end < start)
	{
		let tmp = end;
		end = start;
		start = tmp;
	}

	/**
 	* Преобразование даты в формат YYYYMMDDTHHmmss+(-)HH00
 	*
 	*  @param date дата
 	*/
	function toIsoString(date: Date) {
		var tzo = -date.getTimezoneOffset(),
			dif = tzo >= 0 ? '+' : '-',
			pad = function (num: number) {
				return (num < 10 ? '0' : '') + num;
			};

		return date.getFullYear() +
			pad(date.getMonth() + 1) +
			pad(date.getDate()) +
			'T' + pad(date.getHours()) +
			pad(date.getMinutes()) +
			pad(date.getSeconds()) +
			dif + pad(Math.floor(Math.abs(tzo) / 60)) +
			pad(Math.abs(tzo) % 60);
	}

	const author = 'Serman';//getAuthor();
	const date = new Date();
	// выделяемая строка
	let targetSub = text.substring(start, end);
	let id = 'rtf53fcfxf';//uuid.v4();

	if(CommentsPanel.currentPanel) {
		CommentsPanel.currentPanel.Add({content: commentText, id: id, author: author, date: date, flag: false});
	}

	let comment = `<?oxy_comment_start author="${author}" timestamp="${toIsoString(date)}" comment="${commentText}" id="${id}"?>${targetSub}<?oxy_comment_end?>`;

	editor.edit(editBuilder => {
		if (editor === undefined) { return; }
		let p1 = editor.document.positionAt(start);
		let p2 = editor.document.positionAt(end);
		editBuilder.replace(new vscode.Range(p1, p2), comment);
	}).then(()=>{ vscode.commands.executeCommand('editor.action.formatDocument'); });
}

/**
 * Получение всех комментариев из текущего реедактора
 *
 */
export function GetComments(): CommObj[]
{
	let comments: CommObj[] = [];

	const editor = vscode.window.activeTextEditor;
	if (!editor || editor === undefined) { return []; }

	// текст редактора
	const text = editor.document.getText();

	const commentRegexp = new RegExp('<\\?oxy_comment_start(.*?)<\\?oxy_comment_end\\?>','sig');
	const comMatches = [...text.matchAll(commentRegexp)];

	comMatches.forEach((match) => {
		
		// подготовка к работе парсера
		let m1 = PrepareToParsing(match[0]);

		let fs = require('fs'), 
		xml2js = require('xml2js');

		const parser = new xml2js.Parser();

		// парсим DOM
		parser.parseString(m1, function (err: any, result: any) {

			let id = result.oxy_comment_start.$.id;
			let author = result.oxy_comment_start.$.author;
			let comment = result.oxy_comment_start.$.comment;
			let flag = result.oxy_comment_start.$.flag;
			if(flag === undefined) flag = false;
			let ts = result.oxy_comment_start.$.timestamp as string;
			ts = ts.substring(0,ts.length-5);
			let date = new Date();

			comments.push({content: comment, id: id, author: author, date: date, flag: flag});
		});
	});

	return comments;
}