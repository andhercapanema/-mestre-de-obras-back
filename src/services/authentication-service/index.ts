import sessionRepository from "@/repositories/session-repository";
import userRepository from "@/repositories/user-repository";
import { LoginParams } from "@/schemas";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { invalidCredentialsError } from "./errors";
import { enviromentVariableError } from "@/errors";

async function signIn(loginParams: LoginParams) {
    const { email, password } = loginParams;

    const user = await getUser(email);

    await validatePassword(password, user.password);

    const token = await createSession(user.id);

    return {
        user: {
            id: user.id,
            email,
        },
        token,
    };
}

async function getUser(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw invalidCredentialsError();

    return user;
}

async function createSession(userId: number) {
    if (!process.env.JWT_SECRET) throw enviromentVariableError("JWT_SECRET");

    const token = jwt.sign({ userId }, process.env.JWT_SECRET);
    await sessionRepository.create(token, userId);

    return token;
}

async function validatePassword(password: string, userPassword: string) {
    const isPasswordValid = await bcrypt.compare(password, userPassword);
    if (!isPasswordValid) throw invalidCredentialsError();
}

const authenticationService = {
    signIn,
};

export default authenticationService;
