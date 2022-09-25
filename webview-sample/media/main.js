// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    const vscode = acquireVsCodeApi();

    const counter = /** @type {HTMLElement} */ (document.getElementById('lines-of-code-counter'));

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case 'refactor':
                // добавить в отображение комментарий
                Add(message.content, message.id);
                break;
            case 'coms':
                Load(message.they);
                break;
        }
    });

    /**
    //* @param {} they
    */
     // @ts-ignore
     function Load(they) {
        const div = document.getElementById('coms');
        
        for (let index = 0; index < they.length; index++) {
            const element = they[index];
    
            let newp = document.createElement('p');
            newp.innerHTML = element.content;
            newp.setAttribute('comid', element.id)
    
            div?.appendChild(newp);
    
            const button = document.createElement('button');
            button.innerHTML = 'удалить';
            button.setAttribute('comid', element.id)
            button.addEventListener('click', () => {
                vscode.postMessage({ command: 'remove', id: element.id});
            }); 
            div?.appendChild(button);
        }
    }

    /**
    * @param {string} content
    * @param {string} id
    */
    function Add(content, id) {
        const div = document.getElementById('coms');
        
        let newp = document.createElement('p');
        newp.innerHTML = content;
        newp.setAttribute('comid', id)

        div?.appendChild(newp);

        const button = document.createElement('button');
        button.innerHTML = 'удалить';
        button.setAttribute('comid', id)
        button.addEventListener('click', () => {
            vscode.postMessage({ command: 'remove', id: id});
        }); 
        div?.appendChild(button);

        //vscode.postMessage({ command: 'remove', id: id});
    }

}());
