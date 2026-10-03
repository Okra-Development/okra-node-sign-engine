import { SignPdf } from '@node-signpdf/signpdf';
import { P12Signer } from '@node-signpdf/signer-p12';
import { pdfLibAddPlaceholder } from '@node-signpdf/placeholder-pdf-lib';

/**
 * @param {Buffer} pdfBuffer 
 * @param {Object} options 
 * @returns {Promise<Buffer>}
 */
export async function signCryptographic(pdfBuffer, options) {
  const { p12Buffer, passphrase, reason = 'Firma Digital', location = '', signatureLength = 16384 } = options;

  const pdfWithPlaceholder = await pdfLibAddPlaceholder({
    pdfBuffer,
    reason,
    location,
    signatureLength,
  });

  const p12Signer = new P12Signer({
    p12Buffer,
    passphrase,
  });

  const signer = new SignPdf();
  const signedPdfBuffer = await signer.sign(pdfWithPlaceholder, p12Signer);

  return Buffer.from(signedPdfBuffer);
}