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

const constructionRepository = {
    create,
    findByName,
};

export default constructionRepository;
