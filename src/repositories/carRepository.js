import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const carRepository = {
    create: async (data) => {
        const car = await prisma.cars.create({
            data: data
        });
        return car
    },
    getAll: async (name) => {
        const cars = await prisma.cars.findMany({
            where: {
                name: name ? { contains: name } : undefined,
                status: { in: ['disponivel', 'vendido'] }
            },
            orderBy: { createdAt: 'desc' },
            include: { carImages: true, favorites: true }
        });
        return cars
    },
    getById: async (id) => {
        const car = await prisma.cars.findUnique({
            where: { id: id },
            include: { carImages: true, favorites: true }
        });
        return car
    },
    getBySlug: async (slug) => {
        const car = await prisma.cars.findUnique({
            where: { slug: slug },
            include: { carImages: true, favorites: true }
        });
        return car
    },
    getByUserId: async (id) => {
        const cars = await prisma.cars.findMany({
            where: { 
                userId: id,
                status: { in: ['disponivel', 'vendido', 'oculto'] }
            },
            include: { carImages: true, favorites: true }
        });
        return cars
    },
    update: async (id, data) => {
        const car = await prisma.cars.update({
            where: { id: id },
            data: { ...data }
        });
        return car
    },
    delete: async (id, data) => {
        const car = await prisma.cars.update({
            where: { id: id },
            data: data
        });
        return !!car
    }
}

export default carRepository