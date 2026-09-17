const path = require('node:path');
const fs = require('node:fs');
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
if (!path.isAbsolute(uploadDir)) throw new Error('UPLOAD_DIR must be an absolute path.');
function ensureUploadDir() {
  fs.mkdirSync(uploadDir, {recursive:true});
  fs.accessSync(uploadDir, fs.constants.R_OK | fs.constants.W_OK);
}
module.exports = {uploadDir, ensureUploadDir};
