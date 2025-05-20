import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userRepository = {
    create: async (data) => {
        const newUser = await prisma.users.create({
            data: { ...data }
        });
        return newUser
    },
    getAll: async () => {
        const allUser = await prisma.users.findMany({
            omit: { password: true }
        });
        return allUser
    },
    getById: async (id) => {
        const user = await prisma.users.findUnique({
            where: { id: id }
        });
        return user
    },
    getByEmail: async (email) => {
        const user = await prisma.users.findUnique({
            where: { email: email },
        });
        return user
    },
    update: async (id, data) => {
        const user = await prisma.users.update({
            where: { id: id },
            data: { ...data }
        });
        return user
    },
    delete: async (id) => {
        const user = await prisma.users.delete({
            where: { id: id }
        });
        return !!user;
    }
}

export default userRepository