import * as vscode from 'vscode';
import { MapProvider } from './MapProvider';

export function activate(context: vscode.ExtensionContext) {

	const mapProvider = new MapProvider();
	vscode.window.registerTreeDataProvider('dita-vs-code.DitaMap', mapProvider);
	
	// кнопка обновить
	vscode.commands.registerCommand('dita-vs-code.RefreshBookMap', () => mapProvider.refresh());
	
	// команда открытия файла по ссылке
	vscode.commands.registerCommand('dita-vs-code.openFile', moduleName => 
	{
		const uri = vscode.Uri.file(moduleName);
		vscode.workspace.openTextDocument(uri).then(doc => {
			const ed = vscode.window.showTextDocument(doc);
		}
		);
	});
}