import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { createConstructionSchema } from "@/schemas";
import { postConstruction, postUser } from "@/controllers";

const constructionsRouter = Router();

constructionsRouter
    .all("/*", authenticateToken)
    .post("/", validateBody(createConstructionSchema), postConstruction);

export { constructionsRouter };
