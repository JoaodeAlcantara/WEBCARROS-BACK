import express from 'express';
import config from './config.js';
import cors from 'cors';
import routesPublic from './routes/public.js';
import routesPrivate from './routes/private.js';
import auth from './middlewares/auth.js';

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*'
}));
app.use('/files', express.static('./src/public/uploads'));
app.use(routesPublic);
app.use(auth.auth, routesPrivate);

app.listen(config.port, config.host, () => {
    console.log(`http://${config.host}:${config.port}`)
})