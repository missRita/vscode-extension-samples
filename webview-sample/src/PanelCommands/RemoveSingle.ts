import * as vscode from 'vscode';
import { CommentsPanel } from "../CommentsPanel";

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
			commentLength = match[0].length;
			return;
		}
	});

	if (commentIndex === undefined) { return; }

	editor.edit(editBuilder => {
		if (commentIndex === undefined) return;
		let p1 = editor.document.positionAt(commentIndex);
		let p2 = editor.document.positionAt(commentIndex + commentLength);
		editBuilder.replace(new vscode.Range(p1, p2), '');
	}).then(() => {
		vscode.commands.executeCommand('editor.action.formatDocument');
	});

	// убрать из списка комментарий
	CommentsPanel._coms = CommentsPanel._coms.filter(el => el.id !== id);
	// обновить панель
	CommentsPanel.currentPanel?.Refresh();
}