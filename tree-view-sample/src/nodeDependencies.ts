import * as vscode from 'vscode';
import * as path from 'path';
import * as uuid from 'uuid';

export class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;

	constructor() {
		// добавим id в дерево


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
		//const a = this.Eprst2(element.label);
		const a = this.Eprst2(element.gid);
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
		let id;
		const lowlevel = false;

		
		if(name === undefined){
			// первый уровень - ГК
			list = tree3.elems;
			iconType = 0;
			//id = uuid.v4();
		}
		
		else 
		{
			go(tree3.elems);

			// на вход список elems любого уровня, внутри заполняется list - список его детей
			function go(somelist: any): void {

				// может быть пустой или вообще не добавлен
				if(somelist === undefined) return;

				// пробегаемся по каждому в списке
				for (let i = 0; i < somelist.length; i++) {
					const el = somelist[i];
					if (el.id === name) {
						list =  el.elems;
						//id = uuid.v4();
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
		list.forEach( (element : {name: string; path: string, type: number, id: string }) => {
			const dep = new Dependency(element.name, element.path, element.type, element.id,
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

} 


export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		private readonly version: string,
		private type : number,
		public gid : string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
		
	) {
		super(label, collapsibleState);

		this.tooltip = this.version;
		//this.type = type;
		//this.gid = gid;

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

		//this.description = gid;
		this.gid = gid;
	}

	contextValue = 'dependency';
}

const tree3 = {
	elems: [
		{
			name: 'ЦЕНТРАЛЬНЫЙ БАНК РОССИЙСКОЙ ФЕДЕРАЦИИ',
			path: '',
			type: 0,
			id: '1',
			elems: [
				{
					name: 'frontmatter',
					path: 'mappath1',
					type: 1,
					id: '2',
					elems: [
						{
							name: 'Глоссарий',
							path: 'mappath2',
							type: 2,
							id: '3',
							elems: [
								{
									name: 'Архитектурное решение',
									path: 'd:\\DITA2\\TemplatePD\\products\\AR\\_AR-GlosaryList.ditamap',
									elems: [],
									type: 3,
									id: '4',
								},
								{
									name: 'Автоматизированная система',
									path: 'topicpath2',
									type: 3,
									id: '5',
								},
								{
									name: 'Информационные технологии',
									path: 'topicpath3',
									type: 3,
									id: '6',
								},
								{
									name: 'Информационно-телекоммуникационная система',
									path: 'topicpath4',
									type: 3,
									id: '7',
								}
							]
						},
						{
							name: 'Термины и определения',
							path: 'mappath3',
							type: 2,
							id: '8',
							elems: [
								{
									name: 'Архитектурное решение',
									path: 'topicpath5',
									elems: [],
									type: 3,
									id: '9',
								},
								{
									name: 'Автоматизированная система',
									path: 'topicpath6',
									type: 3,
									id: '10',
								},
								{
									name: 'Условно-графические обозначения',
									path: 'topicpath7',
									type: 3,
									id: '11',
								}
							]
						},
						{
							name: 'predislovie.dita',
							path : 'd:\\DITA2\\TemplatePD\\products\\P5\\topic\\p5-ooutvmib-treb.dita',
							type: 3,
							id: '12',
						}
					]
				},
				{
					name: 'Общие сведения',
					type: 1,
					id: '13',
					elems: [
						{
							name: 'Общие сведения2',
							path: 'mappath4',
							type: 2,
							id: '14',
							elems: [
								{
									name: 'Постановка задачи',
									path: 'topicpath8',
									type: 3,
									id: '15',
								},
								{
									name: 'Назначение ИТ-решения',
									path: 'topicpath9',
									type: 3,
									id: '16',
								},
								{
									name: 'Анализ функциональных требований',
									path: 'topicpath10',
									type: 3,
									id: '17',
								}
							]
						}
					]
				},
				{
					name: 'Верхнеуровневая архитектура ИТ-решения',
					type: 1,
					id: '18',
					elems: [
						{
							name: 'Верхнеуровневая архитектура ИТ-решения2',
							path: 'mappath5',
							type: 2,
							id: '19',
							elems: [
								{
									name: 'Целевая архитектура ИТ-решения',
									path: 'topicpath11',
									type: 3,
									id: '20',
								},
								{
									name: 'Транзитная архитектура ИТ-решения',
									path: 'topicpath12',
									type: 3,
									id: '21',
								}
							]
						}
					]
				},
				{
					name: 'Перечень вопросов, требующих дополнительной проработки2',
					type: 1,
					id: '22',
					elems: [
						{
							name: 'Перечень вопросов, требующих дополнительной проработки',
							path: 'mappath6',
							type: 2,
							id: '23',
							elems: []
						}
					]
				},
				{
					name: 'appendices',
					type: 1,
					id: '24',
					elems: [
						{
							name: 'appendix',
							path: 'mappath7',
							type: 2,
							id: '25',
							elems: [
								{
									name: 'Используемые в документе условно-графические обозначения',
									path: 'mappath13',
									type: 3,
									id: '26',
								}
							]
						},
						{
							name: 'appendix2',
							path: 'mappath8',
							type: 2,
							id: '27',
							elems: [
								{
									name: 'Дополнительная информация',
									path: 'mappath14',
									type: 3,
									id: '28'
								}
							]
						},
					]
				},
			]
		}
	]
};
