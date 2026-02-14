
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.originalname.toLowerCase().endsWith('.las')) {
    cb(null, true);
  } else {
    cb(new Error('Only .las files allowed'), false);
  }
};

export const upload = multer({

  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});