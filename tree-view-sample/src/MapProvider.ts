import * as vscode from 'vscode';
import * as path from 'path';

export class MapProvider implements vscode.TreeDataProvider<Dependency> {

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

	getChildren(element?: Dependency): Thenable<Dependency[]> {
		if(element === undefined)
		{
			const b = this.TreeGetChilds(undefined, 1);
			return Promise.resolve(b);
		}
		const a = this.TreeGetChilds(element.gid, element.type);
		return Promise.resolve(a);
	}

	private TreeGetChilds(id: string, type: number) : Dependency[]
	{
		const result : Dependency[] = [];
		
		// список дочерних
		let list;
		
		if(id === undefined){
			// первый уровень - ГК
			let title = tree3.navTitle;
			if(title === '') title = tree3.fileName; // TODO short

			const dep = new Dependency(title, tree3.fileName, tree3.type, tree3.id,
				tree3.type === 2 ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed,
				{
					command: 'dita-vs-code.openFile',
					title: '',
					arguments: [tree3.fileName]
				});
			result.push(dep);
			return result;
		}
		
		else 
		{
			if(type !== 0) go(tree3.elems);
			else list = tree3.elems;

			// на вход список elems любого уровня, внутри заполняется list - список его детей
			function go(somelist: any): void {

				// может быть пустой или вообще не добавлен
				if(somelist === undefined) return;

				// пробегаемся по каждому в списке
				for (let i = 0; i < somelist.length; i++) {
					const el = somelist[i];
					if (el.id === id) {
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
		list.forEach( (element : {navTitle: string; fileName: string, type: number, id: string }) => {
			const dep = new Dependency(element.navTitle, element.fileName, element.type, element.id,
				element.type === 3 ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed,
				{
					command: 'dita-vs-code.openFile',
					title: '',
					arguments: [element.fileName]
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
		public type : number,
		public gid : string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
		
	) {
		super(label, collapsibleState);

		this.tooltip = this.version;

		let iconName : string;
		switch (type) {
			case 0:
				iconName = 'boolean';
				break;
			case 1:
				iconName = 'string';
				break;

			case 2:
				iconName = 'dependency';
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

		this.gid = gid;
	}

	contextValue = 'dependency';
}

const tree3 = {

			navTitle: 'ЦЕНТРАЛЬНЫЙ БАНК РОССИЙСКОЙ ФЕДЕРАЦИИ',
			fileName: '',
			type: 0,
			id: '1',
			elems: [
				{
					navTitle: 'frontmatter',
					fileName: 'mapfilename1',
					type: 1,
					id: '2',
					elems: [
						{
							navTitle: 'Глоссарий',
							fileName: 'mapfilename2',
							type: 2,
							id: '3',
							elems: [
								{
									navTitle: 'Архитектурное решение',
									fileName: 'd:\\DITA2\\TemplatePD\\products\\AR\\_AR-GlosaryList.ditamap',
									elems: [],
									type: 3,
									id: '4',
								},
								{
									navTitle: 'Автоматизированная система',
									fileName: 'topicfilename2',
									type: 3,
									id: '5',
								},
								{
									navTitle: 'Информационные технологии',
									fileName: 'topicfilename3',
									type: 3,
									id: '6',
								},
								{
									navTitle: 'Информационно-телекоммуникационная система',
									fileName: 'topicfilename4',
									type: 3,
									id: '7',
								}
							]
						},
						{
							navTitle: 'Термины и определения',
							fileName: 'mapfilename3',
							type: 2,
							id: '8',
							elems: [
								{
									navTitle: 'Архитектурное решение',
									fileName: 'topicfilename5',
									elems: [],
									type: 3,
									id: '9',
								},
								{
									navTitle: 'Автоматизированная система',
									fileName: 'topicfilename6',
									type: 3,
									id: '10',
								},
								{
									navTitle: 'Условно-графические обозначения',
									fileName: 'topicfilename7',
									type: 3,
									id: '11',
								}
							]
						},
						{
							navTitle: 'predislovie.dita',
							fileName : 'd:\\DITA2\\TemplatePD\\products\\P5\\topic\\p5-ooutvmib-treb.dita',
							type: 3,
							id: '12',
						}
					]
				},
				{
					navTitle: 'Общие сведения',
					type: 1,
					id: '13',
					elems: [
						{
							navTitle: 'Общие сведения2',
							fileName: 'mapfilename4',
							type: 2,
							id: '14',
							elems: [
								{
									navTitle: 'Постановка задачи',
									fileName: 'topicfilename8',
									type: 3,
									id: '15',
								},
								{
									navTitle: 'Назначение ИТ-решения',
									fileName: 'topicfilename9',
									type: 3,
									id: '16',
								},
								{
									navTitle: 'Анализ функциональных требований',
									fileName: 'topicfilename10',
									type: 3,
									id: '17',
								}
							]
						}
					]
				},
				{
					navTitle: 'Верхнеуровневая архитектура ИТ-решения',
					type: 1,
					id: '18',
					elems: [
						{
							navTitle: 'Верхнеуровневая архитектура ИТ-решения2',
							fileName: 'mapfilename5',
							type: 2,
							id: '19',
							elems: [
								{
									navTitle: 'Целевая архитектура ИТ-решения',
									fileName: 'topicfilename11',
									type: 3,
									id: '20',
								},
								{
									navTitle: 'Транзитная архитектура ИТ-решения',
									fileName: 'topicfilename12',
									type: 3,
									id: '21',
								}
							]
						}
					]
				},
				{
					navTitle: 'Перечень вопросов, требующих дополнительной проработки2',
					type: 1,
					id: '22',
					elems: [
						{
							namnavTitlee: 'Перечень вопросов, требующих дополнительной проработки',
							fileName: 'mapfilename6',
							type: 2,
							id: '23',
							elems: []
						}
					]
				},
				{
					navTitle: 'appendices',
					type: 1,
					id: '24',
					elems: [
						{
							navTitle: 'appendix',
							fileName: 'mapfilename7',
							type: 2,
							id: '25',
							elems: [
								{
									navTitle: 'Используемые в документе условно-графические обозначения',
									fileName: 'mapfilename13',
									type: 3,
									id: '26',
								}
							]
						},
						{
							navTitle: 'appendix2',
							fileName: 'mapfilename8',
							type: 2,
							id: '27',
							elems: [
								{
									navTitle: 'Дополнительная информация',
									fileName: 'mapfilename14',
									type: 3,
									id: '28'
								}
							]
						},
					]
				},
			]

};
