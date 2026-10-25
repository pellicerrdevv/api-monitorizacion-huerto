import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRATION_IS_IN } from "../config/env.js";
import { AuthTokenPayload } from "../types/auth.types.js";

export class TokenService {
  generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION_IS_IN as jwt.SignOptions["expiresIn"],
    });
  }
}

export const tokenService = new TokenService();
