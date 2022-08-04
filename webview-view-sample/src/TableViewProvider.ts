import * as vscode from 'vscode';

export class TableViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'dita-vs-code.createTable';

	private _view?: vscode.WebviewView;

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
				case 'colorSelected':
					{
						// реализация добавления инфы от вьюхи
						vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
						break;
					}
				case 'createTable':
					{
						// eslint-disable-next-line prefer-const
						let a = data.title;
						// eslint-disable-next-line prefer-const
						let r = data.row;
						// eslint-disable-next-line prefer-const
						let c = data.column;
						// eslint-disable-next-line prefer-const
						let b = 0;

						// реализация добавления инфы от вьюхи

						if(data.row === undefined || data.row < 1 || data.column === undefined || data.column < 1) break;

						let text : string;
						
						text = '<table>\n';
						if(data.title.length != 0)
						{
							text += `<title>${data.title}</title>\n`;
						}
						text += `<tgroup cols="${data.column}">\n`;
						for (let index = 1; index <= data.column; index++) {
							text += `<colspec colnum="${index}" colname="col${index}"/>\n`;							
						}

						text += '<tbody>\n';

						

						for (let index = 1; index <= data.row; index++) {
							let rowText = '<row>\n';
							for (let index2 = 1; index2 <= data.column; index2++) {
								rowText += '<entry> </entry>\n';								
							}
							rowText += '</row>\n';
							text += rowText;
						}

						text += '</tbody>\n</tgroup>\n</table>\n';

						vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`${text}`));
						break;
					}
			}
		});
	}

	// разметка формы, стили, скрипт (важно ид color-list, add-color-button )
	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				
				<title>Cat Colors</title>
			</head>
			<body>
				Создание таблицы
				<div class="table-title"></div>
				<div class="table-row"></div>
				<div class="table-column"></div>
				<button class="add-table">Создать</button>
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
