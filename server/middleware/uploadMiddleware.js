const multer = require('multer');
const {uploadDir, ensureUploadDir} = require('../config/storage');
ensureUploadDir();
const path = require('node:path');
const stagingDir = path.join(uploadDir, '.incoming');
require('node:fs').mkdirSync(stagingDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, stagingDir),
  filename: (req, file, cb) => {
    const safeExt = {'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp'}[file.mimetype];

    const name = `${require('node:crypto').randomUUID()}${safeExt}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, WEBP images are allowed'));
  }
  cb(null, true);
};

const parseImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 8);

const fs = require('node:fs/promises');
const { validateImage } = require('../utils/validateImage');
exports.uploadCarImages = (req, res, next) => {
  parseImages(req, res, async error => {
    if (error) { error.statusCode = 400; return next(error); }
    try {
      // Decode every file before making any file publicly accessible.
      for (const file of req.files || []) {
        const clean = await validateImage(await fs.readFile(file.path), file.mimetype);
        await fs.writeFile(file.path, clean);
      }
      for (const file of req.files || []) {
        const destination = path.join(uploadDir, file.filename);
        await fs.rename(file.path, destination);
        file.path = destination;
      }
      next();
    } catch (error) {
      await Promise.all((req.files || []).map(file => fs.unlink(file.path).catch(() => {})));
      next(error);
    }
  });
};
