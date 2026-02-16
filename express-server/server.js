import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

// Equivalent of __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const resizeUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();

    req.file.filename = `product-${Date.now()}.jpg`;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpg')
      .jpeg({ quality: 90 })
      .toFile(
        path.join(__dirname, '..', 'img', 'products', `${req.file.filename}`),
      );

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', message: 'Something went wrong!' });
  }
};

app.post(
  '/api/products',
  upload.single('productImage'),
  resizeUserPhoto,
  async (req, res, next) => {
    console.log(req.file.filename);
    res
      .status(200)
      .json({
        status: 'success',
        data: { file: path.join('img', 'products', `${req.file.filename}`) },
      });
  },
);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
