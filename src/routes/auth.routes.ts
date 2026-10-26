import { Router } from "express";
import { validateBody } from "../middlewares/validate.middleware.js";
import { RegisterSchema, LoginSchema } from "../schemas/auth.schema.js";
import { register, login } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", validateBody(RegisterSchema), register);
router.post("/login", validateBody(LoginSchema), login);

export default router;
