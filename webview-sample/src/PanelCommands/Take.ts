import * as vscode from 'vscode';
import { CommentsPanel } from "../CommentsPanel";

/**
 * Выделение комментария в окне редактора
 *
 * @param id идентификатор выбранного комментария
 */
export function Take(id: string): void {
	// текст редактора
	const text = CommentsPanel.currentEditor.document.getText();

	const commentRegexp = new RegExp('<\\?oxy_comment_start.*?id="(.*?)"[^>]*?>.*?<\\?oxy_comment_end\\s*\\?>', 'sig');

	// опредеяем начало и длину искомого комментария
	let comIndex: number | undefined;
	let comLength = 0;

	const comMatches = [...text.matchAll(commentRegexp)];
	// фильтруем по id
	comMatches.forEach((match) => {
		if (match[1] === id) {
			comIndex = match.index;
			comLength = match[0].length;
			return;
		}
	});

	if (comIndex === undefined) { return; }

	// выделяем
	CommentsPanel.currentEditor.selections = [new vscode.Selection(CommentsPanel.currentEditor.document.positionAt(comIndex),
		CommentsPanel.currentEditor.document.positionAt(comIndex + comLength))];

}