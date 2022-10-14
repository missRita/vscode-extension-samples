// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    const vscode = acquireVsCodeApi();

    const counter = /** @type {HTMLElement} */ (document.getElementById('lines-of-code-counter'));
    let globalFilter = '';

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case 'add':
                // добавить в отображение комментарий
                Add(message.content, message.id, message.author, message.date, message.flag, message.icon1, message.icon2);
                break;
            case 'allCommnets':
                Load(message.they, message.filter, message.icon1, message.icon2);
                break;
        }
    });

     // @ts-ignore
     function Load(they, fil, icon1, icon2) {
        globalFilter = fil;

        let ul = document.getElementById('coms');
        
         for (let index = 0; index < they.length; index++) {
            const el = they[index];
    
            //
            let li = document.createElement('li');
            li.setAttribute('comid', el.id);
            li.addEventListener('click', () => {
                vscode.postMessage({ command: 'take', id: el.id});
            }); 
    
            let div = document.createElement('div');
            div.id = 'block0';            

            let div1 = document.createElement('div');
            div1.id = 'block1';
            div1.innerText = el.author;
            
            let filter = document.createElement('a');
            filter.id = 'a1';
            if(globalFilter === '') filter.text = 'фильтровать';
            else filter.text = 'сбросить';
            filter.setAttribute('aut', el.author);
            filter.style.visibility = 'hidden';
            filter.addEventListener('click', () => {
                if(globalFilter === '') {
                    vscode.postMessage({ command: 'filter', author: el.author});
                    globalFilter = el.author;
                }
                else
                vscode.postMessage({ command: 'clear_filter'});
            }); 

            let div2 = document.createElement('div');
            div2.id = 'block2';
            div2.innerHTML = el.date.toString();
    
            let div3 = document.createElement('div');
            div3.id = 'block3';
            div3.innerHTML = el.content;    

            let div4 = document.createElement('div');
            div4.id = 'block4';
        
            let img = document.createElement('img');
            img.id = 'img1';
            if(!el.flag) img.src = icon2;
            else img.src = icon1;
            img.setAttribute('comid', el.id);
            img.setAttribute('fl', el.flag);
            img.addEventListener('click', () => {
                vscode.postMessage({ command: 'done', id: el.id, flag: el.flag});
            });

            let div5 = document.createElement('div');
            div5.id = 'block5';

            const a2 = document.createElement('a');
            a2.id = 'a2';
            a2.text = 'удалить';
            a2.setAttribute('comid', el.id);
            a2.style.visibility = 'hidden';
            a2.addEventListener('click', () => {
                vscode.postMessage({ command: 'remove_single', id: el.id});
            }); 
                
            const a3 = document.createElement('a');
            a3.id = 'a3';
            a3.text = 'удалить все';
            a3.style.visibility = 'hidden';
            a3.addEventListener('click', () => {
                vscode.postMessage({ command: 'delete_all'});
            }); 
            
            div1.appendChild(filter);
            div4.appendChild(img);
            div5.appendChild(a2);
            div5.appendChild(a3);

            div.appendChild(div1);
            div.appendChild(div2);
            div.appendChild(div3);
            div.appendChild(div4);    
            div.appendChild(div5);
    
            li.appendChild(div);
    
            ul?.appendChild(li);
    
            div.addEventListener('mouseover', () => {
                a2.style.visibility = 'visible';
                a3.style.visibility = 'visible';
                filter.style.visibility = 'visible';
            }); 
            div.addEventListener('mouseout', () => {
                a2.style.visibility = 'hidden';
                a3.style.visibility = 'hidden';
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
    * @param {string} icon1
    * @param {string} icon2
    */
    function Add(content, id, author, date, flag, icon1, icon2) {
        const ul = document.getElementById('coms');
        
        let li = document.createElement('li');
        li.setAttribute('comid', id);
        li.addEventListener('click', () => {
            vscode.postMessage({ command: 'take', id: id});
        }); 

        let div = document.createElement('div');
        div.id = 'block0';            

        let div1 = document.createElement('div');
        div1.id = 'block1';
        div1.innerText = author;
        
        let filter = document.createElement('a');
        filter.id = 'a1';
        if(globalFilter === '') filter.text = 'фильтровать';
        else filter.text = 'сбросить';
        filter.setAttribute('aut', author);
        filter.style.visibility = 'hidden';
        filter.addEventListener('click', () => {
            if(globalFilter === '') {
                vscode.postMessage({ command: 'filter', author: author});
                globalFilter = author;
            }
            else
            vscode.postMessage({ command: 'clear_filter'});
        }); 

        let div2 = document.createElement('div');
        div2.id = 'block2';
        div2.innerHTML = date;

        let div3 = document.createElement('div');
        div3.id = 'block3';
        div3.innerHTML = content;

        let div4 = document.createElement('div');
        div4.id = 'block4';

        let img = document.createElement('img');
        img.id = 'img1';
        if(!flag) img.src = icon2;
        else img.src = icon1;
        img.setAttribute('comid', id);
        img.setAttribute('fl', flag.toString());
        img.addEventListener('click', () => {
            vscode.postMessage({ command: 'done', id: id, flag: flag});
        });

        let div5 = document.createElement('div');
        div5.id = 'block5';

        const a2 = document.createElement('a');
        a2.id = 'a2';
        a2.text = 'удалить';
        a2.setAttribute('comid', id);
        a2.style.visibility = 'hidden';
        a2.addEventListener('click', () => {
            vscode.postMessage({ command: 'remove_single', id: id});
        }); 
            
        const a3 = document.createElement('a');
        a3.id = 'a3';
        a3.text = 'удалить все';
        a3.style.visibility = 'hidden';
        a3.addEventListener('click', () => {
            vscode.postMessage({ command: 'delete_all'});
        }); 
        
        div1.appendChild(filter);
        div4.appendChild(img);
        div5.appendChild(a2);
        div5.appendChild(a3);

        div.appendChild(div1);
        div.appendChild(div2);
        div.appendChild(div3);
        div.appendChild(div4);    
        div.appendChild(div5);

        li.appendChild(div);

        ul?.appendChild(li);

        div.addEventListener('mouseover', () => {
            a2.style.visibility = 'visible';
            a3.style.visibility = 'visible';
            filter.style.visibility = 'visible';
        }); 
        div.addEventListener('mouseout', () => {
            a2.style.visibility = 'hidden';
            a3.style.visibility = 'hidden';
            filter.style.visibility = 'hidden';
        }); 
        //
    }

}());
