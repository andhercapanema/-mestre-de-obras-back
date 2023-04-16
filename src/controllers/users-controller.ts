import userService from "@/services/users-service";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { isApplicationError } from "@/errors/protocols";
import { CreateUserParams } from "@/schemas";
import { AuthenticatedRequest } from "@/middlewares";

export async function postUser(req: Request, res: Response) {
    const { name, email, password } = req.body as CreateUserParams;

    try {
        await userService.createUser({ name, email, password });
        return res.sendStatus(httpStatus.CREATED);
    } catch (err) {
        if (isApplicationError(err)) {
            const { name, message } = err;
            if (name === "DuplicatedEmailError") {
                return res.status(httpStatus.CONFLICT).send(message);
            }
        }

        return res.status(httpStatus.BAD_REQUEST).send(err);
    }
}

export async function getUserInfo(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;

    try {
        const userInfo = await userService.getUser(Number(userId));

        return res.status(httpStatus.OK).send(userInfo);
    } catch (err) {
        return res.status(httpStatus.BAD_REQUEST).send(err);
    }
}
