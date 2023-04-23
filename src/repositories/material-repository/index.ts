import { prisma } from "@/config";
import { CreateUniqueMaterialParams } from "@/schemas";
import { Prisma, PrismaClient } from "@prisma/client";

async function create(
    prismaInstance: Omit<
        PrismaClient<
            Prisma.PrismaClientOptions,
            never,
            Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
        >,
        "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
    >,
    createUniqueMaterialParams: CreateUniqueMaterialParams
) {
    return prismaInstance.material.create({
        data: createUniqueMaterialParams,
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
