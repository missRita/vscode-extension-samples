import * as vscode from 'vscode';
import { TableViewProvider} from './TableViewProvider';

export function activate(context: vscode.ExtensionContext) {

	// создание провайдера
	const provider = new TableViewProvider(context.extensionUri);

	// регистрация провайдера
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(TableViewProvider.viewType, provider));
}

