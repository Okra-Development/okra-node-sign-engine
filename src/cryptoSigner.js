import * as placeholderModule from '@signpdf/placeholder-plain';
import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';

function getPlaceholderFunction(mod) {
  if (typeof mod === 'function') return mod;
  if (typeof mod?.pdfPlainPlaceholder === 'function') return mod.pdfPlainPlaceholder;
  if (typeof mod?.placeholderPlain === 'function') return mod.placeholderPlain;
  if (typeof mod?.default === 'function') return mod.default;
  if (typeof mod?.default?.pdfPlainPlaceholder === 'function') return mod.default.pdfPlainPlaceholder;
  if (typeof mod?.default?.placeholderPlain === 'function') return mod.default.placeholderPlain;
  throw new Error('No se encontró la función para generar el placeholder en @signpdf/placeholder-plain');
}

const createPlaceholder = getPlaceholderFunction(placeholderModule);

export async function signCryptographic(pdfBuffer, options = {}) {
  const {
    p12Buffer,
    passphrase,
    reason = 'Firma Digital',
    location = '',
    name = 'Okra Sign Engine',
    signatureLength = 16384,
  } = options;

  const pdfWithPlaceholder = createPlaceholder({
    pdfBuffer,
    reason,
    location,
    name,
    signatureLength,
  });

  const p12Signer = new P12Signer(p12Buffer, { passphrase });

  const signer = new SignPdf();
  const signedPdfBuffer = await signer.sign(pdfWithPlaceholder, p12Signer);

  return Buffer.from(signedPdfBuffer);
}