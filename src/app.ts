import express from "express";
import type { Request, Response } from "express";
import {
  notFoundHandler,
  globalErrorHandler,
} from "./middlewares/error.middleware.js";

export const app = express();

app.use(express.json());
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "API funcionando" });
});

// Rutas de la aplicación
//app.use("/api/auth", authRoutes);
//app.use("/api/sensors", sensorsRoutes);
//app.use("/api/readings", readingRoutes);
//app.use("/api/docs", documentsRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);
