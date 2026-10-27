import { z } from "zod";
import { SENSOR_MAGNITUDES } from "../types/sensor.types.js";

export const CreateReadingSchema = z
  .object({
    value: z.number({
      required_error: "El valor es obligatorio",
      invalid_type_error: "Es obligatorio que el campo tenga formato numérico",
    }),
    unit: z
      .string({ required_error: "La unidad de medida es obligatoria" })
      .trim()
      .min(1, "Insuficiente número de caracteres en la unidad de medida")
      .optional(),
    measuredAt: z.coerce
      .date({ invalid_type_error: "measuredAt debe ser una fecha válida" })
      .optional(),
  })
  .strict();

export const ReadingQuerySchema = z.object({
  page: z.coerce
    .number({
      invalid_type_error:
        "Page debe ser un número entero que tiene que ser mayor o igual que 1",
    })
    .int()
    .min(
      1,
      "Page debe ser un número entero que tiene que ser mayor o igual que 1",
    )
    .default(1),
  limit: z.coerce
    .number({
      invalid_type_error:
        "El límite tiene que ser un número entero mayor o igual que 1",
    })
    .int()
    .min(1, "El valor limit tiene que estar entre 1 y 50")
    .max(50, "El valor limit tiene que estar entre 1 y 50")
    .default(10),
  sensor: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "El id del sensor no tiene un formato válido")
    .optional(),
  magnitude: z
    .enum(SENSOR_MAGNITUDES, {
      errorMap: () => ({
        message:
          "La magnitud debe ser una de: temperature, light, air_humidity o soil_moisture",
      }),
    })
    .optional(),
  anomalous: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sort: z
    .enum(["measuredAt", "-measuredAt", "value", "-value"])
    .default("-measuredAt"),
});

export type CreateReadingDTO = z.infer<typeof CreateReadingSchema>;
export type ReadingQueryDTO = z.infer<typeof ReadingQuerySchema>;
