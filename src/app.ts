import express from "express";
import type { Request, Response } from "express";
import {
  notFoundHandler,
  globalErrorHandler,
} from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import sensorsRoutes from "./routes/sensors.routes.js";
import readingRoutes from "./routes/readings.routes.js";
import swaggerUi from "swagger-ui-express";
import openapiSpec from "./docs/openapi.json" with { type: "json" };

export const app = express();

app.use(express.json());
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "API funcionando" });
});

// Rutas de la aplicación
app.use("/api/auth", authRoutes);
app.use("/api/sensors", sensorsRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use(notFoundHandler);
app.use(globalErrorHandler);
