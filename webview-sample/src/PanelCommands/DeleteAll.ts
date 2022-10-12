import * as vscode from 'vscode';
import { CommentsPanel } from "../CommentsPanel";

/**
 * Удаление всех комментариев в текущем редакторе
 *
 */
export async function DeleteAll()
{
	const editor = CommentsPanel.currentEditor;
	if (!editor || editor === undefined) { return; }

	// определяем начало комментария
	let commentIndex: number|undefined;
	let commentLength : number;
	const commentRegexp = new RegExp('<\\?oxy_comment_start(.*?)<\\?oxy_comment_end\\s*\\?>','sig');

	// флаг продолжения поиска комментариев
	let more = false;
	do {
		// т.к. удаление динамическое, документ все время меняется
		const text = editor.document.getText();
		// получаем все комментарии
		const comMatches = [...text.matchAll(commentRegexp)];
		if (comMatches.length === 0) return;

		commentIndex = comMatches[0].index;
		commentLength = comMatches[0][0].length;

		// дожидаемся замены документа
		await editor.edit(editBuilder => {
			if (commentIndex === undefined) return;
			let p1 = editor.document.positionAt(commentIndex);
			let p2 = editor.document.positionAt(commentIndex + commentLength);
			editBuilder.replace(new vscode.Range(p1, p2), '');
		});

		if (comMatches.length > 1) more = true;
		else more = false;

	} while (more);

	await vscode.commands.executeCommand('editor.action.formatDocument');

	CommentsPanel._coms = [];
	CommentsPanel.currentPanel?.Refresh();
}