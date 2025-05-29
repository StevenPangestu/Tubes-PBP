import multer from 'multer';
import path from 'path';

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, webp, jpg) are allowed!'));
  }
};

// Untuk post image
const postStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (_, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);  
    cb(null, 'post-' + uniqueSuffix + ext);
  },
});

// Untuk profile picture
const profileStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + Date.now() + ext);
  },
});

export const postUpload = multer({ storage: postStorage, fileFilter });
export const profileUpload = multer({ storage: profileStorage, fileFilter });
