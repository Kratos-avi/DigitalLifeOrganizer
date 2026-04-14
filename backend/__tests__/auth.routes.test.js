const express = require("express");
const request = require("supertest");

jest.mock("../src/config/db", () => ({
  query: jest.fn(),
}));

const pool = require("../src/config/db");
const authRoutes = require("../src/routes/auth.routes");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  return app;
}

describe("auth routes", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    jest.clearAllMocks();
  });

  test("POST /api/auth/register returns 400 for missing fields", async () => {
    const app = createApp();

    const res = await request(app).post("/api/auth/register").send({
      email: "user@test.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  test("POST /api/auth/register returns 409 when email exists", async () => {
    const app = createApp();

    pool.query.mockResolvedValueOnce([[{ id: 12 }]]);

    const res = await request(app).post("/api/auth/register").send({
      full_name: "Test User",
      email: "user@test.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/exists/i);
  });

  test("POST /api/auth/login returns 400 for missing credentials", async () => {
    const app = createApp();

    const res = await request(app).post("/api/auth/login").send({
      email: "user@test.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });
});
