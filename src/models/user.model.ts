import { Schema, model, Document as MongooseDocument } from "mongoose";
import { USER_ROLES, UserRole } from "../types/auth.types.js";

export interface IUser extends MongooseDocument {
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "El email es obligatorio"],
      trim: true,
      minlength: [3, "El email debe tener al menos 3 caracteres"],
    },
    passwordHash: {
      type: String,
      required: [true, "El hash es obligatorio"],
    },
    fullName: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "user",
    },
  },
  { timestamps: true },
);

export const UserModel = model<IUser>("User", userSchema);
