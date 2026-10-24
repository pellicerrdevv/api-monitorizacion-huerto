import "dotenv/config";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`No hay un valor definido para ${name}`);
  }
  return value;
}

export const PORT = Number(process.env.PORT) || 3000;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const MONGODB_URI = requireEnv("MONGODB_URI");
export const MONGODB_URI_TEST = process.env.MONGODB_URI_TEST;
export const JWT_SECRET = requireEnv("JWT_SECRET");
export const JWT_EXPIRATION_IS_IN = process.env.JWT_EXPIRATION_IS_IN || "8h";
export const ADMIN_EMAIL = requireEnv("ADMIN_EMAIL");
export const ADMIN_PASSWORD = requireEnv("ADMIN_PASSWORD");
