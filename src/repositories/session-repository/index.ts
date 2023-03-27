import { prisma } from "@/config";

async function create(token: string, userId: number) {
    return prisma.session.create({
        data: {
            userId,
            token,
        },
    });
}

const sessionRepository = {
    create,
};

export default sessionRepository;
