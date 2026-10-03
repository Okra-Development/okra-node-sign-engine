import { placeholderPlain } from '@signpdf/placeholder-plain';
import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';

export async function signCryptographic(pdfBuffer, options = {}) {
  const {
    p12Buffer,
    passphrase,
    reason = 'Digital Signature',
    location = '',
    name = 'Okra Sign Engine',
    signatureLength = 16384,
  } = options;

  const pdfWithPlaceholder = placeholderPlain(pdfBuffer, {
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