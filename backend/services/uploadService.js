const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const INSPECTIONS_DIR = path.join(UPLOAD_ROOT, 'inspections');
fs.mkdirSync(INSPECTIONS_DIR, { recursive: true });

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpe?g|png|webp|heic|heif)$/i.test(file.mimetype)) {
      return cb(new Error(`Type de fichier non supporté : ${file.mimetype}`));
    }
    cb(null, true);
  },
});

async function processInspectionPhoto(buffer) {
  const id = crypto.randomBytes(8).toString('hex');
  const filename = `${Date.now()}-${id}.webp`;
  const fullPath = path.join(INSPECTIONS_DIR, filename);
  await sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(fullPath);
  return `/uploads/inspections/${filename}`;
}

module.exports = {
  UPLOAD_ROOT,
  INSPECTIONS_DIR,
  memoryUpload,
  processInspectionPhoto,
};
