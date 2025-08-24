import multer from "multer";
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_PATH || './src/public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const fileFilter = (req, file, cb) => {
    if (['image/png', 'image/jpeg', 'image/jpg'].includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb('Apenas arquivos PNG, JPEG e JPG são permitidos', false)
    }
}

const upload = multer({ storage, fileFilter, limits: { files: 10 } });

export default upload;