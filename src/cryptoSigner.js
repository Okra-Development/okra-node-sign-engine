import { PDFDocument } from 'pdf-lib';
import * as pdfLibPlaceholderModule from '@signpdf/placeholder-pdf-lib';
import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';

function getPlaceholderFunction(mod) {
  if (typeof mod === 'function') return mod;

  const targets = [mod, mod?.default].filter(Boolean);
  const candidateNames = [
    'pdflibAddPlaceholder',
    'pdfLibAddPlaceholder',
    'addPlaceholder',
    'placeholderPdfLib',
  ];

  for (const target of targets) {
    if (typeof target === 'function') return target;
    for (const name of candidateNames) {
      if (typeof target[name] === 'function') return target[name];
    }
  }

  for (const target of targets) {
    for (const key of Object.keys(target)) {
      if (typeof target[key] === 'function') {
        return target[key];
      }
    }
  }

  throw new Error(
    'The function to generate the placeholder was not found in @signpdf/placeholder-pdf-lib.'
  );
}

export async function signCryptographic(pdfBuffer, options = {}) {
  if (!pdfBuffer) {
    throw new TypeError('The "pdfBuffer" argument must be provided as a Buffer or Uint8Array.');
  }

  const {
    p12Buffer,
    passphrase,
    reason = 'Digital Signature',
    location = '',
    name = 'Okra Sign Engine',
    signatureLength = 16384,
  } = options;

  if (!p12Buffer) {
    throw new TypeError('The "p12Buffer" option must be provided as a Buffer or Uint8Array.');
  }

  const pdflibAddPlaceholder = getPlaceholderFunction(pdfLibPlaceholderModule);

  const inputPdfBuffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
  const inputP12Buffer = Buffer.isBuffer(p12Buffer) ? p12Buffer : Buffer.from(p12Buffer);

  const pdfDoc = await PDFDocument.load(inputPdfBuffer);
  const pages = pdfDoc.getPages();

  if (!pages || pages.length === 0) {
    throw new Error('The provided PDF document contains no pages to attach a signature placeholder.');
  }

  pdflibAddPlaceholder({
    pdfDoc,
    pdfPage: pages[0],
    reason,
    location,
    name,
    signatureLength,
  });

  const pdfWithPlaceholderBytes = await pdfDoc.save({ useObjectStreams: false });
  const pdfWithPlaceholderBuffer = Buffer.from(pdfWithPlaceholderBytes);

  const p12Signer = new P12Signer(inputP12Buffer, { passphrase });

  const signer = new SignPdf();
  const signedPdfBuffer = await signer.sign(pdfWithPlaceholderBuffer, p12Signer);

  return Buffer.from(signedPdfBuffer);
}