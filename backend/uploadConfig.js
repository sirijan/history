const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');

const mongoURI = 'mongodb://localhost:27017/historical_places';

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    const uniqueSuffix = crypto.randomBytes(6).toString('hex');
    return {
      filename: `${base}-${uniqueSuffix}${ext}`,
      bucketName: 'uploads'
    };
  }
});

module.exports = storage;