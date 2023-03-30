import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { createUserSchema } from "@/schemas";
import { getUserInfo, postUser } from "@/controllers";

const usersRouter = Router();

usersRouter
    .post("/", validateBody(createUserSchema), postUser)
    .all("/*", authenticateToken)
    .get("/", getUserInfo);

export { usersRouter };
