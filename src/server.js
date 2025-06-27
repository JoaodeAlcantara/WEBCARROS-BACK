import express from 'express';
import cors from 'cors';
import routesPublic from './routes/public.js';
import routesPrivate from './routes/private.js';
import auth from './middlewares/auth.js';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: "Muitas requisições. Tente novamente mais tarde.",
    standardHeaders: true,
    legacyHeaders: false,
});


app.use(express.json());
app.use(cors({
    origin: '*'
}));
app.use(limiter)
app.use('/files', express.static(process.env.UPLOAD_PATH));
app.use(routesPublic);
app.use(auth.auth, routesPrivate);

app.listen(process.env.PORT, process.env.HOST, () => {
    console.log(`http://${process.env.PORT}:${process.env.HOST}`)
})