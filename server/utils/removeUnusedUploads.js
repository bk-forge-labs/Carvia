const fs = require('node:fs/promises');
const path = require('node:path');
const { uploadDir } = require('../config/storage');
const Car = require('../models/Car');
async function removeUnusedUploads(urls) {
  for (const url of new Set(urls || [])) {
    if (typeof url !== 'string' || !/^\/uploads\/[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(url)) continue;
    try {
      if (await Car.exists({ $or: [{ images: url }, { mainImage: url }] })) continue;
      await fs.unlink(path.join(uploadDir, path.basename(url)));
    } catch (error) {
      if (error.code !== 'ENOENT') console.error('An unreferenced upload could not be removed; storage maintenance is required.');
    }
  }
}
module.exports = { removeUnusedUploads };
