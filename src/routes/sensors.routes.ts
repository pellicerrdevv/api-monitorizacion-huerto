import { Router } from "express";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  CreateSensorSchema,
  UpdateSensorSchema,
} from "../schemas/sensor.schema.js";
import {
  getSensors,
  getSensor,
  createSensor,
  updateSensor,
  deleteSensor,
} from "../controllers/sensors.controller.js";
import { CreateReadingSchema } from "../schemas/reading.schema.js";
import { createReading } from "../controllers/readings.controller.js";

const sensorsRoutes = Router();
sensorsRoutes.use(authenticateToken);

sensorsRoutes.get("/", getSensors);
sensorsRoutes.get("/:id", getSensor);
sensorsRoutes.post(
  "/",
  authorizeRoles("admin"),
  validateBody(CreateSensorSchema),
  createSensor,
);
sensorsRoutes.patch(
  "/:id",
  authorizeRoles("admin"),
  validateBody(UpdateSensorSchema),
  updateSensor,
);
sensorsRoutes.delete("/:id", authorizeRoles("admin"), deleteSensor);
sensorsRoutes.post(
  "/:sensorId/readings",
  validateBody(CreateReadingSchema),
  createReading,
);
export default sensorsRoutes;
