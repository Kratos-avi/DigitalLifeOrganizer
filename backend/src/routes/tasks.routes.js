// backend/src/routes/tasks.routes.js

const express = require("express");
const pool = require("../config/db");
const { protect } = require("../middleware/auth");

const router = express.Router();

/* ===============================
   GET TASKS (search + filter + pagination)
   Query params:
   - q= (search text)
   - status=all|pending|completed
   - page=1...
   - limit=10...
================================= */
router.get("/", protect, async (req, res) => {
  try {
    const { q = "", status = "all", page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const offset = (pageNum - 1) * limitNum;

    const conditions = ["user_id = ?"];
    const params = [req.user.id];

    // Search in title/description
    const search = String(q).trim();
    if (search) {
      conditions.push("(title LIKE ? OR description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    // Status filter:
    // completed = status = 'completed'
    // pending = anything NOT completed
    const st = String(status).trim().toLowerCase();
    if (st === "completed") {
      conditions.push("status = 'completed'");
    } else if (st === "pending") {
      conditions.push("status <> 'completed'");
    }

    const whereSql = `WHERE ${conditions.join(" AND ")}`;

    // Total count for pagination
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM tasks ${whereSql}`,
      params
    );

    const total = countRows[0]?.total || 0;
    const totalPages = Math.max(Math.ceil(total / limitNum), 1);

    // Paginated result
    const [rows] = await pool.query(
      `SELECT * FROM tasks
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      tasks: rows,
    });
  } catch (err) {
    console.error("GET /tasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   TASK SUMMARY (for progress bar)
   Returns: total, completed, pending, percent
================================= */
router.get("/summary", protect, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status <> 'completed' THEN 1 ELSE 0 END) AS pending
      FROM tasks
      WHERE user_id = ?`,
      [req.user.id]
    );

    const total = rows[0]?.total || 0;
    const completed = rows[0]?.completed || 0;
    const pending = rows[0]?.pending || 0;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.json({ total, completed, pending, percent });
  } catch (err) {
    console.error("GET /tasks/summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   CREATE TASK
================================= */
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, due_date } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)",
      [
        req.user.id,
        String(title).trim(),
        description ? String(description).trim() : null,
        due_date || null,
      ]
    );

    res.status(201).json({
      message: "Task created",
      taskId: result.insertId,
    });
  } catch (err) {
    console.error("POST /tasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   UPDATE TASK
   Supports: title, description, due_date, status
================================= */
router.put("/:id", protect, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, due_date, status } = req.body;

    const [taskRows] = await pool.query(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (!taskRows.length) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = taskRows[0];

    await pool.query(
      `UPDATE tasks 
       SET title = ?, description = ?, due_date = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [
        title !== undefined ? String(title).trim() : task.title,
        description !== undefined
          ? (description ? String(description).trim() : null)
          : task.description,
        due_date !== undefined ? (due_date || null) : task.due_date,
        status !== undefined ? String(status).trim() : task.status,
        id,
        req.user.id,
      ]
    );

    res.json({ message: "Task updated" });
  } catch (err) {
    console.error("PUT /tasks/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   DELETE TASK
================================= */
router.delete("/:id", protect, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await pool.query(
      "DELETE FROM tasks WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("DELETE /tasks/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
