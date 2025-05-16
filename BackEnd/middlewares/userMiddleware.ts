import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (_, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  },
});
export const upload = multer({ storage });

