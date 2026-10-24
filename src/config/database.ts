import mongoose from "mongoose";
import { MONGODB_URI } from "./env.js";

export const connectDB = async (uri: string = MONGODB_URI): Promise<void> => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB conectado con éxito");
  } catch (error) {
    console.error("Error al intentar conectar con MongoDB", error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log("Base de datos desconectada.");
};
