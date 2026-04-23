const xlsx = require('xlsx');

function dumpFile(filename) {
    console.log(`\n--- ${filename} ---`);
    try {
        const workbook = xlsx.readFile(filename);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        console.log(JSON.stringify(data.slice(0, 5), null, 2)); // First 5 rows
    } catch (e) {
        console.error('Error reading', filename, e);
    }
}

dumpFile('mess_menu.xlsx');
dumpFile('mess_timing.xlsx');
