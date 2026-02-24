// Unit-tests for CashPilot lesson completion and progress tracking
import { describe, it, expect, beforeAll } from "@jest/globals";

const API_BASE = "http://localhost:3001/v1";
const TOKEN = "test_user_123";

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

describe("CashPilot Lessons API", () => {
  it("GET /lessons returns a non-empty lesson list", async () => {
    const res = await fetch(`${API_BASE}/lessons`, { headers });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("id");
    expect(data[0]).toHaveProperty("title");
    expect(data[0]).not.toHaveProperty("contentJson");
  });

  it("GET /lessons/:id returns full lesson with content", async () => {
    const res = await fetch(`${API_BASE}/lessons/lesson_renter_101`, { headers });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("lesson_renter_101");
    expect(data).toHaveProperty("contentJson");
  });

  it("POST /lessons/:id/complete awards XP and returns progress", async () => {
    const res = await fetch(`${API_BASE}/lessons/lesson_renter_101/complete`, {
      method: "POST",
      headers,
      body: JSON.stringify({ lessonId: "lesson_renter_101", score: 80, timeSpentSeconds: 180 }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.xpEarned).toBe(40); // 50 * 0.8
    expect(data).toHaveProperty("totalXp");
    expect(data).toHaveProperty("level");
    expect(data).toHaveProperty("streak");
  });

  it("POST /lessons/:id/complete rejects invalid input", async () => {
    const res = await fetch(`${API_BASE}/lessons/lesson_renter_101/complete`, {
      method: "POST",
      headers,
      body: JSON.stringify({ lessonId: "lesson_renter_101", score: -5, timeSpentSeconds: 0 }),
    });
    expect(res.status).toBe(400);
  });

  it("GET /lessons/recommended excludes completed lessons", async () => {
    const res = await fetch(`${API_BASE}/lessons/recommended`, { headers });
    expect(res.status).toBe(200);
    const data = await res.json();
    const ids = data.map((l: any) => l.id);
    expect(ids).not.toContain("lesson_renter_101");
  });

  it("GET /progress returns user stats", async () => {
    const res = await fetch(`${API_BASE}/progress`, { headers });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("totalXp");
    expect(data).toHaveProperty("level");
    expect(data).toHaveProperty("streakDays");
    expect(data.lessonsCompleted).toBeGreaterThanOrEqual(1);
  });

  it("GET /health returns ok", async () => {
    const res = await fetch("http://localhost:3001/health");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
  });
});
