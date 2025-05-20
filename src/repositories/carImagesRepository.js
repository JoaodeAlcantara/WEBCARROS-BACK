import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const carImagesRepository = {
    create: async (data) => {
        const images = await prisma.carImages.createMany({
            data: data 
        });
        return images
    },
    createUnique: async (data) => {
        const images = await prisma.carImages.create({
            data: data 
        });
        return images
    },
    update: async (id, data) => {
        const images = await prisma.carImages.update({
            where: { id: id },
            data: data
        });
        return images
    },
    delete: async (id) => {
        const images = await prisma.carImages.deleteMany({
            where: { carId: id }
        });
        return !!images
    },
    deleteUnique: async (id) => {
        const images = await prisma.carImages.delete({
            where: { id: id }
        });
        return !!images
    },
    getByCarId: async (id) => {
        const images = await prisma.carImages.findMany({
            where: { carId: id }
        });
        return images
    },
    getById: async (id) => {
        const image = await prisma.carImages.findUnique({
            where: { id: id }
        });
        return image
    },
}

export default carImagesRepository