const multer = require('multer');
const path = require('path');
const fs = require('fs');
const errors = require('../errors/errors');

// In production (Docker) use the absolute path that matches both the
// express.static('/app/backend/uploads') call in app.js and the volume mount.
// In development (CWD = backend/) 'uploads/' resolves to backend/uploads/ — same result.
const UPLOAD_DIR = process.env.NODE_ENV === 'production'
  ? '/app/backend/uploads'
  : 'uploads/';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname + '-' + file.fieldname + '-' + req.user._id + '-' + Date.now());
  }
});

const filterDoc = (req, file, cb) => {
  if (file.fieldname === 'articleDoc' || file.fieldname === 'reviewDoc') {
    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.mimetype === "application/msword"
    ) {
      cb(null, true);
    } else {
      cb(new errors.CastErrorCode('Only doc/docx are allowed to upload'), false);
    }
  }
  if (file.fieldname === 'supplements') {
    if (
      file.mimetype !== "application/x-msdownload"
    ) {
      cb(null, true);
    } else {
      cb(new errors.CastErrorCode('Executable files are not allowed.'), false);
    }
  }
};

const upload = multer({
  storage: storage,
  fileFilter: filterDoc,
  limits: { fileSize: 1024 * 1020 * 10 },
});

const download = (req, res, next) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, filename);
  console.log(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw new errors.CastErrorCode('Error reading PDF file: ', err)
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.send(data);
    }
  });
};

module.exports = {
  upload,
  download,
}
