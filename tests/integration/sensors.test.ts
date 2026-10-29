import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { app } from "../../src/app.js";
import { connectDB, disconnectDB } from "../../src/config/database.js";
import {
  MONGODB_URI_TEST,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} from "../../src/config/env.js";
import { UserModel } from "../../src/models/user.model.js";
import { SensorModel } from "../../src/models/sensor.model.js";
import { ReadingModel } from "../../src/models/reading.model.js";
import { authService } from "../../src/services/auth.service.js";
import { string } from "zod/v4";

let adminToken: string;
let userToken: string;

const validSensor = {
  code: "TEST-01",
  magnitude: "soil_moisture",
  location: "Parcela de pruebas",
  threshold: 25,
  unit: "%",
};

beforeAll(async () => {
  if (!MONGODB_URI_TEST) throw new Error("Falta MONGODB_URI_TEST en el .env");
  await connectDB(MONGODB_URI_TEST);
});

beforeEach(async () => {
  await UserModel.deleteMany({});
  await SensorModel.deleteMany({});
  await ReadingModel.deleteMany({});

  await authService.ensureAdminUser();
  const adminRes = await request(app).post("/api/auth/login").send({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  adminToken = adminRes.body.data.token;

  const userRes = await request(app).post("/api/auth/register").send({
    email: "user@huerto.com",
    password: "Test1234!",
    fullName: "Usuario Normal",
  });
  userToken = userRes.body.data.token;
});

afterAll(async () => {
  await disconnectDB();
});

describe("Autenticación en /api/sensors", () => {
  it("devuelve 401 si no se envía token", async () => {
    const res = await request(app).get("/api/sensors");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("devuelve 401 si el token está manipulado", async () => {
    const tamperedToken = userToken.slice(0, -5) + "XXXXX";

    const res = await request(app)
      .get("/api/sensors")
      .set("Authorization", `Bearer ${tamperedToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("InvalidToken");
  });
});

describe("Permisos por rol en /api/sensors", () => {
  it("devuelve 403 si un usuario normal intenta crear un sensor", async () => {
    const res = await request(app)
      .post("/api/sensors")
      .set("Authorization", `Bearer ${userToken}`)
      .send(validSensor);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });

  it("devuelve 403 si un usuario normal intenta borrar un sensor", async () => {
    const created = await request(app)
      .post("/api/sensors")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(validSensor);
    const sensorId = created.body.data._id;

    const res = await request(app)
      .delete(`/api/sensors/${sensorId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");

    expect(await SensorModel.findById(sensorId)).not.toBeNull();
  });
});

describe("Ciclo de vida de un sensor (admin)", () => {
  it("crea, consulta, modifica, borra y ya no encuentra el sensor", async () => {
    const auth = `Bearer ${adminToken}`;

    const created = await request(app)
      .post("/api/sensors")
      .set("Authorization", auth)
      .send(validSensor);
    expect(created.status).toBe(201);
    expect(created.headers.location).toBe(
      `/api/sensors/${created.body.data._id}`,
    );
    const sensorId = created.body.data._id;

    const found = await request(app)
      .get(`/api/sensors/${sensorId}`)
      .set("Authorization", auth);
    expect(found.status).toBe(200);
    expect(found.body.data.code).toBe(validSensor.code);

    const updated = await request(app)
      .patch(`/api/sensors/${sensorId}`)
      .set("Authorization", auth)
      .send({ threshold: 40 });
    expect(updated.status).toBe(200);
    expect(updated.body.data.threshold).toBe(40);
    expect(updated.body.data.location).toBe(validSensor.location);

    const deleted = await request(app)
      .delete(`/api/sensors/${sensorId}`)
      .set("Authorization", auth);
    expect(deleted.status).toBe(204);

    const gone = await request(app)
      .get(`/api/sensors/${sensorId}`)
      .set("Authorization", auth);
    expect(gone.status).toBe(404);
    expect(gone.body.error).toBe("NotFound");
  });
});
