import { ApplicationError, isApplicationError } from "@/errors/protocols";
import { CreateConstructionParams } from "@/schemas";
import constructionService from "@/services/construction-service";
import { Request, Response } from "express";
import httpStatus from "http-status";
export async function postConstruction(req: Request, res: Response) {
    const { name, address, client, technicalManager, initialDate, endDate } =
        req.body as CreateConstructionParams;

    try {
        const data = await constructionService.postConstruction({
            name,
            address,
            client,
            technicalManager,
            initialDate,
            endDate,
        });

        return res.status(httpStatus.CREATED).send(data);
    } catch (err) {
        if (isApplicationError(err as Error)) {
            const { name, message } = err as ApplicationError;
            if (name === "InvalidCredentialsError") {
                return res.status(httpStatus.UNAUTHORIZED).send(message);
            }

            if (name === "ConflictError") {
                return res.status(httpStatus.CONFLICT).send(message);
            }
        }

        return res.status(httpStatus.BAD_REQUEST).send(err);
    }
}
