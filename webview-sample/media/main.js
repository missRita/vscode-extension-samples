// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    const vscode = acquireVsCodeApi();

    const counter = /** @type {HTMLElement} */ (document.getElementById('lines-of-code-counter'));

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case 'add':
                // добавить в отображение комментарий
                Add(message.content, message.id, message.author, message.date, message.flag);
                break;
            case 'allCommnets':
                Load(message.they);
                break;
        }
    });

     // @ts-ignore
     function Load(they) {
        let ul = document.getElementById('coms');
        //ul?..setProperty('listStyle', 'none');
        
         for (let index = 0; index < they.length; index++) {
            const el = they[index];
    
            //
            let li = document.createElement('li');
            li.setAttribute('comid', el.id);
            li.addEventListener('click', () => {
                vscode.postMessage({ command: 'take', id: el.id});
            }); 
    
            let div = document.createElement('div');
    
            let p1 = document.createElement('p');
            p1.innerHTML = el.content;
    
            let p2 = document.createElement('p');
            p2.innerHTML = el.author;
    
            let p3 = document.createElement('p');
            p3.innerHTML = el.date;
    
            const button = document.createElement('button');
            button.innerHTML = 'удалить';
            button.setAttribute('comid', el.id);
            button.style.visibility = 'hidden';
            button.addEventListener('click', () => {
                vscode.postMessage({ command: 'remove_single', id: el.id});
            }); 
            
            let a = document.createElement('a');
            if(!el.flag) a.text = 'Готово';
            else a.text = 'Не готово';
            a.setAttribute('comid', el.id);
            a.setAttribute('fl', el.flag);
            a.addEventListener('click', () => {
                vscode.postMessage({ command: 'done', id: el.id, flag: el.flag});
            }); 
    
            let filter = document.createElement('a');
            filter.text = 'Показывать только этого автора';
            filter.setAttribute('aut', el.author);
            filter.style.visibility = 'hidden';
            filter.addEventListener('click', () => {
                vscode.postMessage({ command: 'filter', author: el.author});
            }); 
    
            let clearFilter = document.createElement('a');
            clearFilter.text = 'сбросить фильтр';
            clearFilter.style.visibility = 'hidden';
            clearFilter.addEventListener('click', () => {
                vscode.postMessage({ command: 'clear_filter'});
            }); 
    
            const button2 = document.createElement('button');
            button2.innerHTML = 'удалить все';
            button2.style.visibility = 'hidden';
            button2.addEventListener('click', () => {
                vscode.postMessage({ command: 'delete_all'});
            }); 
            
            //p.setAttribute('comid', id)
            div.appendChild(p1);
            div.appendChild(p2);
            div.appendChild(p3);
            div.appendChild(a);
    
            div.appendChild(button);
            div.appendChild(filter);
            div.appendChild(clearFilter);
    
            div.appendChild(button2);
    
            li.appendChild(div);
    
            ul?.appendChild(li);
    
            div.addEventListener('mouseover', () => {
                button2.style.visibility = 'visible';
                button.style.visibility = 'visible';
                clearFilter.style.visibility = 'visible';
                filter.style.visibility = 'visible';
            }); 
            div.addEventListener('mouseout', () => {
                button2.style.visibility = 'hidden';
                button.style.visibility = 'hidden';
                clearFilter.style.visibility = 'hidden';
                filter.style.visibility = 'hidden';
            }); 
            //
        } 
    }

    /**
    * @param {string} content
    * @param {string} id
    * @param {string} author
    * @param {string} date
    * @param {boolean} flag
    */
    function Add(content, id, author, date, flag) {
        const ul = document.getElementById('coms');
        
        let li = document.createElement('li');
        li.setAttribute('comid', id);
        li.addEventListener('click', () => {
            vscode.postMessage({ command: 'take', id: id});
        }); 

        let div = document.createElement('div');

        let p1 = document.createElement('p');
        p1.innerHTML = content;

        let p2 = document.createElement('p');
        p2.innerHTML = author;

        let p3 = document.createElement('p');
        p3.innerHTML = date;

        const button = document.createElement('button');
        button.innerHTML = 'удалить';
        button.setAttribute('comid', id);
        button.style.visibility = 'hidden';
        button.addEventListener('click', () => {
            vscode.postMessage({ command: 'remove', id: id});
        }); 
        
        let a = document.createElement('a');
        a.text = 'Готово';
        a.setAttribute('comid', id);
        a.addEventListener('click', () => {
            vscode.postMessage({ command: 'done', id: id});
        }); 

        let filter = document.createElement('a');
        filter.text = 'Показывать только этого автора';
        filter.setAttribute('aut', author);
        filter.style.visibility = 'hidden';
        filter.addEventListener('click', () => {
            vscode.postMessage({ command: 'filter', author: author});
        }); 

        let clearFilter = document.createElement('a');
        clearFilter.text = 'сбросить фильтр';
        clearFilter.style.visibility = 'hidden';
        clearFilter.addEventListener('click', () => {
            vscode.postMessage({ command: 'clear'});
        }); 

        const button2 = document.createElement('button');
        button2.innerHTML = 'удалить все';
        button2.style.visibility = 'hidden';
        button2.addEventListener('click', () => {
            vscode.postMessage({ command: 'delete'});
        }); 
        
        //p.setAttribute('comid', id)
        div.appendChild(p1);
        div.appendChild(p2);
        div.appendChild(p3);
        div.appendChild(a);

        div.appendChild(button);
        div.appendChild(filter);
        div.appendChild(clearFilter);

        div.appendChild(button2);

        li.appendChild(div);

        ul?.appendChild(li);

        div.addEventListener('mouseover', () => {
            button2.style.visibility = 'visible';
            button.style.visibility = 'visible';
            clearFilter.style.visibility = 'visible';
            filter.style.visibility = 'visible';
        }); 
        div.addEventListener('mouseout', () => {
            button2.style.visibility = 'hidden';
            button.style.visibility = 'hidden';
            clearFilter.style.visibility = 'hidden';
            filter.style.visibility = 'hidden';
        }); 
    }

}());
