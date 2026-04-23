import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
import * as xlsx from 'xlsx';
import { parseMessMenuText } from '@/lib/parsers/messMenuParser';
import { verifyAuth } from '@/lib/api-middleware';

export async function POST(request: Request) {
  try {
    // Security: Only Representative or Admin can upload menus
    const authResult = await verifyAuth(request, ['representative', 'admin']);
    if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = '';
    const fileName = file.name.toLowerCase();
    
    const isImage = file.type.startsWith('image/') || fileName.endsWith('.jpg') || fileName.endsWith('.png') || fileName.endsWith('.jpeg');
    const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf') || file.type === 'application/octet-stream';
    const isExcel = fileName.endsWith('.xlsx') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (isPdf && !isImage) {
      try {
         const pdfData = await require('pdf-parse-new')(buffer);
         extractedText = pdfData.text || '';
      } catch (e: any) {
         console.warn("[PDF PARSE ISSUE]", e.message);
         extractedText = ''; 
      }
    } else if (isImage) {
      try {
         const worker = await Tesseract.createWorker('eng');
         const ret = await worker.recognize(buffer);
         extractedText = ret.data.text;
         await worker.terminate();
      } catch (e: any) {
         console.warn("[OCR ISSUE]", e.message);
         extractedText = '';
      }
    } else if (isExcel) {
      try {
         const workbook = xlsx.read(buffer, { type: 'buffer' });
         const firstSheetName = workbook.SheetNames[0];
         const worksheet = workbook.Sheets[firstSheetName];
         const csvText = xlsx.utils.sheet_to_csv(worksheet);
         extractedText = csvText.replace(/,/g, '\n');
      } catch (e: any) {
         console.warn("[EXCEL PARSE ISSUE]", e.message);
         extractedText = '';
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a .pdf, .jpg, .png or .xlsx' }, { status: 400 });
    }

    const parsedData = parseMessMenuText(extractedText);

    return NextResponse.json({ 
      success: true, 
      parsedData,
      rawText: extractedText 
    });

  } catch (error: any) {
    console.error('Error processing file:', error);
    const emptyGrid = parseMessMenuText('');
    return NextResponse.json({ 
        success: true, 
        parsedData: emptyGrid,
        rawText: '',
        warning: 'An unexpected error occurred during OCR. You can enter the menu manually.'
    });
  }
}
