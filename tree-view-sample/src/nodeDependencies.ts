import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string | undefined) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

// TODO
/*
кнопку обновления оставить на будущее 
12345678901234567890123456789012.. 40->|
описать структуру json
 */
	getChildren(element?: Dependency): Thenable<Dependency[]> {
		if(element === undefined)
		{
			const b = this.Eprst2(undefined);
			return Promise.resolve(b);
		}
		const a = this.Eprst2(element.label);
		return Promise.resolve(a);

/* 
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}
*/
	}

	private Eprst2(name: string) : Dependency[]
	{
		const result : Dependency[] = [];
		
		// список дочерних
		let list; 
		let iconType = 0;
		const lowlevel = false;

		if(name === undefined){
			// первый уровень - ГК
			list = tree3.elems;
			iconType = 0;
		}
		
		else {
			go(tree3.elems);

			// на вход список elems любого уровня
			function go(somelist: any): void {

				// может быть пустой или вообще не добавлен
				if(somelist === undefined) return;

				// пробегаемся по каждому в списке
				for (let i = 0; i < somelist.length; i++) {
					const el = somelist[i];
					if (el.name === name) {
						list =  el.elems;
					}
					else {
						go(el.elems);
					}

				}
			}
		}

		// список дочерних не нашли
		if(list === undefined) return result;

		// заполняем листья узла
		list.forEach( (element : {name: string; path: string, type: number }) => {
			const dep = new Dependency(element.name, element.path, element.type,
				element.type === 3 ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed,
				{
					command: 'extension.openPackageOnNpm',
					title: '',
					arguments: [element.path]
				});
			result.push(dep);
		});

		return result;

	}

	private Eprst(name: string, description: string) : Dependency[]
	{
		const result : Dependency[] = [];
		
		// список дочерних
		let list; 
		let iconType = 0;
		let lowlevel = false;

		
		if(name === undefined){
			// первый уровень - ГК
			list = tree3.elems;
			iconType = 0;
		}
		
		if(list === undefined)
		{
			// ищем на втором уровне - названия карт
			for (let index = 0; index < tree3.elems.length; index++) {
				const bookmap = tree3.elems[index];
				if(bookmap.name === name )
				{
					list = bookmap.elems;
					iconType = 1;
					break;
				}
				
			}
		}

		if(list === undefined)
		{
			// ищем на третьем уровне - названия чаптеров
			for (let index = 0; index < tree3.elems[0].elems.length; index++) {
				const chapter = tree3.elems[0].elems[index];
				if(chapter.name === name )
				{
					list = chapter.elems;
					iconType = 2;
					break;
				}
				
			}
		}
		if (list === undefined) {
			// ищем на четвертом уровне - названия карт
			for (let index = 0; index < tree3.elems[0].elems.length; index++) {
				const chapter = tree3.elems[0].elems[index];
				for (let index2 = 0; index2 < chapter.elems.length; index2++) {
					const map = chapter.elems[index2];
					if (map.name === name) {
						list = map.elems;
						iconType = 3;
						break;
					}
				}
				if(list !== undefined) { 
					lowlevel = true;
					break;
				}
			}
		}

		// список дочерних не нашли
		if(list === undefined) return result;

		// заполняем листья узла
		list.forEach( (element : {name: string; path: string }) => {
			const dep = new Dependency(element.name, element.path, iconType,
				lowlevel ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed,
				{
					command: 'extension.openPackageOnNpm',
					title: '',
					arguments: [element.path]
				});
			result.push(dep);
		});

		return result;

	}
} 


export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		private readonly version: string,
		private type : number,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		this.tooltip = this.version;
		this.type = type;

		let iconName : string;
		switch (type) {
			case 0:
				iconName = 'dependency';
				break;
			case 1:
				iconName = 'folder';
				break;

			case 2:
				iconName = 'number';
				break;

			case 3:
				iconName = 'document';
				break;

			default:
				break;
		}

		this.iconPath = {
				light: path.join(__filename, '..', '..', 'resources', 'light', `${iconName}.svg`),
				dark: path.join(__filename, '..', '..', 'resources', 'dark', `${iconName}.svg`)
			};
	}

	contextValue = 'dependency';
}

const tree3 = {
	elems: [
		{
			name: 'ar.ditamap',
			path: '',
			type: 0,
			elems: [
				{
					name: 'ch1',
					path: '',
					type: 1,
					elems: [
						{
							name: 'map1',
							path: 'mappath1',
							type: 2,
							elems: [
								{
									name: 'topic1',
									path: 'd:\\DITA2\\TemplatePD\\products\\AR\\_AR-GlosaryList.ditamap',
									elems: [],
									type: 3,
								},
								{
									name: 'topic2',
									path: 'topicpath2',
									type: 3,
								},
								{
									name: 'topic3',
									path: 'topicpath3',
									type: 3,
								}
							]
						},
						{
							name: 'ind_topic1',
							path : 'd:\\DITA2\\TemplatePD\\products\\P5\\topic\\p5-ooutvmib-treb.dita',
							type: 3,
						}
					]
				},
				{
					name: 'ch2',
					type: 1,
					elems: [
						{
							name: 'map2',
							path: 'mappath2',
							type: 2,
							elems: [
								{
									name: 'topic4',
									path: 'topicpath4',
									type: 3,
								}
							]
						},
						{
							name: 'map3',
							path: 'mappath3',
							type: 2,
							elems: [
								{
									name: 'topic5',
									path: 'topicpath5',
									type: 3,
								},
								{
									name: 'topic6',
									path: 'topicpath6',
									type: 3,
								}
							]
						}
					]
				},
				{
					name: 'ch3',
					type: 1,
					elems: [
						{
							name: 'map4',
							path: 'mappath4',
							type: 2,
							elems: []
						},
					]
				},
				{
					name: 'ch4',
					type: 1,
					elems: []
				},
				{
					name: 'ch5',
					type: 1,
					elems: [
						{
							name: 'map5',
							path: 'mappath5',
							type: 2,
							elems: [
								{
									name: 'map6',
									path: 'mappath6',
									type: 2,
									elems: [
										{
											name: 'topic7',
											path: 'topicpath7',
											type: 3,
										}
									]
								}
							]
						},
					]
				},
			]
		}
	]
};
