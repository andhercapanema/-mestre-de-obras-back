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

const constructionRepository = {
    create,
    findByName,
    findByUserId,
};

export default constructionRepository;
