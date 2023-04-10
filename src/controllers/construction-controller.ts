import { ApplicationError, isApplicationError } from "@/errors/protocols";
import { AuthenticatedRequest } from "@/middlewares";
import { CreateConstructionParams } from "@/schemas";
import constructionService from "@/services/construction-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function postConstruction(
    req: AuthenticatedRequest,
    res: Response
) {
    const { name, address, client, technicalManager, initialDate, endDate } =
        req.body as CreateConstructionParams;
    const { userId } = req;

    try {
        const data = await constructionService.postConstruction(
            {
                name,
                address,
                client,
                technicalManager,
                initialDate,
                endDate,
            },
            Number(userId)
        );

        return res.status(httpStatus.CREATED).send(data);
    } catch (err) {
        if (isApplicationError(err as Error)) {
            const { name, message } = err as ApplicationError;
            if (name === "ConflictError") {
                return res.status(httpStatus.CONFLICT).send(message);
            }
        }

        return res.status(httpStatus.BAD_REQUEST).send(err);
    }
}

export async function getConstructions(
    req: AuthenticatedRequest,
    res: Response
) {
    const { userId } = req;

    try {
        const constructions = await constructionService.getConstructions(
            Number(userId)
        );

        return res.status(httpStatus.CREATED).send(constructions);
    } catch (err) {
        if (isApplicationError(err as Error)) {
            const { name, message } = err as ApplicationError;
            if (name === "NotFoundError") {
                return res.status(httpStatus.NOT_FOUND).send(message);
            }
        }

        return res.status(httpStatus.BAD_REQUEST).send(err);
    }
}
