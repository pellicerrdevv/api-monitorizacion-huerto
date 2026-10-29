import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { app } from "../../src/app.js";
import { connectDB, disconnectDB } from "../../src/config/database.js";
import { MONGODB_URI_TEST } from "../../src/config/env.js";
import { UserModel } from "../../src/models/user.model.js";

const validUser = {
  email: "test@huerto.com",
  password: "Test1234!",
  fullName: "Usuario Test",
};

beforeAll(async () => {
  if (!MONGODB_URI_TEST) throw new Error("Falta MONGODB_URI_TEST en el .env");
  await connectDB(MONGODB_URI_TEST);
});

beforeEach(async () => {
  await UserModel.deleteMany({});
});

afterAll(async () => {
  await disconnectDB();
});

describe("POST /api/auth/register", () => {
  it("crea un usuario y devuelve 201 con token", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe("user");
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it("devuelve 409 si el email ya está registrado", async () => {
    await request(app).post("/api/auth/register").send(validUser);

    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.status).toBe("fail");
    expect(res.body.error).toBe("EmailAlreadyRegistered");
  });

  it("devuelve 400 si intenta registrarse con role: admin", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, role: "admin" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.error).toBe("ValidationError");

    expect(await UserModel.countDocuments()).toBe(0);
  });

  it("devuelve 400 si la contraseña es débil", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, password: "Hola1234" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.error).toBe("ValidationError");
    expect(Array.isArray(res.body.details)).toBe(true);
    expect(res.body.details[0].field).toBe("password");
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(validUser);
  });

  it("devuelve 200 y un token con credenciales correctas", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(validUser.email);
  });

  it("devuelve 401 con contraseña incorrecta", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "1234" });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe("fail");
    expect(res.body.error).toBe("InvalidCredentials");
  });
});
