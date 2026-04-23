const Tesseract = require('tesseract.js');
const fs = require('fs');

async function testOCR() {
    try {
        const buffer = fs.readFileSync('debug_uploaded_file.pdf'); 
        console.log("Running Tesseract...");
        const worker = await Tesseract.createWorker('eng');
        const ret = await worker.recognize(buffer);
        console.log("--- RAW OCR TEXT ---");
        console.log(ret.data.text);
        console.log("--------------------");
        await worker.terminate();
    } catch (e) {
        console.error("OCR Error:", e);
    }
}
testOCR();
