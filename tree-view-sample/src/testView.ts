import * as vscode from 'vscode';
import * as path from 'path';

export class TestView {

	constructor(context: vscode.ExtensionContext) {
		const view = vscode.window.createTreeView('testView', { treeDataProvider: aNodeWithIdTreeDataProvider(), showCollapseAll: true });
		context.subscriptions.push(view);
		vscode.commands.registerCommand('testView.reveal', async () => {
			const key = await vscode.window.showInputBox({ placeHolder: 'Type the label of the item to reveal' });
			if (key) {
				await view.reveal({ key }, { focus: true, select: false, expand: true });
			}
		});
		vscode.commands.registerCommand('testView.changeTitle', async () => {
			const title = await vscode.window.showInputBox({ prompt: 'Type the new title for the Test View', placeHolder: view.title });
			if (title) {
				view.title = title;
			}
		});
	}
}

const tree2 = {
	bookmap: {
		chapter: [
			{
				chapterName: 'ch1',
				maps: [
					{
						mapName: 'map1',
						path: 'mappath1',
						topics: [
							{
								topicName: 'topic2',
								path: 'topicpath2'
							},
							{
								topicName: 'topic2',
								path: 'topicpath2'
							},
							{
								topicName: 'topic3',
								path: 'topicpath3'
							}
						]
					}
				]
			},
			{
				chapterName: 'ch2',
				maps: [
					{
						mapName: 'map2',
						path: 'mappath2',
						topics: [
							{
								topicName: 'topic4',
								path: 'topicpath4'
							}
						]
					},
					{
						mapName: 'map3',
						path: 'mappath3',
						topics: [
							{
								topicName: 'topic5',
								path: 'topicpath5'
							},
							{
								topicName: 'topic6',
								path: 'topicpath6'
							}
						]
					}
				]
			},
			{
				chapterName: 'ch3',
				maps: [
					{
						mapName: 'map2',
						path: 'mappath2',
						topics: []
					},
				]
			},
			{
				chapterName: 'ch4',
				maps: []
			},
		]
	}
};

	//{ navtitle: 'cha1', mapref: 'click me1', title: {
		//i:''
//	}}

const tree = {
	'a': {
		'aa': {
			'aaa': {
				'aaaa': {
					'aaaaa': {
						'aaaaaa': {

						}
					}
				}
			}
		},
		'ab': {}
	},
	'b': {
		'ba': {},
		'bb': {}
	}
};
const nodes = {};

function aNodeWithIdTreeDataProvider(): vscode.TreeDataProvider<{ key: string }> {
	return {
		getChildren: (element: { key: string }): { key: string }[] => 
		{
			return getChildren(element ? element.key : undefined).map(key => getNode(key));
		},
		getTreeItem: (element: { key: string }): vscode.TreeItem => 
		{
			const treeItem = getTreeItem(element.key);
			treeItem.id = element.key;
			return treeItem;
		},
		getParent: ({ key }: { key: string }): { key: string } => {
			const parentKey = key.substring(0, key.length - 1);
			return parentKey ? new Key(parentKey) : void 0;
		}
	};
}

// по key возваразет элементы уровня ниже
function getChildren(key: string): string[] {
	if (!key) {
		return Object.keys(tree);
	}
/* 	if(key.includes('b')){
		vscode.window.showInformationMessage('No dependency in empty workspace');
	} */
	const treeElement = getTreeElement(key);
	if (treeElement) {
		return Object.keys(treeElement);
	}
	return [];
}

function getTreeItem(key: string): vscode.TreeItem {
	const treeElement = getTreeElement(key);
	// An example of how to use codicons in a MarkdownString in a tree item tooltip.
	const tooltip = new vscode.MarkdownString(`$(zap) Tooltip for ${key}`, true);
	let iconPath;
	let command : vscode.Command | undefined;
	if(key==='ba'){
		iconPath = {
			light: path.join(__filename, '..', '..', 'resources', 'light', 'refresh.svg'),
			dark: path.join(__filename, '..', '..', 'resources', 'dark', 'refresh.svg')
		};
		command = {
			command: 'workbench.action.files.openFile',
			title: '',
			arguments: ['D:\\dita2\\cc_config.xml']
		};
	}
	return {
		label: /**vscode.TreeItemLabel**/<any>{ label: key, highlights: key.length > 1 ? [[key.length - 2, key.length - 1]] : void 0 },
		tooltip,
		iconPath: iconPath,
		command : command,
		collapsibleState: treeElement && Object.keys(treeElement).length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
	};
}

function getTreeElement(element): any {
	let parent = tree;
	for (let i = 0; i < element.length; i++) {
		parent = parent[element.substring(0, i + 1)];
		if (!parent) {
			return null;
		}
	}
	return parent;
}


function getNode(key: string): { key: string } {
	if (!nodes[key]) {
		nodes[key] = new Key(key);
	}
	return nodes[key];
}

class Key {
	constructor(readonly key: string) { }
}