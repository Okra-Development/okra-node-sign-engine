import { PDFDocument, PDFName, PDFString, PDFArray, PDFDict } from 'pdf-lib';
import { signpdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';

export async function addPlaceholder(pdfBuffer, options = {}) {
  const {
    reason = 'Firma Digital',
    location = '',
    name = 'Okra Sign Engine',
    signatureLength = 16384,
  } = options;

  const pdfDoc = await PDFDocument.load(pdfBuffer);

  const signatureDict = pdfDoc.context.obj({
    Type: 'Sig',
    Filter: 'Adobe.PPKLite',
    SubFilter: 'adbe.pkcs7.detached',
    ByteRange: [0, '0000000000', '0000000000', '0000000000'],
    Contents: PDFString.of('0'.repeat(signatureLength)),
    Reason: PDFString.of(reason),
    Location: PDFString.of(location),
    Name: PDFString.of(name),
    M: PDFString.fromDate(new Date()),
  });

  const signatureRef = pdfDoc.context.register(signatureDict);

  const widgetDict = pdfDoc.context.obj({
    Type: 'Annot',
    Subtype: 'Widget',
    FT: 'Sig',
    Rect: [0, 0, 0, 0],
    V: signatureRef,
    T: PDFString.of('Signature1'),
    F: 4,
  });

  const widgetRef = pdfDoc.context.register(widgetDict);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  let annots = firstPage.node.lookup(PDFName.of('Annots'), PDFArray);
  if (!annots) {
    annots = pdfDoc.context.obj([]);
    firstPage.node.set(PDFName.of('Annots'), annots);
  }
  annots.push(widgetRef);

  let acroForm = pdfDoc.catalog.lookup(PDFName.of('AcroForm'), PDFDict);
  if (!acroForm) {
    acroForm = pdfDoc.context.obj({
      Fields: [widgetRef],
      SigFlags: 3,
    });
    pdfDoc.catalog.set(PDFName.of('AcroForm'), acroForm);
  } else {
    let fields = acroForm.lookup(PDFName.of('Fields'), PDFArray);
    if (!fields) {
      fields = pdfDoc.context.obj([]);
      acroForm.set(PDFName.of('Fields'), fields);
    }
    fields.push(widgetRef);
    acroForm.set(PDFName.of('SigFlags'), pdfDoc.context.obj(3));
  }

  const savedBytes = await pdfDoc.save({ useObjectStreams: false });
  return Buffer.from(savedBytes);
}

export async function signCryptographic(pdfBuffer, options) {
  const { p12Buffer, passphrase, reason, location, signatureLength } = options;

  const pdfWithPlaceholder = await addPlaceholder(pdfBuffer, {
    reason,
    location,
    signatureLength,
  });

  const p12Signer = new P12Signer({
    p12Buffer,
    passphrase,
  });

  const signedPdfBuffer = await signpdf.sign(pdfWithPlaceholder, p12Signer);

  return Buffer.from(signedPdfBuffer);
}