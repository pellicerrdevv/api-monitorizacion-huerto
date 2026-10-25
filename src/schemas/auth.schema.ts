import { z } from "zod";

export const RegisterSchema = z
  .object({
    email: z
      .string({ required_error: "El email es obligatorio" })
      .trim()
      .toLowerCase()
      .email("El email no tiene un formato válido"),
    password: z
      .string({
        required_error: "La contraseña es obligatoria",
      })
      .min(8, "La contraseña es demasiado corta")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "La contraseña debe tener al menos una mayúscula, una minúscula, un número y un símbolo",
      ),
    fullName: z
      .string({ required_error: "El nombre es obligatorio" })
      .trim()
      .min(3, "El nombre debe tener al menos 3 caracteres"),
  })
  .strict();

export const LoginSchema = z.object({
  email: z
    .string({ required_error: "El email es obligatorio" })
    .trim()
    .toLowerCase()
    .email("El email no tiene un formato válido"),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(1, "La contraseña no puede estar vacía"),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
