import { prisma } from "@/config";
import { CreateConstructionParams } from "@/schemas";

async function create(data: CreateConstructionParams) {
    return prisma.construction.create({
        data,
    });
}

async function findByName(name: string) {
    return prisma.construction.findUnique({
        where: { name },
    });
}

async function findByUserId(userId: number) {
    return prisma.construction.findMany({
        where: {
            UserConstruction: {
                some: {
                    userId,
                },
            },
        },
    });
}

async function findById(id: number) {
    return prisma.construction.findUnique({
        where: { id },
    });
}

async function findByIdAndUserId(userId: number, id: number) {
    return prisma.construction.findFirst({
        where: {
            id,
            UserConstruction: {
                some: {
                    userId,
                },
            },
        },
    });
}

async function update(id: number, data: CreateConstructionParams) {
    return prisma.construction.update({
        where: {
            id,
        },
        data,
    });
}

const constructionRepository = {
    create,
    findByName,
    findByUserId,
    findById,
    findByIdAndUserId,
    update,
};

export default constructionRepository;
