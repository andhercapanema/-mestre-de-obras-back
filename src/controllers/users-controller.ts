import userService from "@/services/users-service";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { ApplicationError, isApplicationError } from "@/errors/protocols";

export async function postUser(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
        await userService.createUser({ email, password });
        return res.sendStatus(httpStatus.CREATED);
    } catch (err) {
        if (isApplicationError(err as Error)) {
            const { name, message } = err as ApplicationError;
            if (name === "DuplicatedEmailError") {
                return res.status(httpStatus.CONFLICT).send(message);
            }
        }

        console.log(err);
        return res.status(httpStatus.BAD_REQUEST).send(err);
    }
}
