const multer = require('multer');
const path = require('path');
const {uploadDir, ensureUploadDir} = require('../config/storage');
ensureUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // Saver fallback if ext is missing
    const safeExt =
      ext ||
      {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
      }[file.mimetype] ||
      '';

    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
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

exports.uploadCarImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 8);
