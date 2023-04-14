import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { createMaterialSchema } from "@/schemas";
import { getMaterials, postMaterial } from "@/controllers";

const materialsRouter = Router();

materialsRouter
    .all("/*", authenticateToken)
    .post("/", validateBody(createMaterialSchema), postMaterial)
    .get("/", getMaterials);

export { materialsRouter };
