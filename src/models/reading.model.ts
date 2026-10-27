import { Schema, model, Types, Document as MongooseDocument } from "mongoose";

export interface IReading extends MongooseDocument {
  sensor: Types.ObjectId;
  value: number;
  unit: string;
  measuredAt: Date;
  isAnomalous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const readingSchema = new Schema<IReading>(
  {
    sensor: {
      type: Schema.Types.ObjectId,
      ref: "Sensor",
      required: [true, "El sensor asociado es obligatorio"],
    },
    value: {
      type: Number,
      required: [true, "El valor de la lectura es obligatorio"],
    },
    unit: {
      type: String,
      required: [true, "La unidad es obligatoria"],
      trim: true,
    },
    measuredAt: {
      type: Date,
      default: Date.now,
    },
    isAnomalous: {
      type: Boolean,
      required: [
        true,
        "Es obligatorio indicar si tiene anomalía: true / false",
      ],
    },
  },
  { timestamps: true },
);

readingSchema.index({ sensor: 1, measuredAt: -1 });
readingSchema.index({ isAnomalous: 1, measuredAt: -1 });

export const ReadingModel = model<IReading>("Reading", readingSchema);
