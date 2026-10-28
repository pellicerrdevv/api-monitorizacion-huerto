import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";

export const register = async (req: Request, res: Response) => {
  const { token, user } = await authService.register(req.body);
  res.status(201).json({
    status: "success",
    message: "El usuario ha sido creado con éxito",
    data: { token: token, user: user },
  });
};

export const login = async (req: Request, res: Response) => {
  const { token, user } = await authService.login(req.body);
  res.status(200).json({
    status: "success",
    message: "Inicio de sesión correcto",
    data: { token: token, user: user },
  });
};
