// backend/src/routes/profile.routes.js

const express = require("express");
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const { protect } = require("../middleware/auth");

const router = express.Router();

/* ==========================
   GET MY PROFILE
   GET /api/profile/me
========================== */
router.get("/me", protect, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, full_name, email, role FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!rows.length) return res.status(404).json({ message: "User not found" });

    res.json({ user: rows[0] });
  } catch (err) {
    console.error("profile me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ==========================
   UPDATE MY PROFILE (name)
   PUT /api/profile/me
========================== */
router.put("/me", protect, async (req, res) => {
  try {
    const { full_name } = req.body;

    if (!full_name || full_name.trim().length < 2) {
      return res.status(400).json({ message: "Full name is required" });
    }

    await pool.query("UPDATE users SET full_name = ? WHERE id = ?", [
      full_name.trim(),
      req.user.id,
    ]);

    res.json({ message: "Profile updated" });
  } catch (err) {
    console.error("profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ==========================
   CHANGE PASSWORD
   PUT /api/profile/change-password
========================== */
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const [rows] = await pool.query(
  "SELECT password_hash AS password FROM users WHERE id = ?",
  [req.user.id]
);
    if (!rows.length) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, rows[0].password);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hashed, req.user.id]);


    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
