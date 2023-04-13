import { prisma } from "@/config";

async function create(userId: number, constructionId: number) {
    return prisma.userConstruction.create({
        data: {
            userId,
            constructionId,
        },
    });
}

async function deleteByConstructionId(constructionId: number) {
    return prisma.userConstruction.deleteMany({
        where: {
            constructionId,
        },
    });
}

const userConstructionRepository = {
    create,
    deleteByConstructionId,
};

export default userConstructionRepository;
