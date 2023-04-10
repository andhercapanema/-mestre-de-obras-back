import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { createConstructionSchema } from "@/schemas";
import { getConstructions, postConstruction } from "@/controllers";

const constructionsRouter = Router();

constructionsRouter
    .all("/*", authenticateToken)
    .post("/", validateBody(createConstructionSchema), postConstruction)
    .get("/", getConstructions);

export { constructionsRouter };
