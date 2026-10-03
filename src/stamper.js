import { PDFDocument } from 'pdf-lib';

/**
 * Adds visual signature fields to a PDF document.
 * @param {Buffer} pdfBuffer 
 * @param {Array<{page: number, x: number, y: number, width: number, height: number, imageBase64: string}>} fields 
 * @returns {Promise<Buffer>}
 */
export async function addVisualFields(pdfBuffer, fields = []) {
  if (!fields.length) return pdfBuffer;

  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();

  for (const field of fields) {
    const pageIndex = field.page - 1;
    const page = pages[pageIndex];
    if (!page) continue;

    const { height: pageHeight } = page.getSize();
    const rawImageBytes = Buffer.from(
      field.imageBase64.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );

    const image = await pdfDoc.embedPng(rawImageBytes);
    const pdfY = pageHeight - field.y - field.height;

    page.drawImage(image, {
      x: field.x,
      y: pdfY,
      width: field.width,
      height: field.height,
    });
  }

  const savedBytes = await pdfDoc.save();
  return Buffer.from(savedBytes);
}