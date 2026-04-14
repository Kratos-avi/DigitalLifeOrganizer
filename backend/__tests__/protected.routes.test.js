const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");

jest.mock("../src/config/db", () => ({
  query: jest.fn(),
}));

const pool = require("../src/config/db");
const tasksRoutes = require("../src/routes/tasks.routes");
const deadlinesRoutes = require("../src/routes/deadlines.routes");
const announcementsRoutes = require("../src/routes/announcements.routes");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/tasks", tasksRoutes);
  app.use("/api/deadlines", deadlinesRoutes);
  app.use("/api/announcements", announcementsRoutes);
  return app;
}

function tokenFor(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET);
}

describe("protected routes", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    jest.clearAllMocks();
  });

  test("GET /api/tasks requires auth token", async () => {
    const app = createApp();
    const res = await request(app).get("/api/tasks");

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  test("POST /api/tasks validates title", async () => {
    const app = createApp();
    const token = tokenFor({ id: 1, email: "user@test.com", role: "newcomer" });

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "No title" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/title/i);
  });

  test("POST /api/deadlines validates required fields", async () => {
    const app = createApp();
    const token = tokenFor({ id: 2, email: "user@test.com", role: "newcomer" });

    const res = await request(app)
      .post("/api/deadlines")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Visa renewal" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  test("POST /api/announcements is blocked for non-admin", async () => {
    const app = createApp();
    const token = tokenFor({ id: 3, email: "user@test.com", role: "newcomer" });

    const res = await request(app)
      .post("/api/announcements")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Hello", message: "Test message" });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/access denied/i);
  });

  test("POST /api/announcements allows admin and inserts row", async () => {
    const app = createApp();
    const token = tokenFor({ id: 10, email: "admin@test.com", role: "admin" });

    pool.query.mockResolvedValueOnce([{ insertId: 101 }]);

    const res = await request(app)
      .post("/api/announcements")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Welcome", message: "Important update", category: "education" });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/created/i);
    expect(res.body.id).toBe(101);
  });
});
