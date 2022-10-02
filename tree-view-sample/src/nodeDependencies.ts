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

	getChildren(element?: Dependency): Thenable<Dependency[]> {
		if(element === undefined)
		{
			const b = this.Eprst(undefined);
			return Promise.resolve(b);
		}
		const a = this.Eprst(element.label);
		return Promise.resolve(a);

/* 
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}


		if (element) {
			return Promise.resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')));
		} else {
			const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
			if (this.pathExists(packageJsonPath)) {
				return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
			} else {
				vscode.window.showInformationMessage('Workspace has no package.json');
				return Promise.resolve([]);
			}
		} */

	}

	private Eprst(name: string) : Dependency[]
	{
		const result : Dependency[] = [];
		
		// список дочерних
		let list; 
		let iconType = 0;
		let lowlevel = false;

		//if(tree3.bookmap.name === name){
		if(name === undefined){
			list = tree3.bookmap.elems;
			iconType = 0;
		}
		if(list === undefined)
		{
			// ищем на втором уровне - названия чаптеров
			for (let index = 0; index < tree3.bookmap.elems.length; index++) {
				const chapter = tree3.bookmap.elems[index];
				if(chapter.name === name )
				{
					list = chapter.elems;
					iconType = 1;
					break;
				}
				
			}
		}
		if (list === undefined) {
			// ищем на втором уровне - названия карт
			for (let index = 0; index < tree3.bookmap.elems.length; index++) {
				const chapter = tree3.bookmap.elems[index];
				for (let index2 = 0; index2 < chapter.elems.length; index2++) {
					const map = chapter.elems[index2];
					if (map.name === name) {
						list = map.elems;
						iconType = 2;
						break;
					}
				}
				if(list !== undefined) { 
					lowlevel = true;
					break;
				}
			}
		}

/* 		if (list === undefined) {
			// ищем на третьем уровне - конкретный топик
			for (let index = 0; index < tree3.bookmap.elems.length; index++) {
				const chapter = tree3.bookmap.elems[index];
				for (let index2 = 0; index2 < chapter.elems.length; index2++) {
					const map = chapter.elems[index2];
					for (let index3 = 0; index3 < map.elems.length; index3++) {
						if (map[index3].name === name) {
							//
							const dep = new Dependency(name, 'opop', vscode.TreeItemCollapsibleState.None);
							result.push(dep);
							return result;
						}
					}
				}
			}
		} */
		if(list === undefined) return result;

		list.forEach( (element : {name: string; path: string }) => {
			const dep = new Dependency(element.name, element.path, iconType, lowlevel ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed,
				{
					command: 'extension.openPackageOnNpm',
					title: '',
					arguments: [element.path]
				});
			result.push(dep);
		});

		return result;

	}


	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	/* 	
private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
		if (this.pathExists(packageJsonPath)) {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

			const toDep = (moduleName: string, version: string): Dependency => {
				if (this.pathExists(path.join(this.workspaceRoot, 'node_modules', moduleName))) {
					return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.Collapsed);
				} else {
					return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None, {
						command: 'extension.openPackageOnNpm',
						title: '',
						arguments: [moduleName]
					});
				}
			};

			const deps = packageJson.dependencies
				? Object.keys(packageJson.dependencies).map(dep => toDep(dep, packageJson.dependencies[dep]))
				: [];
			const devDeps = packageJson.devDependencies
				? Object.keys(packageJson.devDependencies).map(dep => toDep(dep, packageJson.devDependencies[dep]))
				: [];
			return deps.concat(devDeps);
		} else {
			return [];
		}
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}*/
} 


export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		private readonly version: string,
		//private readonly description : string,
		private iconW : number,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		this.tooltip = `${this.label}-${this.version}`;
		//this.description = this.version;
		this.iconW = iconW;

		if(iconW === 0 ){
			this.iconPath = {
				light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
				dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
			};
		}
		if(iconW === 1 ){
			this.iconPath = {
				light: path.join(__filename, '..', '..', 'resources', 'light', 'folder.svg'),
				dark: path.join(__filename, '..', '..', 'resources', 'dark', 'folder.svg')
			};
		}
		if(iconW === 2 ){
			this.iconPath = {
				light: path.join(__filename, '..', '..', 'resources', 'light', 'number.svg'),
				dark: path.join(__filename, '..', '..', 'resources', 'dark', 'number.svg')
			};
		}
	}

	

/* 	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	}; */

	contextValue = 'dependency';
}

const tree3 = {
	bookmap: {
		name: 'ar.ditamap',
		path: '',
		elems: [
			{
				name: 'ch1',
				path: '',
				elems: [
					{
						name: 'map1',
						path: 'mappath1',
						elems: [
							{
								name: 'topic2',
								path: 'topicpath2',
								elems: []
							},
							{
								name: 'topic2',
								path: 'topicpath2'
							},
							{
								name: 'topic3',
								path: 'topicpath3'
							}
						]
					}
				]
			},
			{
				name: 'ch2',
				elems: [
					{
						name: 'map2',
						path: 'mappath2',
						elems: [
							{
								name: 'topic4',
								path: 'topicpath4'
							}
						]
					},
					{
						name: 'map3',
						path: 'mappath3',
						elems: [
							{
								name: 'topic5',
								path: 'topicpath5'
							},
							{
								name: 'topic6',
								path: 'topicpath6'
							}
						]
					}
				]
			},
			{
				name: 'ch3',
				elems: [
					{
						name: 'map4',
						path: 'mappath4',
						elems: []
					},
				]
			},
			{
				name: 'ch4',
				elems: []
			},
		]
	}
};
