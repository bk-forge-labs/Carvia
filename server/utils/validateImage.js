const sharp = require('sharp');
const AppError = require('./AppError');
const formats = { 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp' };
async function validateImage(bytes, mime) {
  try {
    const format = formats[mime];
    if (!format) throw new Error('Unsupported format');
    const image = sharp(bytes, { failOn: 'warning', limitInputPixels: 40000000 });
    const info = await image.metadata();
    if (info.format !== format || !info.width || !info.height || info.width > 12000 || info.height > 12000 || (info.pages || 1) > 1) throw new Error('Invalid dimensions');
    // Full decode/re-encode validates pixels and removes private EXIF metadata.
    const clean = await image.rotate().toFormat(format).toBuffer();
    if (clean.length > 5 * 1024 * 1024) throw new Error('Image too large');
    return clean;
  } catch { throw new AppError('Upload a valid, non-animated JPG, PNG or WEBP image under 5 MB and 40 megapixels.', 400); }
}
module.exports = { validateImage };
