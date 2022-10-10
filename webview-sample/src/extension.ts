import * as vscode from 'vscode';
import { workspace, commands, Disposable } from "vscode";
import { CommentViewProvider } from './CommnetViewProvider';

export interface CommObj {
	content: string;
	id: string;
	author : string;
	date: Date;
	flag: boolean;
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('catCoding.OpenCommentsPanel', () => {
			let comments: CommObj[] = [];
			const editor = vscode.window.activeTextEditor;
			if (!editor || editor === undefined) { return; }
			comments = GetComments();

			CatCodingPanel.createOrShow(context.extensionUri, comments, editor);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('catCoding.AddComment', async () => {
			AddComment();
		})
	);

	context.subscriptions.push(change());
}

function change() : vscode.Disposable
{
	let disposables: Disposable[] = [];

	workspace.onDidChangeTextDocument(event => onDidChangeTextDocument(), null, disposables);

	return Disposable.from(...disposables);
}

function onDidChangeTextDocument()
{
	if (CatCodingPanel.currentPanel) {
		CatCodingPanel._coms = GetComments();
		CatCodingPanel.currentPanel.Refresh();
	}
}

async function AddComment()
{
	let editor = vscode.window.activeTextEditor;
	if (!editor || editor === undefined) { return; }

	let commentText : string|undefined;

	await vscode.window.showInputBox({
		placeHolder: 'Текст коментария',
		prompt: 'Добавьте комментарий',
		validateInput: (val) => {
			if (val.indexOf('<') !== -1) return 'Служебные символы XML в комментариях запрещены. Используйте &lt;';
			if (val.indexOf('>') !== -1) return 'Служебные символы XML в комментариях запрещены. Используйте &gt;';
			if (val.indexOf('"') !== -1) return 'Служебные символы XML в комментариях запрещены. Используйте « или »';
		},
	},
	).then(s => {
		commentText = s;
	});
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

	function toIsoString(date : Date) {
		var tzo = -date.getTimezoneOffset(),
			dif = tzo >= 0 ? '+' : '-',
			pad = function(num : number) {
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
	let targetSub = text.substring(start, end);
	let id = 'FGVH7VH4g454vhTHVr';//uuid.v4();

	if(CatCodingPanel.currentPanel !== undefined) {
	CatCodingPanel.currentPanel.Add({content: commentText, id: id, author: author, date: date, flag: false});
	}

	let comment = `<?oxy_comment_start author="${author}" timestamp="${toIsoString(date)}" comment="${commentText}" id="${id}"?>${targetSub}<?oxy_comment_end?>`;

	editor.edit(editBuilder => {
		if (editor === undefined) { return; }
		let p1 = editor.document.positionAt(start);
		let p2 = editor.document.positionAt(end);
		editBuilder.replace(new vscode.Range(p1, p2), comment);
	}).then(
		() => {
			// выделить (позиция при добавлении сдвигается на длинну комментария)
			let pos = start + comment.length - 64 - targetSub.length;
			editor.selections = [new vscode.Selection(editor.document.positionAt(pos), editor.document.positionAt(pos))];
		}
	);
	
/* 	.then(() => {
		// форматирование 
		vscode.commands.executeCommand('editor.action.formatDocument')
	}); */
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {

		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}

function GetComments(): CommObj[]
{
	// eslint-disable-next-line prefer-const
	let comments: CommObj[] = [];

	const editor = vscode.window.activeTextEditor;
	if (!editor || editor === undefined) { return []; }

	// текст редактора
	const text = editor.document.getText();

	const commentRegexp = new RegExp('<\\?oxy_comment_start(.*?)<\\?oxy_comment_end\\?>','sig');
	const comMatches = [...text.matchAll(commentRegexp)];
	// фильтруем по id
	comMatches.forEach((match) => {
		
		let m1 = match[0];
		const r1 = new RegExp('<\\?','g');
		m1 =  m1.replace(r1, '<');
		const r2 = new RegExp('\\?>','g');
		m1 =  m1.replace(r2, '>');
		const r3 = new RegExp('oxy_comment_end','g');
		m1 =  m1.replace(r3, '/oxy_comment_start');

		let fs = require('fs'), 
		xml2js = require('xml2js');

		const parser = new xml2js.Parser();

		// парсим DOM
		parser.parseString(m1, function (err: any, result: any) {

			const a = 0;
			//let content = result.oxy_comment_start._;
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

/**
 * Manages cat coding webview panels
 */
class CatCodingPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: CatCodingPanel | undefined;

	public static readonly viewType = 'catCoding';

	// хранилище комментов
	public static _coms: CommObj[] = [];
	public static _filter: string;
	public static ed: vscode.TextEditor;

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri, comments : CommObj[], editor: vscode.TextEditor) {
		
		CatCodingPanel._coms = comments;
		CatCodingPanel.ed = editor;

		this._filter = '';
		
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (CatCodingPanel.currentPanel) {
			CatCodingPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			CatCodingPanel.viewType,
			'Review',
			vscode.ViewColumn.Two,
			getWebviewOptions(extensionUri),
		);

		CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri, comments);
	}

/* 	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri);
	} */

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, comments : CommObj[]) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update(CatCodingPanel._coms);
		vscode.window.showWarningMessage('конструктор');

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					vscode.window.showWarningMessage('стейт');
					CatCodingPanel._coms = GetComments();
					this._update(CatCodingPanel._coms);
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'remove':
						// удаление комментария
						Remove(message.id);
						return;
					case 'take':
						// переход к комментарию
						Take(message.id);
						return;
					case 'done':
						// пометить выполенным
						Done(message.id, message.flag);
						return;
					case 'delete':
						Delete();
						return;
					case 'clear':
						Clear();
						return;
					case 'filter':
						Filter(message.author);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public Refresh()
	{
		let arr = CatCodingPanel._coms;
		if(CatCodingPanel._filter.length !==0 ) arr = CatCodingPanel._coms.filter(e=>e.author === CatCodingPanel._filter);

		if (this._panel.visible) {
			this._update(arr);
		}
	}

	public Add(com : CommObj) {
		CatCodingPanel._coms.push(com);
		this._panel.webview.postMessage({ command: 'add', content: com.content, id: com.id, author: com.author, flag: com.flag});
	}

	public Load(coms: CommObj[]) {
		this._panel.webview.postMessage({ command: 'allCommnets', they: coms});
	}

	public dispose() {
		CatCodingPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update(comments : CommObj[]) {
		this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

		this.Load(comments);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<title>Cat Coding</title>
			</head>
			<body>
				<h1>Комментарии</h1>
				<div>
					<ul id="coms">
					</ul>
				</div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function Remove(id : string)
{
	// найти в эдиторе комментарий по id
	// удалить комментарий из текста
	const editor = CatCodingPanel.ed;
	if (!editor || editor === undefined) { return; }

	// текст редактора
	const text = editor.document.getText();

	// опредеяем начало комментария
	let commentIndex: number | undefined;
	let commentLength : number;
	const commentRegexp = new RegExp('<\\?oxy_comment_start(.*?)<\\?oxy_comment_end\\?>','sig');
	const commentIdRegexp = new RegExp('id="(.*?)"');
	const comMatches = [...text.matchAll(commentRegexp)];

	// фильтруем по id
	comMatches.forEach((match) => {
		let m = commentIdRegexp.exec(match[1]);
		if (m === null || m === undefined) { return; }
		let cid = m[1];

		if(cid === id){
			commentIndex = match.index;
			commentLength = match[0].length;
			return;
		}
	});

	if (commentIndex === undefined) { return; }

	editor.edit(editBuilder => {
		//if (editor === undefined) { return; }
		if(commentIndex === undefined) return;
		let p1 = editor.document.positionAt(commentIndex);
		let p2 = editor.document.positionAt(commentIndex + commentLength);
		editBuilder.replace(new vscode.Range(p1, p2), '');
	}).then(() => {
		vscode.commands.executeCommand('editor.action.formatDocument');
	});

	// убрать из списка комментарий
	CatCodingPanel._coms = CatCodingPanel._coms.filter(el => el.id !== id);
	// обновить панель
	CatCodingPanel.currentPanel?.Refresh();
}

function Take(id : string) : void
{
	// текст редактора
	const text = CatCodingPanel.ed.document.getText();

	const commentRegexp = new RegExp('<\\?oxy_comment_start.*?id="(.*?)"[^>]*?>.*?<\\?oxy_comment_end\\?>', 'sig');

	// опредеяем начало искомого комментария
	let comIndex: number | undefined;
	let comLength = 0;

	const comMatches = [...text.matchAll(commentRegexp)];
	// фильтруем по id
	comMatches.forEach((match) => {
		if(match[1] === id) { 
			comIndex = match.index;
			comLength = match[0].length;
			return;
		}
	});

	if (comIndex === undefined) { return; }

	CatCodingPanel.ed.selections = [new vscode.Selection(CatCodingPanel.ed.document.positionAt(comIndex),
		CatCodingPanel.ed.document.positionAt(comIndex + comLength))];

}

async function Delete()
{
	// найти в эдиторе все комментарий
	// удалить комментарий из текста
	const editor = CatCodingPanel.ed;
	if (!editor || editor === undefined) { return; }

	// текст редактора
	const text = editor.document.getText();

	// определяем начало комментария
	let commentIndex: number|undefined;
	let commentLength : number;
	const commentRegexp = new RegExp('<\\?oxy_comment_start(.*?)<\\?oxy_comment_end\\?>','sig');

	let more = false;
	do {
		const text = editor.document.getText();
		const comMatches = [...text.matchAll(commentRegexp)];
		if(comMatches.length === 0) return;
		
		commentIndex = comMatches[0].index;
		if(commentIndex === undefined) return;
		commentLength = comMatches[0][0].length;

		await editor.edit(editBuilder => {
			//if (editor === undefined) { return; }
			if(commentIndex === undefined) return;
			let p1 = editor.document.positionAt(commentIndex);
			let p2 = editor.document.positionAt(commentIndex + commentLength);
			editBuilder.replace(new vscode.Range(p1, p2), '');
		});
		
		if(comMatches.length>1) more = true;
		else more = false;

	} while (more);

	await vscode.commands.executeCommand('editor.action.formatDocument');

	// очистить список комментариев
	CatCodingPanel._coms = [];
	// обновить панель
	CatCodingPanel.currentPanel?.Refresh();
}

function Done(id : string, flag: boolean) : void
{
	// текст редактора
	const text = CatCodingPanel.ed.document.getText();

	const commentRegexp = new RegExp('<\\?oxy_comment_start.*?id="(.*?)"[^>]*?>.*?<\\?oxy_comment_end\\?>', 'sig');

	// опредеяем начало искомого комментария
	let comIndex: number | undefined;
	let comLength = 0;
	let fullComment : string|undefined;

	const comMatches = [...text.matchAll(commentRegexp)];
	// фильтруем по id
	comMatches.forEach((match) => {
		if(match[1] === id) { 
			comIndex = match.index;
			comLength = match[0].length;
			fullComment = match[0];
			return;
		}
	});

	if (comIndex === undefined || fullComment === undefined) { return; }
	
	let m1 = fullComment;
	const r1 = new RegExp('<\\?','g');
	m1 =  m1.replace(r1, '<');
	const r2 = new RegExp('\\?>','g');
	m1 =  m1.replace(r2, '>');
	const r3 = new RegExp('oxy_comment_end','g');
	m1 =  m1.replace(r3, '/oxy_comment_start');

	let fs = require('fs'), 
	xml2js = require('xml2js');

	const parser = new xml2js.Parser();

	let newcomment;

	// парсим DOM
	parser.parseString(m1, function (err: any, result: any) {

		const a = 0;

		if(!flag) result.oxy_comment_start.$.flag = 'done';
		else 
		{
			delete result.oxy_comment_start.$.flag;
		}

		newcomment = result;
	});

	var builder = new xml2js.Builder();
	let xml = '';
	xml = builder.buildObject(newcomment);

	const calsTableRegexp2 = new RegExp('<oxy_comment_start.*?>.*?<\\/oxy_comment_start>', 'sig');
	// чистим от мусора выходную таблицу
	let m2 = calsTableRegexp2.exec(xml);

	if (m2 === null || m2 === undefined) { return; }

	// собрать коммент нормально

	// вставить

	// обновить вьюху
}

function Clear(): void {
	// снимаем фильтрацию
	CatCodingPanel._filter = '';
	// обновить панель
	CatCodingPanel.currentPanel?.Refresh();
}

function Filter(author: string): void {
	// выставляем признак фильтрации
	CatCodingPanel._filter = author;
	// обновить панель
	CatCodingPanel.currentPanel?.Refresh();
}