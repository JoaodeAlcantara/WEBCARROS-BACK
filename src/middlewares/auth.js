import jwt from 'jsonwebtoken';
import carRepository from '../repositories/carRepository.js';
import favoriteRepository from '../repositories/favoriteRepository.js';

const auth = {
    auth: (req, res, next) => {
        const tokenHeader = req.headers.authorization;
        const token = tokenHeader ? tokenHeader.split(' ')[1] || tokenHeader : null;

        if (!token) return res.status(401).json({
            ok: false,
            status: 401,
            message: 'Acesso negado'
        });

        try {
            const dados = jwt.verify(token, process.env.SECRET);
            req.user = dados;

            next();
        } catch (error) {
            return res.status(401).json({
                ok: false,
                status: 401,
                message: 'Token inválido'
            });
        }
    },
    authorizeCarOwner: async (req, res, next) => {
        try {
            const carId = +req.params.carId;
            const userLoggedId = req.user.id;

            const car = await carRepository.getById(carId);

            if (!car) {
                return res.status(404).json({
                    ok: false,
                    status: 404,
                    message: "Carro não encontrado"
                });
            }

            if (car.userId !== userLoggedId) {
                return res.status(403).json({
                    ok: false,
                    status: 403,
                    message: "Permissão negada"
                });
            }

            req.car = car;
            next();

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                status: 500,
                message: "Erro no servidor"
            });
        }
    },
}

export default auth;