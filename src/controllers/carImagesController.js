import carImagesRepository from "../repositories/carImagesRepository.js";
import fs from 'fs-extra';

const carImageController = {
    getImageById: async (req, res) => {
        const id = +req.params.id;

        try {
            if (!id) return res.status(404).json({
                ok: false,
                status: 404,
                message: 'ID esperado'
            });

            const image = carImagesRepository.getById(id);

            if (image) return res.status(200).json({
                    ok: true,
                    status: 200,
                    message: 'Imagem encontrada com sucesso',
                    image: image
                });

            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Imagem não encontrada'
            });

        } catch (err) {
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
        try {
            const images = req.files.map(img => ({
                filename: img.filename,
                carId: car.id
            }));

            const imagesByCar = await carImagesRepository.getByCarId(car.id);

            const updateImage = await Promise.all(
                imagesByCar.map(async (img, i) => {
                    try {
                        return await carImagesRepository.update(img.id, images[i]);
                    } catch (error) {
                        console.error(`Erro ao atualizar imagem com id ${img.id}:`, error);
                        return null
                    }
                })
            );

            const failedOps = updateImage.filter(result => result === null);

            if (failedOps.length > 0) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    message: `Erro ao atualizar ${failedOps.length} imagem(ns)`
                });
            }

            await Promise.all(
                imagesByCar.map(img => {
                    fs.remove(`./src/public/uploads/${img.filename}`)
                        .catch(err => console.error(`Erro ao deletar ${img.filename}:`, err));
                })
            );

            return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Imagens atualizadas com sucesso',
                car: updateImage
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
    delete: async (req, res) => {
        const imgId = +req.params.imgId;
        const carId = +req.params.carId;
        const images = await carImagesRepository.getById(imgId);

        try {
            if (images) {
                if (images.carId !== carId) {
                    return res.status(403).json({
                        ok: false,
                        status: 403,
                        message: "Permissão negada, valores invalidos"
                    });
                }

                await carImagesRepository.deleteUnique(imgId);

                fs.remove(`./src/public/uploads/${images.filename}`)
                    .catch(err => console.error(`Erro ao deletar ${images.filename}:`, err));

                return res.status(200).json({
                    ok: true,
                    status: 200,
                    message: 'Imagem deletada com sucesso'
                })
            }

            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Erro ao deletar imagem'
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
    create: async (req, res) => {
        const car = req.car;

        try {
            if (!car) return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Carro não encontrado'
            });

            const image = req.files;
            const newImage = {
                filename: image[0].filename,
                carId: car.id
            };

            if (newImage) {
                const createImg = await carImagesRepository.createUnique(newImage);
                return res.status(201).json({
                    ok: true,
                    status: 201,
                    message: 'Imagem adicionada com sucesso',
                    car: { ...car, carImages: createImg }
                })
            }

            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Erro ao adicionar imagem'
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                ok: false,
                status: 500,
                message: 'Erro no servidor'
            });
        }
    },
}
export default carImageController;