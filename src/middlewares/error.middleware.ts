import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app.error.js";
import { NODE_ENV } from "../config/env.js";
import mongoose from "mongoose";
import { parse } from "node:path";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: "fail",
    error: "NotFound",
    message: `Ruta inexistente: ${req.method} ${req.originalUrl}`,
  });
};

export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return res.status(400).json({
      status: "fail",
      error: "ValidationError",
      message:
        "Los datos de la petición no satisfacen el contrato de validación",
      details: issues,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.statusCode >= 500 ? "error" : "fail",
      error: err.name,
      message: err.message,
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      status: "fail",
      error: "InvalidId",
      message: `El valor '${err.value}' no es válido para el campo ${err.path}`,
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((fieldError) => ({
      field: fieldError.path,
      message: fieldError.message,
    }));

    return res.status(400).json({
      status: "fail",
      error: "ValidationError",
      message: "Los datos no cumplen con las reglas del modelo",
      details,
    });
  }

  const mongoErr = err as { code?: number; keyValue?: Record<string, unknown> };

  if (mongoErr.code === 11000) {
    const field = Object.keys(mongoErr.keyValue ?? {})[0];

    return res.status(409).json({
      status: "fail",
      error: "Conflict",
      message: `Ya existe un registro con ese valor en el campo ${field}`,
    });
  }

  const parseErr = err as { type?: string };

  if (parseErr.type === "entity.parse.failed") {
    return res.status(400).json({
      status: "fail",
      error: "InvalidJSON",
      message: "El cuerpo de la petición no es válido",
    });
  }

  console.error("Excepción no controlada", err);

  return res.status(500).json({
    status: "error",
    error: "InternalServerError",
    message: "Ha ocurrido un error inesperado en el servidor",
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
};
