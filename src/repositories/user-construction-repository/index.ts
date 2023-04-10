import { prisma } from "@/config";

async function create(userId: number, constructionId: number) {
    return prisma.userConstruction.create({
        data: {
            userId,
            constructionId,
        },
    });
}

const userConstructionRepository = {
    create,
};

export default userConstructionRepository;
