import * as jwt from "jsonwebtoken";
import { User } from "@prisma/client";

import { createSession, createUser } from "./factories";
import { prisma } from "@/config";
import { enviromentVariableError } from "@/errors";

export async function cleanDb() {
    await prisma.stock.deleteMany();
    await prisma.minimumStock.deleteMany();
    await prisma.userConstruction.deleteMany();
    await prisma.$queryRaw`TRUNCATE materials RESTART IDENTITY CASCADE`;
    await prisma.$queryRaw`TRUNCATE constructions RESTART IDENTITY CASCADE`;
    await prisma.session.deleteMany();
    await prisma.$queryRaw`TRUNCATE users RESTART IDENTITY CASCADE`;
}

export async function generateValidToken(user?: User) {
    const incomingUser = user || (await createUser());

    if (process.env.JWT_SECRET) {
        const token = jwt.sign(
            { userId: incomingUser.id },
            process.env.JWT_SECRET
        );

        await createSession(token);

        return token;
    } else {
        throw enviromentVariableError("JWT_SECRET");
    }
}
