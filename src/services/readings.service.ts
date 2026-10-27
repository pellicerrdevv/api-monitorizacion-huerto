import { ReadingModel, type IReading } from "../models/reading.model.js";
import { SensorModel } from "../models/sensor.model.js";
import type {
  CreateReadingDTO,
  ReadingQueryDTO,
} from "../schemas/reading.schema.js";
import {
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
} from "../errors/http.errors.js";
import type { PaginatedResult } from "../types/pagination.types.js";

export class ReadingsService {
  async createReading(
    sensorId: string,
    input: CreateReadingDTO,
  ): Promise<IReading> {
    const sensor = await SensorModel.findById(sensorId);
    if (!sensor) throw new NotFoundError("Sensor no encontrado");
    if (sensor.isActive === false)
      throw new ConflictError(
        "El sensor está inactivo y no permite hacer lecturas",
      );
    const unit = input.unit ?? sensor.unit;
    if (unit !== sensor.unit) {
      throw new UnprocessableEntityError(
        `La unidad esperada es ${sensor.unit}`,
      );
    }
    const isAnomalous: boolean = input.value > sensor.threshold;

    const reading = await ReadingModel.create({
      sensor: sensor._id,
      value: input.value,
      unit,
      isAnomalous,
      measuredAt: input.measuredAt,
    });
    return reading;
  }

  async getReadings(
    query: ReadingQueryDTO,
  ): Promise<PaginatedResult<IReading>> {
    const { page, limit, sensor, magnitude, anomalous, sort } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (anomalous !== undefined) {
      filter.isAnomalous = anomalous;
    }
    const sensorFilter: Record<string, unknown> = {};

    if (sensor) {
      sensorFilter.$eq = sensor;
    }

    if (magnitude) {
      const sensorIds = await SensorModel.find({ magnitude }).distinct("_id");
      sensorFilter.$in = sensorIds;
    }

    if (Object.keys(sensorFilter).length > 0) {
      filter.sensor = sensorFilter;
    }

    const [data, total] = await Promise.all([
      ReadingModel.find(filter)
        .populate("sensor", "code magnitude location unit")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      ReadingModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const buildLink = (targetPage: number): string => {
      const params = new URLSearchParams();
      params.set("page", String(targetPage));
      params.set("limit", String(limit));
      if (sensor) params.set("sensor", sensor);
      if (magnitude) params.set("magnitude", magnitude);
      if (anomalous !== undefined) params.set("anomalous", String(anomalous));
      params.set("sort", sort);
      return `?${params.toString()}`;
    };
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        next: page < totalPages ? buildLink(page + 1) : null,
        prev: page > 1 ? buildLink(page - 1) : null,
      },
    };
  }
}

export const readingsService = new ReadingsService();
