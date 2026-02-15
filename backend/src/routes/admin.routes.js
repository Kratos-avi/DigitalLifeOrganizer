// backend/src/routes/admin.routes.js

const express = require("express");
const pool = require("../config/db");
const { protect, authorize } = require("../middleware/auth");
const starterTasks = require("../data/starterTasks");
const bcrypt = require("bcryptjs");


const router = express.Router();

/* =========================================
   ✅ ADMIN STATS (Analytics) - admin onlynpm run dev

   GET /admin/stats
========================================= */
router.get("/stats", protect, authorize("admin"), async (req, res) => {
  try {
    const [[usersRow]] = await pool.query("SELECT COUNT(*) AS totalUsers FROM users");
    const [[tasksRow]] = await pool.query("SELECT COUNT(*) AS totalTasks FROM tasks");
    const [[completedTasksRow]] = await pool.query(
      "SELECT COUNT(*) AS completedTasks FROM tasks WHERE status = 'completed'"
    );
    const [[annRow]] = await pool.query("SELECT COUNT(*) AS totalAnnouncements FROM announcements");
    const [[deadRow]] = await pool.query("SELECT COUNT(*) AS totalDeadlines FROM deadlines");

    res.json({
      totalUsers: usersRow.totalUsers || 0,
      totalTasks: tasksRow.totalTasks || 0,
      completedTasks: completedTasksRow.completedTasks || 0,
      totalAnnouncements: annRow.totalAnnouncements || 0,
      totalDeadlines: deadRow.totalDeadlines || 0,
    });
  } catch (err) {
    console.error("admin stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================
   ✅ Get all users - admin only
   GET /admin/users
========================================= */
router.get("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, full_name, email, role FROM users ORDER BY id DESC"
    );
    res.json({ users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================
   ✅ Change user role - admin only
   PUT /admin/users/:id/role
   Body: { role: "admin" | "newcomer" }
========================================= */
router.put("/users/:id/role", protect, authorize("admin"), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!["admin", "newcomer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const [u] = await pool.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (!u.length) return res.status(404).json({ message: "User not found" });

    await pool.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);

    res.json({ message: "Role updated successfully" });
  } catch (err) {
    console.error("role update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================
   ✅ Reset user password - admin only
   PUT /admin/users/:id/reset-password
   Body: { newPassword: "something" }
========================================= */
router.put("/users/:id/reset-password", protect, authorize("admin"), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const [u] = await pool.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (!u.length) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hashed, userId]);


    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================
   ✅ Add starter tasks to any user - admin only
   POST /admin/users/:id/add-starter-tasks
========================================= */
router.post("/users/:id/add-starter-tasks", protect, authorize("admin"), async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const [u] = await pool.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (!u.length) return res.status(404).json({ message: "User not found" });

    const today = new Date();
    let inserted = 0;

    for (const t of starterTasks) {
      const due = new Date(today);
      due.setDate(due.getDate() + (t.due_days || 7));
      const dueDate = due.toISOString().slice(0, 10);

      await pool.query(
        "INSERT INTO tasks (user_id, title, description, due_date, is_starter) VALUES (?,?,?,?,1)",
        [userId, t.title, t.description || null, dueDate]
      );
      inserted++;
    }

    res.json({ message: "Starter tasks added", inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================
   ✅ Remove starter tasks from any user - admin only
   DELETE /admin/users/:id/remove-starter-tasks
========================================= */
router.delete("/users/:id/remove-starter-tasks", protect, authorize("admin"), async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const [result] = await pool.query(
      "DELETE FROM tasks WHERE user_id = ? AND is_starter = 1",
      [userId]
    );

    res.json({ message: "Starter tasks removed", deleted: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
