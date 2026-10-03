import * as placeholderModule from '@signpdf/placeholder-plain';
import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';

function getPlaceholderFunction(mod) {
  if (typeof mod === 'function') return mod;

  const targets = [mod, mod?.default].filter(Boolean);

  const candidateNames = [
    'pdfPlainPlaceholder',
    'placeholderPlain',
    'plainPlaceholder',
    'pdfPlaceholder',
    'addPlaceholder',
    'createPlaceholder',
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

  const modKeys = Object.keys(mod || {});
  const defaultKeys = mod?.default ? Object.keys(mod.default) : [];
  throw new Error(
    `No se encontró la función para generar el placeholder en @signpdf/placeholder-plain. ` +
      `Claves exportadas: [${modKeys.join(', ')}]. Claves en default: [${defaultKeys.join(', ')}].`
  );
}

export async function signCryptographic(pdfBuffer, options = {}) {
  const {
    p12Buffer,
    passphrase,
    reason = 'Firma Digital',
    location = '',
    name = 'Okra Sign Engine',
    signatureLength = 16384,
  } = options;

  const createPlaceholder = getPlaceholderFunction(placeholderModule);

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