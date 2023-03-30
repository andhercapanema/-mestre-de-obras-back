import { prisma } from "@/config";
import { CreateUserParams } from "@/schemas";

async function findByEmail(email: string) {
    return prisma.user.findUnique({
        where: {
            email,
        },
    });
}

async function create(data: CreateUserParams) {
    return prisma.user.create({
        data,
    });
}

async function findById(id: number) {
    return prisma.user.findUnique({
        where: { id },
    });
}

const userRepository = {
    findByEmail,
    create,
    findById,
};

export default userRepository;
