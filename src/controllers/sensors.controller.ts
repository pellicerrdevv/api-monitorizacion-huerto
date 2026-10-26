import type { Request, Response } from "express";
import { sensorsService } from "../services/sensors.service.js";

export const getSensors = async (_req: Request, res: Response) => {
  const data = await sensorsService.getAllSensors();
  res.json({ status: "success", count: data.length, data });
};

export const getSensor = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const sensor = await sensorsService.getSensorById(req.params.id);
  res.json({ status: "success", data: sensor });
};

export const createSensor = async (req: Request, res: Response) => {
  const sensorCreated = await sensorsService.createSensor(req.body);
  res.setHeader("Location", `/api/sensors/${sensorCreated._id}`);
  res.status(201).json({ status: "success", data: sensorCreated });
};

export const updateSensor = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const sensorUpdated = await sensorsService.updateSensor(
    req.params.id,
    req.body,
  );
  res.status(200).json({ status: "success", data: sensorUpdated });
};

export const deleteSensor = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  await sensorsService.deleteSensor(req.params.id);
  res.status(204).send();
};
