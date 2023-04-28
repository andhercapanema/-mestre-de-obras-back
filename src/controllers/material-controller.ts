import { ApplicationError, isApplicationError } from "@/errors/protocols";
import { AuthenticatedRequest } from "@/middlewares";
import { CreateMaterialsParams } from "@/schemas";
import materialService from "@/services/material-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function postMaterial(req: AuthenticatedRequest, res: Response) {
    const { newMaterials } = req.body as CreateMaterialsParams;

    try {
        const material = await materialService.postMaterial({ newMaterials });

        return res.status(httpStatus.CREATED).send(material);
    } catch (err) {
        if (isApplicationError(err as Error)) {
            const { name, message } = err as ApplicationError;
            if (name === "ConflictError") {
                return res.status(httpStatus.CONFLICT).send(message);
            }
        }

        console.log(err);
        return res.status(httpStatus.BAD_REQUEST).send(err);
    }
}

export async function getMaterials(req: AuthenticatedRequest, res: Response) {
    try {
        const materials = await materialService.getMaterials();
        return res.status(httpStatus.OK).send(materials);
    } catch (err) {
        return res.status(httpStatus.BAD_REQUEST).send(err);
    }
}
