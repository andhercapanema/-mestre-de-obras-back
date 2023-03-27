import userRepository from "@/repositories/user-repository";
import { CreateUserParams } from "@/schemas";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { duplicatedEmailError } from "./errors";

export async function createUser({
    name,
    email,
    password,
}: CreateUserParams): Promise<User> {
    await validateUniqueEmail(email);

    const hashedPassword = await bcrypt.hash(password, 12);
    return userRepository.create({
        name,
        email,
        password: hashedPassword,
    });
}

async function validateUniqueEmail(email: string) {
    const userWithSameEmail = await userRepository.findByEmail(email);

    if (userWithSameEmail) {
        throw duplicatedEmailError();
    }
}

const userService = {
    createUser,
};

export default userService;
