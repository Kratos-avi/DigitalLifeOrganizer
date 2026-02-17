  require("dotenv").config();
  const express = require("express");
  const cors = require("cors");

  const pool = require("./src/config/db");

  const authRoutes = require("./src/routes/auth.routes");
  const dashboardRoutes = require("./src/routes/dashboard.routes");
  const taskRoutes = require("./src/routes/tasks.routes");
  const deadlineRoutes = require("./src/routes/deadlines.routes");
  const announcementRoutes = require("./src/routes/announcements.routes");
  const adminRoutes = require("./src/routes/admin.routes");
  const profileRoutes = require("./src/routes/profile.routes");

  const app = express();

  // ✅ LOCAL CORS
  app.use(
    cors({
      origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ],
      credentials: false,
    })
  );

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
      res.status(500).json({
        message: "DB connection failed",
        error: err.message,
      });
    }
  });

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/deadlines", deadlineRoutes);
  app.use("/api/announcements", announcementRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/profile", profileRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log("Server started on port " + PORT);
  });
