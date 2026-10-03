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
    'The function to generate the placeholder was not found in @signpdf/placeholder-pdf-lib. Please ensure you have the correct version installed and that it exports the function properly.'
  );
}

export async function signCryptographic(pdfBuffer, options = {}) {
  const {
    p12Buffer,
    passphrase,
    reason = 'Digital Signature',
    location = '',
    name = 'Okra Sign Engine',
    signatureLength = 16384,
  } = options;

  const pdflibAddPlaceholder = getPlaceholderFunction(pdfLibPlaceholderModule);

  const pdfDoc = await PDFDocument.load(pdfBuffer);

  pdflibAddPlaceholder({
    pdfDoc,
    reason,
    location,
    name,
    signatureLength,
  });

  const pdfWithPlaceholderBytes = await pdfDoc.save({ useObjectStreams: false });
  const pdfWithPlaceholderBuffer = Buffer.from(pdfWithPlaceholderBytes);

  const p12Signer = new P12Signer(p12Buffer, { passphrase });

  const signer = new SignPdf();
  const signedPdfBuffer = await signer.sign(pdfWithPlaceholderBuffer, p12Signer);

  return Buffer.from(signedPdfBuffer);
}