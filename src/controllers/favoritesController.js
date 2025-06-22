import favoriteRepository from "../repositories/favoriteRepository.js";
import carRepository from "../repositories/carRepository.js";

const favoritesController = {
    create: async (req, res) => {
        const carId = +req.params.carId;
        const user = req.user;
        const group = req.body.group;

        try {
            if (!carId) return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Id invalido'
            });

            const car = await carRepository.getById(carId);

            if (!car) return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Nenhum carro com esse id foi encontrado'
            });

            const isExist = await favoriteRepository.getByCarIdAndUserId(carId, user.id);

            if (isExist) return res.status(409).json({
                ok: false,
                status: 409,
                message: 'Este carro já está presente na lista de favoritos'
            });

            const favorite = await favoriteRepository.create({
                carId: carId, userId: user.id, group
            });

            if (favorite) return res.status(201).json({
                ok: true,
                status: 201,
                message: 'Carro favoritado com sucesso',
                favorite: favorite
            });

            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Erro ao favoritar carro'
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
    getAllFavorites: async (req, res) => {
        const cars = await favoriteRepository.getAll();

        try {
            if (!cars || cars.length < 1) return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Carros não encontrados'
            });

            return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Carros encontrados com sucesso',
                cars: cars
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
    getFavoritesById: async (req, res) => {
        const id = +req.params.id;

        try {
            if (!id) return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Nenhum carro com esse id foi encontrado'
            });

            const car = await favoriteRepository.getById(id);

            if (car) return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Carro encontrado com sucesso',
                car: car
            });

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
    getFavoritesByUserId: async (req, res) => {
        const userId = req.user.id;

        try {
            if (!userId) return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Usuario não encontrado'
            });

            const favorites = await favoriteRepository.getByUserId(userId);

            if (favorites && favorites?.length > 0) return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Lista encontrada com sucesso',
                favorites: favorites
            });

            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'A lista de favoritos não foi encontrada'
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
    getFavoritesWithGroupByUserId: async (req, res) => {
        try {
            const favorites = await favoriteRepository.getWithGroupByUserId(req.user.id);

            console.log('log', favorites)

            const formatedFavorites = {};

            if (favorites && favorites.length > 0) {
                favorites.map(item => {
                    const grupo = typeof item.group === 'string' ? item.group.trim() : '';;

                    if (!formatedFavorites[grupo]) {
                        formatedFavorites[grupo] = [];
                    }

                    formatedFavorites[grupo].push(item);
                });

                const orderedFavorites = {};

                Object.keys(formatedFavorites)
                    .filter(g => g !== '')
                    .sort()
                    .forEach(g => {
                        orderedFavorites[g] = formatedFavorites[g];
                    });

                const allFavorites = Object.values(formatedFavorites).flat();
                if (allFavorites.length > 0) {
                    orderedFavorites['todos'] = allFavorites;
                }

                return res.status(200).json({
                    ok: true,
                    status: 200,
                    message: 'Listas de favoritos encontrados com sucesso com codigo SQL',
                    favorites: orderedFavorites
                });
            }

            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Nenhuma lista de favoritos foi encontrada',
                favorites: []
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
    getFavoritesByGroupAndUserId: async (req, res) => {
        const groupName = req.params.group;

        try {
            const favorites = await favoriteRepository.getByGroupAndUserId(groupName.toLowerCase(), req.user.id);

            if (!favorites || favorites.length < 1) return res.status(404).json({
                ok: false,
                status: 404,
                message: "Lista não encontrada"
            });

            return res.status(200).json({
                ok: true,
                status: 200,
                message: "Lista encontrada com sucesso",
                favorites: favorites
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
    deleteItem: async (req, res) => {
        const id = +req.params.id;

        try {
            const favorite = !!(await favoriteRepository.getById(id));

            if (favorite) {
                await favoriteRepository.deleteItem(id);

                return res.status(200).json({
                    ok: true,
                    status: 200,
                    message: 'Item removido com sucesso'
                });
            }

            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Item não encontrado'
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
    deleteOrUpdateGroupName: async (req, res) => {
        const group = (req.params.group);
        const { name } = req.body;

        try {
            const favorites = await favoriteRepository.getByGroupAndUserId(group, req.user.id);

            if (!favorites || favorites.length < 1) return res.status(404).json({
                ok: false,
                status: 404,
                message: "Lista não encontrada"
            });

            const updateGroupName = await favoriteRepository.updateGroupName(group, { group: name });

            if (updateGroupName) return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Ação realizada com sucesso'
            });

            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Erro ao efetuar ação'
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
    deleteGroupAndItems: async (req, res) => {
        const groupName = req.params.group;

        try {
            const isExist = !!(await favoriteRepository.getByGroupAndUserId(groupName, req.user.id));

            if (!isExist) return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Grupo não encontrado'
            });

            const list = await favoriteRepository.deleteGroup(groupName);

            if (list) return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Grupo apagado com sucesso'
            });

            return res.status(400).json({
                ok: false,
                status: 400,
                message: 'Erro ao deletar'
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

export default favoritesController