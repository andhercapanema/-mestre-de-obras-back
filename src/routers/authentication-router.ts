import { login } from "@/controllers";
import { validateBody } from "@/middlewares";
import { loginSchema } from "@/schemas";
import { Router } from "express";

const authenticationRouter = Router();

authenticationRouter.post("/login", validateBody(loginSchema), login);

export { authenticationRouter };
