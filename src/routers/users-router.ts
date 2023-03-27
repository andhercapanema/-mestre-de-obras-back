import { Router } from "express";

import { createUserSchema } from "@/schemas";
import { validateBody } from "@/middlewares";
import { postUser } from "@/controllers";

const usersRouter = Router();

usersRouter.post("/", validateBody(createUserSchema), postUser);

export { usersRouter };
