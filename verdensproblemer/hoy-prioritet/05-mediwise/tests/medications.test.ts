// MediWise — Tester for medications, reminders og interactions
import request from "supertest";
import app from "../backend/server";

let patientToken: string;
let caregiverToken: string;

beforeAll(async () => {
  const pRes = await request(app).post("/v1/auth/login").send({ email: "olav@test.com", password: "test123" });
  patientToken = pRes.body.token;
  const cRes = await request(app).post("/v1/auth/login").send({ email: "karin@test.com", password: "test123" });
  caregiverToken = cRes.body.token;
});

describe("GET /v1/medications", () => {
  it("returns patient medications", async () => {
    const res = await request(app).get("/v1/medications").set("Authorization", `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
    expect(res.body[0]).toHaveProperty("name");
    expect(res.body[0]).toHaveProperty("dosage");
  });
});

describe("POST /v1/medications", () => {
  it("adds a new medication", async () => {
    const res = await request(app)
      .post("/v1/medications").set("Authorization", `Bearer ${patientToken}`)
      .send({ name: "Ibuprofen", dosage: "400mg", frequency: "Ved behov", instructions: "Ta med mat" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Ibuprofen");
  });

  it("rejects incomplete medication", async () => {
    const res = await request(app)
      .post("/v1/medications").set("Authorization", `Bearer ${patientToken}`)
      .send({ name: "Test" });
    expect(res.status).toBe(400);
  });
});

describe("POST /v1/medications/interactions", () => {
  it("detects known drug interactions", async () => {
    const res = await request(app)
      .post("/v1/medications/interactions").set("Authorization", `Bearer ${patientToken}`)
      .send({ medication_ids: ["med_1", "med_2", "med_5"] });
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("severity");
    expect(res.body[0]).toHaveProperty("recommendation");
  });
});

describe("GET /v1/reminders", () => {
  it("returns pending reminders", async () => {
    const res = await request(app).get("/v1/reminders").set("Authorization", `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("medication_name");
  });
});

describe("PUT /v1/reminders/:id/confirm", () => {
  it("confirms a reminder", async () => {
    const res = await request(app)
      .put("/v1/reminders/rem_1/confirm").set("Authorization", `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.confirmed).toBe(true);
  });
});

describe("GET /v1/reports/adherence", () => {
  it("returns adherence report", async () => {
    const res = await request(app).get("/v1/reports/adherence").set("Authorization", `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("adherence_rate");
    expect(res.body).toHaveProperty("total_reminders");
  });
});

describe("Caregiver endpoints", () => {
  it("lists dependents for caregiver", async () => {
    const res = await request(app).get("/v1/caregivers/dependents").set("Authorization", `Bearer ${caregiverToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toBe("Olav Hansen");
  });

  it("shows dependent status", async () => {
    const res = await request(app)
      .get("/v1/caregivers/dependents/user_1/status").set("Authorization", `Bearer ${caregiverToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("doses_taken");
    expect(res.body).toHaveProperty("doses_missed");
  });
});
