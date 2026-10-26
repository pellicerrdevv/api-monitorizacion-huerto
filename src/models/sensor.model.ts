import { Schema, model, Document as MongooseDocument } from "mongoose";
import { SENSOR_MAGNITUDES, SensorMagnitude } from "../types/sensor.types.js";

export interface ISensor extends MongooseDocument {
  code: string;
  magnitude: SensorMagnitude;
  location: string;
  isActive: boolean;
  threshold: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

const sensorSchema = new Schema<ISensor>(
  {
    code: {
      type: String,
      required: [true, "El código es obligatorio"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    magnitude: {
      type: String,
      enum: SENSOR_MAGNITUDES,
      required: [true, "La magnitud es obligatoria"],
    },
    location: {
      type: String,
      required: [true, "La ubicación es obligatoria"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    threshold: {
      type: Number,
      required: [true, "El valor límite es obligatorio"],
    },
    unit: {
      type: String,
      required: [true, "La unidad de medida es obligatoria"],
      trim: true,
    },
  },
  { timestamps: true },
);

export const SensorModel = model<ISensor>("Sensor", sensorSchema);
