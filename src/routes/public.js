import { Router } from "express";
import authController from "../controllers/authController.js";
import carController from "../controllers/carController.js";

const routes = Router();

routes.get('/', (req, res) => {
    res.status(200).json({
        ok: true, 
        status: 200, 
        message: 'Raiz do sistema acessada'
    })
});

// LOGIN
routes.post('/register', authController.create);
routes.post('/login', authController.login);

// GET
routes.get('/list-car', carController.getCars);
routes.get('/list-car/id/:id', carController.getCarById);
routes.get('/list-car/slug/:slug', carController.addView, carController.getCarBySlug);

export default routes;