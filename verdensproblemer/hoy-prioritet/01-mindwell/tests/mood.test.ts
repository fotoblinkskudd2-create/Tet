// MindWell — Unit + API-tester for mood-endepunkter (Jest + supertest)
import request from "supertest";
import app from "../backend/server";

let authToken: string;

beforeAll(async () => {
  const res = await request(app).post("/v1/auth/login").send({ email: "demo@mindwell.app", password: "demo123" });
  authToken = res.body.token;
});

describe("POST /v1/mood", () => {
  it("should log a mood entry", async () => {
    const res = await request(app)
      .post("/v1/mood")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ score: 7, emotions: ["Glad", "Rolig"], note: "God dag" });

    expect(res.status).toBe(201);
    expect(res.body.score).toBe(7);
    expect(res.body.emotions).toEqual(["Glad", "Rolig"]);
    expect(res.body.id).toBeDefined();
    expect(res.body.aiSuggestion).toBeDefined();
  });

  it("should reject invalid score", async () => {
    const res = await request(app)
      .post("/v1/mood")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ score: 15 });

    expect(res.status).toBe(400);
  });

  it("should require authentication", async () => {
    const res = await request(app).post("/v1/mood").send({ score: 5 });
    expect(res.status).toBe(401);
  });
});

describe("GET /v1/mood", () => {
  it("should return mood history for authenticated user", async () => {
    const res = await request(app)
      .get("/v1/mood")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should filter by date range", async () => {
    const res = await request(app)
      .get("/v1/mood?from=2026-01-01&to=2026-12-31")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
  });
});

describe("GET /v1/mood/insights", () => {
  it("should return insights when enough data exists", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/v1/mood")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ score: 5 + i, emotions: ["Rolig"] });
    }

    const res = await request(app)
      .get("/v1/mood/insights")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.averageScore).toBeDefined();
    expect(res.body.totalEntries).toBeGreaterThanOrEqual(5);
  });
});

describe("POST /v1/chat", () => {
  it("should return AI response", async () => {
    const res = await request(app)
      .post("/v1/chat")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ message: "Jeg føler meg stresset i dag" });

    expect(res.status).toBe(200);
    expect(res.body.response).toBeDefined();
    expect(res.body.session_id).toBeDefined();
    expect(res.body.crisis_detected).toBe(false);
  });

  it("should detect crisis keywords", async () => {
    const res = await request(app)
      .post("/v1/chat")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ message: "Jeg vil ta livet mitt" });

    expect(res.status).toBe(200);
    expect(res.body.crisis_detected).toBe(true);
    expect(res.body.crisis_resources).toBeDefined();
  });
});

describe("Health check", () => {
  it("should return ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
