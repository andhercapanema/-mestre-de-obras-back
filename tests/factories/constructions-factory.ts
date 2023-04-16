import { Construction } from "@prisma/client";
import { prisma } from "@/config";
import { faker } from "@faker-js/faker";

export async function createConstruction(
    userId: number
): Promise<Construction> {
    const construction = await prisma.construction.create({
        data: {
            name: faker.name.fullName(),
            address: faker.address.streetAddress(),
            client: faker.name.fullName(),
            technicalManager: faker.name.fullName(),
            initialDate: faker.date.future(),
            endDate: faker.date.future(),
        },
    });

    await prisma.userConstruction.create({
        data: {
            userId,
            constructionId: construction.id,
        },
    });

    return construction;
}
