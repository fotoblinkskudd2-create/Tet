// AquaPure — Tester for rapporter og vannkvalitet
import request from "supertest";
import app from "../backend/server";

describe("GET /v1/reports", () => {
  it("returns nearby water reports", async () => {
    const res = await request(app).get("/v1/reports?lat=-6.8&lng=37.7&r=10");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("severity");
    expect(res.body[0]).toHaveProperty("type");
  });

  it("filters by distance", async () => {
    const res = await request(app).get("/v1/reports?lat=0&lng=0&r=1");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });
});

describe("POST /v1/reports", () => {
  it("creates a new water report", async () => {
    const res = await request(app).post("/v1/reports").send({
      lat: -6.81, lng: 37.71, type: "contamination",
      severity: 8, description: "Brun farge i vannet etter regnstorm",
    });
    expect(res.status).toBe(201);
    expect(res.body.type).toBe("contamination");
    expect(res.body.verified).toBe(false);
  });

  it("rejects incomplete reports", async () => {
    const res = await request(app).post("/v1/reports").send({ lat: -6.8 });
    expect(res.status).toBe(400);
  });
});

describe("GET /v1/quality", () => {
  it("returns current water quality assessment", async () => {
    const res = await request(app).get("/v1/quality?lat=-6.8&lng=37.7");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("safety_level");
    expect(res.body).toHaveProperty("ph");
    expect(res.body).toHaveProperty("turbidity");
    expect(["safe", "moderate", "unsafe"]).toContain(res.body.safety_level);
  });
});

describe("GET /v1/sensors/:id/readings", () => {
  it("returns sensor readings for last 24h", async () => {
    const res = await request(app).get("/v1/sensors/sensor_001/readings?hours=24");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("ph");
  });
});

describe("GET /v1/admin/heatmap", () => {
  it("returns heatmap points", async () => {
    const res = await request(app).get("/v1/admin/heatmap");
    expect(res.status).toBe(200);
    expect(res.body.points.length).toBeGreaterThan(0);
    expect(res.body.points[0]).toHaveProperty("weight");
  });
});

describe("Health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.body.status).toBe("ok");
  });
});
