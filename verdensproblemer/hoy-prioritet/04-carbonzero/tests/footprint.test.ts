// CarbonZero — Tester for footprint, activities og challenges
import request from "supertest";
import app from "../backend/server";

let token: string;

beforeAll(async () => {
  const res = await request(app).post("/v1/auth/login").send({ email: "demo@carbonzero.app", password: "demo123" });
  token = res.body.token;
});

describe("GET /v1/footprint/summary", () => {
  it("returns footprint summary with breakdown", async () => {
    const res = await request(app).get("/v1/footprint/summary").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.total_kg).toBeGreaterThan(0);
    expect(res.body.breakdown.length).toBeGreaterThan(0);
    expect(res.body.breakdown[0]).toHaveProperty("category");
    expect(res.body.breakdown[0]).toHaveProperty("percentage");
    const totalPct = res.body.breakdown.reduce((s: number, b: any) => s + b.percentage, 0);
    expect(totalPct).toBeGreaterThanOrEqual(95); // rounding tolerance
  });
});

describe("POST /v1/activities", () => {
  it("logs a new activity", async () => {
    const res = await request(app)
      .post("/v1/activities").set("Authorization", `Bearer ${token}`)
      .send({ category: "transport", co2_kg: 5.2, description: "Kjørte til butikken" });
    expect(res.status).toBe(201);
    expect(res.body.co2Kg).toBe(5.2);
  });
});

describe("GET /v1/challenges", () => {
  it("returns available challenges", async () => {
    const res = await request(app).get("/v1/challenges");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("co2_saving_kg");
  });
});

describe("POST /v1/offsets/purchase", () => {
  it("purchases carbon offset", async () => {
    const res = await request(app)
      .post("/v1/offsets/purchase").set("Authorization", `Bearer ${token}`)
      .send({ amount_kg: 1000 });
    expect(res.status).toBe(201);
    expect(res.body.amount_kg).toBe(1000);
    expect(res.body.cost_usd).toBe(15);
    expect(res.body.provider).toBe("Gold Standard");
  });
});

describe("GET /v1/insights", () => {
  it("returns personalized tips", async () => {
    const res = await request(app).get("/v1/insights").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.tips.length).toBeGreaterThan(0);
  });
});
