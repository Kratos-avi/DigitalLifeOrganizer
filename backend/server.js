require("dotenv").config();
const express = require("express");
const cors = require("cors");

const taskRoutes = require("./src/routes/tasks.routes");
const authRoutes = require("./src/routes/auth.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const pool = require("./src/config/db");

const app = express();

app.use(cors());
app.use(express.json());

// Base route
app.get("/", (req, res) => {
  res.send("Digital Life Organizer API running");
});

// DB test route
app.get("/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ message: "DB connected", result: rows[0] });
  } catch (err) {
    res.status(500).json({ message: "DB connection failed", error: err.message });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tasks", taskRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server started on port " + (process.env.PORT || 5000));
});
