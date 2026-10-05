import fs from 'fs/promises';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extractTextFromPDF(filePath) {
  const data = await fs.readFile(filePath);
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(data) }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    text += strings.join(' ') + '\n';
  }
  return text;
}

extractTextFromPDF('../Sandy_Singh_Resume.pdf')
  .then(text => console.log('Extracted:', text.substring(0, 100)))
  .catch(err => console.error('Error:', err));
