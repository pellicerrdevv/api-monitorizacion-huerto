import bcrypt from "bcrypt";
import { tokenService } from "./token.service.js";
import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
} from "../errors/auth.errors.js";
import { IUser, UserModel } from "../models/user.model.js";
import { RegisterDTO, LoginDTO } from "../schemas/auth.schema.js";
import { AuthResult, PublicUser } from "../types/auth.types.js";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../config/env.js";

export const toPublicUser = (user: IUser): PublicUser => {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
};

export class AuthService {
  async register(input: RegisterDTO): Promise<AuthResult> {
    if (await UserModel.findOne({ email: input.email })) {
      throw new EmailAlreadyRegisteredError();
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await UserModel.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
    });

    return this.buildAuthResult(user);
  }

  async login(input: LoginDTO): Promise<AuthResult> {
    const user = await UserModel.findOne({ email: input.email });
    if (!user) throw new InvalidCredentialsError();

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!passwordMatches) throw new InvalidCredentialsError();

    return this.buildAuthResult(user);
  }

  private buildAuthResult(user: IUser): AuthResult {
    const token = tokenService.generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    return { token, user: toPublicUser(user) };
  }

  async ensureAdminUser(): Promise<void> {
    let admin = await UserModel.findOne({ email: ADMIN_EMAIL });
    if (admin) return;

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    admin = await UserModel.create({
      email: ADMIN_EMAIL,
      passwordHash,
      fullName: "Administrador",
      role: "admin",
    });

    console.log("Usuario administrador creado");
  }
}

export const authService = new AuthService();
