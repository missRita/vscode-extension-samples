import * as vscode from 'vscode';
import { CommObj } from './extension';

export class CommentViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'dita-vs-code.Comments';

	private _view?: vscode.WebviewView;

	// хранилище комментов
	public static _coms: CommObj[] = [];
	public static _filter: string;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	// конструктор вью
	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		//this._view.onDidChangeVisibility
		//this._view.onDidDispose

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};
		// разметка
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		// подписка на сообщения скрипта
		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'createTable':
					{
						const a = 0;
					}
					break;
			}
		});
	}

	// разметка формы, стили, скрипт (важно ид color-list, add-color-button )
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
// шаблон имени скрипта
function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}