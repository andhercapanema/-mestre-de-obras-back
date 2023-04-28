import { Material } from "@prisma/client";
import { prisma } from "@/config";
import { faker } from "@faker-js/faker";

export async function createMaterial(): Promise<Material> {
    return prisma.material.create({
        data: {
            name: faker.name.fullName(),
            unit: faker.word.noun({ strategy: "shortest" }),
        },
    });
}
