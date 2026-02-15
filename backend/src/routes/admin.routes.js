const express = require("express");
const pool = require("../config/db");
const { protect, authorize } = require("../middleware/auth");
const starterTasks = require("../data/starterTasks");

const router = express.Router();

// ✅ Get all users (admin only)
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

// ✅ Add starter tasks to any user (admin only)
router.post("/users/:id/add-starter-tasks", protect, authorize("admin"), async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // Check user exists
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

// ✅ Remove starter tasks from any user (admin only)
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
