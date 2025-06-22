import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const favoriteRepository = {
    create: async (data) => {
        const favorite = await prisma.favorites.create({
            data: data
        });
        return favorite
    },
    getAll: async () => {
        const favorites = await prisma.favorites.findMany({
            include: {
                car: {
                    include: { carImages: true }
                }
            }
        });
        return favorites
    },
    getById: async (id) => {
        const favorite = await prisma.favorites.findUnique({
            where: { id: id },
            include: {
                car: {
                    include: { carImages: true }
                }
            }
        });
        return favorite
    },
    getByCarId: async (carId) => {
        const favoriteCars = await prisma.favorites.findMany({
            where: { carId: carId }
        });
        return favoriteCars
    },
    getByCarIdAndUserId: async (carId, userId) => {
        const favorite = await prisma.favorites.findUnique({
            where: {
                userId_carId_unique: {
                    carId: carId, userId: userId
                }
            },
            include: {
                car: {
                    include: { carImages: true }
                }
            }
        });
        return favorite
    },
    getByUserId: async (id) => {
        const favorites = await prisma.favorites.findMany({
            where: { userId: id },
            include: {
                car: {
                    include: { carImages: true }
                }
            }
        });
        return favorites
    },
    // busca todos os favoritos 
    getWithGroupByUserId: async (id) => {
        const favorites = await prisma.$queryRaw`
        SELECT f.*, c.*, 
            (SELECT i.filename from carImages i WHERE i.carId = c.id LIMIT 1) AS images
        FROM favorites f
        INNER JOIN cars c
            ON f.carId = c.id
        WHERE f.userId = 2
            AND c.status in ('disponivel', 'vendido') 
            AND f.group IS NOT NULL;
        `;
        return favorites
    },
    // busca um grupo especifico 
    getByGroupAndUserId: async (group, id) => {
        const favorites = await prisma.favorites.findMany({
            where: {
                group: group,
                userId: id,
                status: { in: ['disponivel', 'vendido'] }
            },
            include: {
                car: {
                    include: { carImages: true }
                }
            }
        });
        return favorites
    },
    deleteItem: async (id) => {
        const favorite = await prisma.favorites.delete({
            where: { id: id }
        });
        return !!favorite
    },
    deleteGroup: async (group) => {
        const favorite = await prisma.favorites.deleteMany({
            where: { group: group }
        });
        return !!favorite
    },
    updateGroupName: async (group, data) => {
        const favorites = await prisma.favorites.updateMany({
            where: { group: group },
            data: data
        });
        return favorites
    },
    updateState: async (id, data) => {
        const favorites = await prisma.favorites.update({
            where: { id: id },
            data: { ...data }
        });
        return favorites
    },
}

export default favoriteRepository