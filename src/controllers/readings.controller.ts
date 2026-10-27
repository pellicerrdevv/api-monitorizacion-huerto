import type { Request, Response } from "express";
import { readingsService } from "../services/readings.service.js";
import type { ReadingQueryDTO } from "../schemas/reading.schema.js";

export const getReadings = async (req: Request, res: Response) => {
  const result = await readingsService.getReadings(
    req.query as unknown as ReadingQueryDTO,
  );
  res.status(200).json({ status: "success", ...result });
};

export const createReading = async (
  req: Request<{ sensorId: string }>,
  res: Response,
) => {
  const readingCreated = await readingsService.createReading(
    req.params.sensorId,
    req.body,
  );
  res.status(201).json({ status: "success", data: readingCreated });
};
