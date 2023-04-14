import { prisma } from "@/config";

async function create(name: string) {
    return prisma.material.create({
        data: {
            name,
        },
    });
}

async function findByName(name: string) {
    return prisma.material.findUnique({
        where: { name },
    });
}

async function findAll() {
    return prisma.material.findMany();
}

const materialRepository = {
    create,
    findByName,
    findAll,
};

export default materialRepository;
