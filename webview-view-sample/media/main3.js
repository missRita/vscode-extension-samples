//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    const oldState = vscode.getState() || { colors: [], tableTitle: String, rows: Number, columns: Number };

    /** @type {Array<{ value: string }>} */
    let colors = oldState.colors;

    /** @type {string} */
    let tableTitle = oldState.tableTitle;
    /** @type {Number} */
    let rows = oldState.rows;
    /** @type {Number} */
    let columns = oldState.columns;

    updateColorList(colors, tableTitle, rows, columns);

    document.querySelector('.add-color-button').addEventListener('click', () => {
        addColor();
    });

    document.querySelector('.add-table').addEventListener('click', () => {
        onCreateTableClicked(tableTitle, rows, columns);
    });

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'addColor':
                {
                    addColor();
                    break;
                }
            case 'clearColors':
                {
                    colors = [];
                    updateColorList(colors, tableTitle, rows, columns);
                    break;
                }

        }
    });

    /**
     * @param {Array<{ value: string }>} colors
     * @param {string} title
     * @param {Number} row
     * @param {Number} column
     */
    function updateColorList(colors, title, row, column) {
        const ul = document.querySelector('.color-list');
        ul.textContent = '';
        for (const color of colors) {
            const li = document.createElement('li');
            li.className = 'color-entry';

            const colorPreview = document.createElement('div');
            colorPreview.className = 'color-preview';
            colorPreview.style.backgroundColor = `#${color.value}`;
            colorPreview.addEventListener('click', () => {
                onColorClicked(color.value);
            });
            li.appendChild(colorPreview);

            const input = document.createElement('input');
            input.className = 'color-input';
            input.type = 'text';
            input.value = color.value;
            input.addEventListener('change', (e) => {
                const value = e.target.value;
                if (!value) {
                    // Treat empty value as delete
                    colors.splice(colors.indexOf(color), 1);
                } else {
                    color.value = value;
                }
                updateColorList(colors,title, row, column);
            });
            li.appendChild(input);

            ul.appendChild(li);
        }

        

        // таблица
        const dt = document.querySelector('.table-title');
        dt.textContent = 'Создать';
        const input2 = document.createElement('input');
        input2.className = 'title-input';
        input2.type = 'text';
        if (title == undefined) input2.value = '';
        else input2.value = title;
        //input2.value = title; // проверять пустое нет
        input2.addEventListener('change', (e) => {
            const value = e.target.value;
            tableTitle = value;
            updateColorList(colors, value, row, column);
        });
        dt.appendChild(input2);
        
        const dr = document.querySelector('.table-row');
        dr.textContent = 'строки';
        const input3 = document.createElement('input');
        input3.className = 'title-row';
        input3.type = 'number';
        if (row == undefined) input3.value = '';
        else input3.value = row.toString();
        //input3.value = ''; // row.toString(); проверять пустое нет. 
        input3.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            rows = value;
            updateColorList(colors, title, value, column);
        });
        dr.appendChild(input3);

        const dc = document.querySelector('.table-column');
        dc.textContent = 'колонки';
        const input4 = document.createElement('input');
        input4.className = 'title-column';
        input4.type = 'text';
        if (column == undefined) input4.value = '';
        else input4.value = column.toString();
        //input4.value = '';
        input4.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            columns = value;
            updateColorList(colors, title, row, value);
        });
        dc.appendChild(input4);

        // Update the saved state
        vscode.setState({ colors: colors, tableTitle: title, rows: row, columns: column });
    }

    /** 
     * @param {string} color 
     */
    function onColorClicked(color) {
        vscode.postMessage({ type: 'colorSelected', value: color });
    }

    /** 
     * @param {string} tableTitle 
     * @param {Number} rows 
     * @param {Number} columns 
     */
     function onCreateTableClicked(tableTitle, rows, columns) {
        vscode.postMessage({ type: 'createTable', title: tableTitle, row: rows, column: columns });
    }

    /**
     * @returns string
     */
    function getNewCalicoColor() {
        const colors = ['020202', 'f1eeee', 'a85b20', 'daab70', 'efcb99'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function addColor() {
        colors.push({ value: getNewCalicoColor() });
        updateColorList(colors, tableTitle, rows, columns);
    }
}());


