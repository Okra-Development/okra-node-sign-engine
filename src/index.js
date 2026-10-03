import { addVisualFields } from './stamper.js';
import { signCryptographic } from './cryptoSigner.js';

export class OkraPdfSignEngine {
  /**
   * @param {Object} params
   * @param {Buffer} params.pdfBuffer
   * @param {Buffer} params.p12Buffer
   * @param {string} params.passphrase
   * @param {Array} [params.visualFields]
   * @param {string} [params.reason]
   * @param {string} [params.location]
   * @returns {Promise<Buffer>}
   */
  static async signDocument(params) {
    const { pdfBuffer, p12Buffer, passphrase, visualFields = [], reason, location } = params;

    let processedPdf = pdfBuffer;
    if (visualFields.length > 0) {
      processedPdf = await addVisualFields(processedPdf, visualFields);
    }

    const signedPdf = await signCryptographic(processedPdf, {
      p12Buffer,
      passphrase,
      reason,
      location,
    });

    return signedPdf;
  }
}

export { addVisualFields, signCryptographic };