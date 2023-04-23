import { invalidDataError } from "@/errors";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { z, ZodError, ZodObject, ZodTypeAny } from "zod";

export function validateBody(
    schema: ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>
): ValidationMiddleware {
    return validate(schema, "body");
}

export function validateParams(
    schema: ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>
): ValidationMiddleware {
    return validate(schema, "params");
}

function validate(
    schema: ZodObject<{}, "strip", ZodTypeAny, {}, {}>,
    type: "body" | "params"
) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req[type]);
        } catch (err) {
            if (err instanceof ZodError) {
                res.status(httpStatus.BAD_REQUEST).send(
                    invalidDataError(
                        err.issues.map(
                            (issue) => `${issue.path[0]} - ${issue.message}`
                        )
                    )
                );
            }
        }

        next();
    };
}

type ValidationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => void;
