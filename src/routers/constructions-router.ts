import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { createConstructionSchema } from "@/schemas";
import {
    deleteConstructionById,
    getConstructionById,
    getConstructions,
    postConstruction,
    updateConstruction,
} from "@/controllers";

const constructionsRouter = Router();

constructionsRouter
    .all("/*", authenticateToken)
    .post("/", validateBody(createConstructionSchema), postConstruction)
    .get("/", getConstructions)
    .get("/:id", getConstructionById)
    .patch("/:id", validateBody(createConstructionSchema), updateConstruction)
    .delete("/:id", deleteConstructionById);

export { constructionsRouter };
