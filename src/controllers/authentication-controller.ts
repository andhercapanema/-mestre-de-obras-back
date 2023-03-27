import { ApplicationError, isApplicationError } from "@/errors/protocols";
import { LoginParams } from "@/schemas";
import authenticationService from "@/services/authentication-service";
import { Request, Response } from "express";
import httpStatus from "http-status";
export async function login(req: Request, res: Response) {
    const { email, password } = req.body as LoginParams;

    try {
        const result = await authenticationService.signIn({ email, password });

        return res.status(httpStatus.OK).send(result);
    } catch (err) {
        if (isApplicationError(err as Error)) {
            const { name, message } = err as ApplicationError;
            if (name === "InvalidCredentialsError") {
                return res.status(httpStatus.UNAUTHORIZED).send(message);
            }
        }

        return res.status(httpStatus.BAD_REQUEST).send(err);
    }
}
