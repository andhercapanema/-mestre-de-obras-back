import userService from "@/services/users-service";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { ApplicationError, isApplicationError } from "@/errors/protocols";
import { CreateUserParams } from "@/schemas";

export async function postUser(req: Request, res: Response) {
    const { name, email, password } = req.body as CreateUserParams;

    try {
        await userService.createUser({ name, email, password });
        return res.sendStatus(httpStatus.CREATED);
    } catch (err) {
        if (isApplicationError(err as Error)) {
            const { name, message } = err as ApplicationError;
            if (name === "DuplicatedEmailError") {
                return res.status(httpStatus.CONFLICT).send(message);
            }
        }

        return res.status(httpStatus.BAD_REQUEST).send(err);
    }
}
