import * as placeholderModule from '@signpdf/placeholder-plain';
import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';

const createPlaceholder =
  placeholderModule.pdfPlainPlaceholder ||
  placeholderModule.placeholderPlain ||
  placeholderModule.default;

export async function signCryptographic(pdfBuffer, options = {}) {
  const {
    p12Buffer,
    passphrase,
    reason = 'Digital Signature',
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