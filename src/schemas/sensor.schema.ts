import { z } from "zod";
import { SENSOR_MAGNITUDES } from "../types/sensor.types.js";

export const CreateSensorSchema = z
  .object({
    code: z
      .string({ required_error: "El código es obligatorio" })
      .trim()
      .toUpperCase()
      .min(1, "Insuficiente número de caracteres en el código"),
    magnitude: z.enum(SENSOR_MAGNITUDES, {
      errorMap: () => ({
        message:
          "La magnitud debe ser una de: temperature, light, air_humidity o soil_moisture",
      }),
    }),
    location: z
      .string({ required_error: "La ubicación es obligatoria" })
      .trim()
      .min(3, "La ubicación debe tener al menos 3 caracteres"),
    isActive: z
      .boolean({
        invalid_type_error: "isActive debe ser true o false",
      })
      .optional(),
    threshold: z.number({
      required_error: "El valor límite es obligatorio",
      invalid_type_error: "Es obligatorio que el campo tenga formato numérico",
    }),
    unit: z
      .string({ required_error: "La unidad de medida es obligatoria" })
      .trim()
      .min(1, "Insuficiente número de caracteres en la unidad de medida"),
  })
  .strict();

export const UpdateSensorSchema = CreateSensorSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Se ha de enviar al menos un campo para poder modificar" },
);

export type CreateSensorDTO = z.infer<typeof CreateSensorSchema>;
export type UpdateSensorDTO = z.infer<typeof UpdateSensorSchema>;
