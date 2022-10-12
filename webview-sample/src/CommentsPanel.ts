import * as vscode from 'vscode';
import { CommObj, GetComments } from './extension';
import { ClearFilter } from './PanelCommands/ClearFilter';
import { DeleteAll } from './PanelCommands/DeleteAll';
import { Done } from './PanelCommands/Done';
import { Filter } from './PanelCommands/Filter';
import { RemoveSingle } from './PanelCommands/RemoveSingle';
import { Take } from './PanelCommands/Take';

 export class CommentsPanel {

	// панель может быть только одна
	public static currentPanel: CommentsPanel | undefined;

	public static readonly viewType = 'Comments';

	// хранилище комментов
	public static _coms: CommObj[] = [];
	public static _filter: string;
	public static currentEditor: vscode.TextEditor;

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri, comments : CommObj[], editor: vscode.TextEditor) {
		
		CommentsPanel._coms = comments;
		CommentsPanel.currentEditor = editor;

		this._filter = '';
		
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (CommentsPanel.currentPanel) {
			CommentsPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			CommentsPanel.viewType,
			'Review',
			vscode.ViewColumn.Two,
			getWebviewOptions(extensionUri),
		);

		CommentsPanel.currentPanel = new CommentsPanel(panel, extensionUri, comments);
	}

/* public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri);
	}  */

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, comments : CommObj[]) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update(CommentsPanel._coms);
		vscode.window.showWarningMessage('конструктор');

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					vscode.window.showWarningMessage('стейт');
					CommentsPanel._coms = GetComments(true);
					//this._update(CommentsPanel._coms);
					this.Refresh();
				}
			},
			null,
			this._disposables
		);

		// подписка на события вьюхи
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'remove_single':
						// удаление комментария
						RemoveSingle(message.id);
						return;
					case 'take':
						// переход к комментарию
						Take(message.id);
						return;
					case 'done':
						// пометить выполенным
						Done(message.id, message.flag);
						return;
					case 'delete_all':
						// удалить все
						DeleteAll();
						return;
					case 'clear_filter':
						// сбросить фильтр
						ClearFilter();
						return;
					case 'filter':
						// применить фильтр
						Filter(message.author);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	// фильтруем внутренние коммментарии, обновляем
	public Refresh()
	{
		let arr = CommentsPanel._coms;
		if(CommentsPanel._filter.length !==0 ) arr = CommentsPanel._coms.filter(e=>e.author === CommentsPanel._filter);

		if (this._panel.visible) {
			this._update(arr);
		}
	}

	public Add(com : CommObj) {
		CommentsPanel._coms.push(com);
		if(CommentsPanel._filter === '' || com.author === CommentsPanel._filter)
			this._panel.webview.postMessage({ command: 'add', content: com.content, id: com.id, author: com.author, date: com.date, flag: com.flag});
	}

	// отправка команды на main.js
	public Load(coms: CommObj[]) {
		this._panel.webview.postMessage({ command: 'allCommnets', they: coms, filter: CommentsPanel._filter});
	}

	public dispose() {
		CommentsPanel.currentPanel = undefined;
		CommentsPanel._coms = [];

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	// обновляем html+main.js
	private _update(comments : CommObj[]) {
		this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

		this.Load(comments);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

		// Local path to css styles
		const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'st.css');

		// Uri to load styles into webview
		const stylesResetUri = webview.asWebviewUri(styleResetPath);

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

				<link href="${stylesResetUri}" rel="stylesheet">

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

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {

		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
