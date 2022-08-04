//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    //const oldState = vscode.getState() || { tableTitle: String, rows: Number, columns: Number };

    /** @type {string} */
    let tableTitle = '';//oldState.tableTitle;
    /** @type {Number} */
    let rows = 1;//oldState.rows;
    /** @type {Number} */
    let columns = 1;//oldState.columns;

    updateColorList(tableTitle, rows, columns);

    document.querySelector('.add-table').addEventListener('click', () => {
        onCreateTableClicked(tableTitle, rows, columns);
    });

    /**
     * @param {string} title
     * @param {Number} row
     * @param {Number} column
     */
    function updateColorList(title, row, column) {
     

        // таблица
        const dt = document.querySelector('.table-title');
        dt.textContent = 'название';
        const input2 = document.createElement('input');
        input2.className = 'title-input';
        input2.type = 'text';
        if (title == undefined) input2.value = '';
        else input2.value = title;
        //input2.value = title; // проверять пустое нет
        input2.addEventListener('change', (e) => {
            const value = e.target.value;
            tableTitle = value;
            //updateColorList(colors, value, row, column);
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
            //updateColorList(colors, title, value, column);
        });
        dr.appendChild(input3);

        const dc = document.querySelector('.table-column');
        dc.textContent = 'колонки';
        const input4 = document.createElement('input');
        input4.className = 'title-column';
        input4.type = 'number';
        if (column == undefined) input4.value = '';
        else input4.value = column.toString();
        //input4.value = '';
        input4.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            columns = value;
            //updateColorList(colors, title, row, value);
        });
        dc.appendChild(input4);

        // Update the saved state
        //vscode.setState({ tableTitle: title, rows: row, columns: column });
    }

    /** 
     * @param {string} tableTitle 
     * @param {Number} rows 
     * @param {Number} columns 
     */
     function onCreateTableClicked(tableTitle, rows, columns) {
        vscode.postMessage({ type: 'createTable', title: tableTitle, row: rows, column: columns });
    }

}());


