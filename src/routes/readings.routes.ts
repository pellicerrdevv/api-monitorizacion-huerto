import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateQuery } from "../middlewares/validate.middleware.js";
import { getReadings } from "../controllers/readings.controller.js";
import { ReadingQuerySchema } from "../schemas/reading.schema.js";

const readingRoutes = Router();
readingRoutes.use(authenticateToken);

readingRoutes.get("/", validateQuery(ReadingQuerySchema), getReadings);

export default readingRoutes;
