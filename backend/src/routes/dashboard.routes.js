const express = require("express");
const pool = require("../config/db");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// GET /api/dashboard/me (any logged-in user)
router.get("/me", protect, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, full_name, email, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!rows.length) return res.status(404).json({ message: "User not found" });
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// newcomer only
router.get("/newcomer", protect, authorize("newcomer"), (req, res) => {
  res.json({
    message: "Welcome to Newcomer Dashboard",
    nextSteps: ["View tasks", "Add deadlines", "Upload documents"]
  });
});

// admin only
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({
    message: "Welcome to Admin Dashboard",
    actions: ["Manage users", "Post announcements", "View reports"]
  });
});

module.exports = router;
