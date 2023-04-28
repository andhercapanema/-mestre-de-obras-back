import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { createMaterialsSchema } from "@/schemas";
import { getMaterials, postMaterial } from "@/controllers";

const materialsRouter = Router();

materialsRouter
    .all("/*", authenticateToken)
    .post("/", validateBody(createMaterialsSchema), postMaterial)
    .get("/", getMaterials);

export { materialsRouter };
