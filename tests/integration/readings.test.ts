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

let adminToken: string;
let sensorId: string;

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

  const sensorRes = await request(app)
    .post("/api/sensors")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      code: "TEST-01",
      magnitude: "soil_moisture",
      location: "Parcela de pruebas",
      threshold: 25,
      unit: "%",
    });
  sensorId = sensorRes.body.data._id;
});

afterAll(async () => {
  await disconnectDB();
});

describe("POST /api/sensors/:sensorId/readings", () => {
  it("marca la lectura como anómala si supera el umbral", async () => {
    const res = await request(app)
      .post(`/api/sensors/${sensorId}/readings`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ value: 30 });

    expect(res.status).toBe(201);
    expect(res.body.data.isAnomalous).toBe(true);
    expect(res.body.data.unit).toBe("%");
  });

  it("no marca la lectura como anómala si no supera el umbral", async () => {
    const res = await request(app)
      .post(`/api/sensors/${sensorId}/readings`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ value: 20 });

    expect(res.status).toBe(201);
    expect(res.body.data.isAnomalous).toBe(false);
  });

  it("rechaza con 400 si el cliente intenta enviar isAnomalous", async () => {
    const res = await request(app)
      .post(`/api/sensors/${sensorId}/readings`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ value: 30, isAnomalous: false });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ValidationError");
    expect(await ReadingModel.countDocuments()).toBe(0);
  });

  it("devuelve 404 si el sensor no existe", async () => {
    const fakeId = "000000000000000000000000";

    const res = await request(app)
      .post(`/api/sensors/${fakeId}/readings`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ value: 30 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NotFound");
    expect(await ReadingModel.countDocuments()).toBe(0);
  });
});

describe("GET /api/readings", () => {
  it("devuelve una página ordenada con el bloque meta correcto", async () => {
    for (const value of [10, 30, 20]) {
      await request(app)
        .post(`/api/sensors/${sensorId}/readings`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ value });
    }

    const res = await request(app)
      .get("/api/readings?page=1&limit=2&sort=-value")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].value).toBe(30);
    expect(res.body.meta.total).toBe(3);
    expect(res.body.meta.totalPages).toBe(2);
    expect(res.body.meta.hasNextPage).toBe(true);
    expect(res.body.meta.hasPrevPage).toBe(false);
  });
});
