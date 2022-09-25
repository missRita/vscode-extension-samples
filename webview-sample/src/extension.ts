import * as vscode from 'vscode';

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
			const comments: CommObj[] = [];
			comments.push({content: 'com1', id: '123', author: 'Serman', date: new Date(), flag: true});
			comments.push({content: 'com2', id: '456', author: 'Serman', date: new Date(), flag: false});
			comments.push({content: 'com3', id: '789', author: 'Dita user', date: new Date(), flag: false});
			CatCodingPanel.createOrShow(context.extensionUri, comments);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('catCoding.AddComment', () => {
			if (CatCodingPanel.currentPanel) {
				CatCodingPanel.currentPanel.Add({content: 'newcom', id: '017', author: 'Dita user', date: new Date(), flag: false});
			}
		})
	);
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {

		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
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

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri, comments : CommObj[]) {
		
		CatCodingPanel._coms = comments;
		
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
						vscode.window.showErrorMessage(message.id);
						return;
					case 'clear':
						vscode.window.showErrorMessage(message.id);
						return;
					case 'filter':
						vscode.window.showErrorMessage(message.id);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public Refresh()
	{
		if (this._panel.visible) {
			this._update(CatCodingPanel._coms);
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
		const webview = this._panel.webview;

		this._updateForCat(webview, comments);
	}

	private _updateForCat(webview: vscode.Webview, comments : CommObj[]) {
		this._panel.webview.html = this._getHtmlForWebview(webview, comments);

		this.Load(CatCodingPanel._coms);
	}

	private _getHtmlForWebview(webview: vscode.Webview, comments: CommObj[]) {
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
					<ul id="coms" style="list-style: none;">
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

function Remove(id : string) : void
{
	// найти в эдиторе комментарий по id
	// удалить комментарий из текста
	
	// убрать из списка комментарий
	CatCodingPanel._coms = CatCodingPanel._coms.filter(el => el.id !== id);
	// обновить панель
	CatCodingPanel.currentPanel?.Refresh();
}

function Take(id : string) : void
{
	// найти в эдиторе комментарий по id
	// выделить комментарий
	
}

function Done(id : string, flag: boolean) : void
{
	// найти в эдиторе комментарий по id
	// добавить атрибут flag
	
	if(flag)
	{
		// удалить атрибут
	}
	else
	{
		// установить
	}
}