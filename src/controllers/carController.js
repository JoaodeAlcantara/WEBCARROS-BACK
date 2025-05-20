import carImagesRepository from "../repositories/carImagesRepository.js";
import carRepository from "../repositories/carRepository.js";
import { verifyData } from "../utils/functions.js";
import slugify from "slugify";
import fs from "fs-extra";
import favoriteRepository from "../repositories/favoriteRepository.js";

const carController = {
    create: async (req, res) => {
        const data = req.body;
        const checked = verifyData(data);

        if (!checked) {
            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Preencha todos com campos'
            });
        }

        if (!req.files || req.files.length < 1) {
            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Adicione ao menos uma imagem'
            });
        }

        if (req.files.length > 10) {
            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'O limite é de 10 imagens'
            });
        }

        const slug = slugify(`${data.name} ${data.model} ${data.year} ${Date.now()}`, { lower: true, strict: true });

        try {
            const newCar = await carRepository.create({
                ...data,
                kilometersRun: parseFloat(data.kilometersRun),
                slug,
                userId: req.user.id
            });

            if (newCar) {
                const images = req.files.map(img => ({
                    filename: img.filename,
                    carId: newCar.id
                }));

                const carImage = await carImagesRepository.create(images);

                if (!carImage) {
                    return res.status(400).json({
                        ok: false,
                        status: 400,
                        message: 'Erro ao adicionar imagens'
                    });
                }

                res.status(201).json({
                    ok: true,
                    status: 201,
                    message: 'Carro adicionado com sucesso',
                    car: { ...newCar, carImage: images }
                });
            } else {
                res.status(400).json({
                    ok: false,
                    status: 400,
                    message: 'Erro ao adicionar carro'
                });
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
    getCars: async (req, res) => {
        const { name } = req.query;

        try {
            const cars = await carRepository.getAll(name);

            if (cars) return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Carros encontrados com sucesso',
                cars: cars
            });

            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Erro ao encontrar carros'
            });

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
    getCarById: async (req, res) => {
        const id = req.params.id;

        try {
            const car = await carRepository.getById(+id);

            if (car) return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Carro encontrado com sucesso',
                car: car
            });

            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Erro ao encontrar carro'
            });

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
    getCarBySlug: async (req, res) => {
        const slug = req.params.slug;

        try {
            const car = await carRepository.getBySlug(slug);

            if (car) return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Carro encontrado com sucesso',
                car: car
            });

            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Erro ao encontrar carro'
            });

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
    getCarsByUserId: async (req, res) => {
        const userId = +req.user.id;

        try {
            const cars = await carRepository.getByUserId(userId);

            if (cars) return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Carros encontrados com sucesso',
                cars: cars
            });

            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Erro ao encontrar carros'
            });

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
    update: async (req, res) => {
        const car = req.car;
        const data = req.body;

        try {
            if (car) {
                const checked = verifyData(data);

                if (!checked) {
                    return res.status(400).json({
                        ok: false,
                        status: 400,
                        message: 'Preencha todos com campos'
                    });
                }

                const updateCar = await carRepository.update(car.id, {
                    ...data,
                    kilometersRun: parseFloat(data.kilometersRun),
                    slug: car.slug,
                    userId: req.user.id
                });

                if (updateCar) {
                    return res.status(200).json({
                        ok: true,
                        status: 200,
                        message: 'Valores atualizados com sucesso',
                        car: { ...updateCar, carImages: car.carImages }
                    })
                }
            }

            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Erro ao atualizar carro'
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
    addView: async (req, res, next) => {
        const slug = req.params.slug;

        try {
            const car = await carRepository.getBySlug(slug);

            if (car) {
                carRepository.update(car.id, { views: car.views + 1 });

                return next();
            };

            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Carro não encontrado'
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
    updateState: async (req, res) => {
        const car = req.car;

        try {
            if (!car) {
                return res.status(404).json({
                    ok: false,
                    status: 404,
                    message: 'Carro não encontrado'
                });
            }

            let newStatus, newPreviousStatus;

            if (car.status !== 'oculto') {
                newStatus = 'oculto';
                newPreviousStatus = car.status;
            } else {
                newStatus = car.previousStatus || 'disponivel';
                newPreviousStatus = 'oculto';
            }

            const update = await carRepository.update(car.id, {
                status: newStatus,
                previousStatus: newPreviousStatus
            });

            if (update) {
                return res.status(200).json({
                    ok: true,
                    status: 200,
                    message: 'Status atualizado com sucesso'
                });
            }

            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Erro ao atualizar status'
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
    delete: async (req, res) => {
        const car = req.car;

        try {
            if (car) {
                const images = await carImagesRepository.getByCarId(car.id);

                await carImagesRepository.delete(car.id);

                const favoriteCarDelete = await favoriteRepository.getByCarId(car.id);

                const isdeletedFav = await Promise.all(
                    favoriteCarDelete.map(async (item) => {
                        try {
                            await favoriteRepository.updateState(item.id, { status: 'deletado' });
                        } catch (err) {
                            console.log('ERRO AO ATULIZAR STADO DO CARRO FAVORITADO', err)
                        }
                    })
                );

                if (!isdeletedFav) return res.status(400).json({
                    ok: false,
                    status: 400,
                    message: 'Erro ao deletar registro(s) dos favoritos'
                });

                const isDeltedCar = await carRepository.delete(car.id, { status: 'deletado' });

                if (!isDeltedCar) return res.status(400).json({
                    ok: false,
                    status: 400,
                    message: 'Erro ao deletar registro(s) dos carros'
                });

                await Promise.all(
                    images.map(async (img) => {
                        try {
                            console.log('IMAGEM A SER DELETADA', img.filename);
                            await fs.remove(`./src/public/uploads/${img.filename}`);
                        } catch (err) {
                            console.error(`Erro ao deletar ${img.filename}:`, err);
                        }
                    })
                );

                return res.status(200).json({
                    ok: true,
                    status: 200,
                    message: 'Carro deletado com sucesso'
                });
            }

            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Erro ao deletar carro'
            });

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
}

export default carController;