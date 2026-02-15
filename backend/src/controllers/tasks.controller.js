// backend/src/controllers/tasks.controller.js
const db = require("../config/db");

/**
 * Assumed table: tasks
 * Columns commonly used:
 * id (PK), user_id, title, description, is_completed (TINYINT), created_at (DATETIME)
 * If your column names differ, tell me and I’ll adjust quickly.
 */

exports.getTasks = async (req, res) => {
  try {
    const user = req.user; // from auth middleware
    const { q = "", status = "all", page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
    const offset = (pageNum - 1) * limitNum;

    // Newcomer can only see own tasks; admin can optionally request user_id
    const targetUserId = user.role === "admin" && req.query.user_id
      ? parseInt(req.query.user_id)
      : user.id;

    const conditions = ["user_id = ?"];
    const params = [targetUserId];

    if (q.trim()) {
      conditions.push("(title LIKE ? OR description LIKE ?)");
      params.push(`%${q.trim()}%`, `%${q.trim()}%`);
    }

    if (status === "completed") {
      conditions.push("is_completed = 1");
    } else if (status === "pending") {
      conditions.push("is_completed = 0");
    }

    const whereSql = `WHERE ${conditions.join(" AND ")}`;

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM tasks ${whereSql}`,
      params
    );

    const total = countRows[0]?.total || 0;
    const totalPages = Math.max(Math.ceil(total / limitNum), 1);

    const [rows] = await db.query(
      `SELECT id, title, description, is_completed, created_at
       FROM tasks
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
      tasks: rows
    });
  } catch (err) {
    console.error("getTasks error:", err);
    res.status(500).json({ message: "Server error fetching tasks." });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const user = req.user;
    const taskId = parseInt(req.params.id);
    const { title, description } = req.body;

    if (!taskId) return res.status(400).json({ message: "Invalid task id." });
    if (!title || !title.trim()) return res.status(400).json({ message: "Title is required." });

    // Only owner can update; admin can update any user's task
    const [taskRows] = await db.query(
      "SELECT id, user_id FROM tasks WHERE id = ?",
      [taskId]
    );

    if (!taskRows.length) return res.status(404).json({ message: "Task not found." });

    const task = taskRows[0];
    if (user.role !== "admin" && task.user_id !== user.id) {
      return res.status(403).json({ message: "Not allowed to edit this task." });
    }

    await db.query(
      "UPDATE tasks SET title = ?, description = ? WHERE id = ?",
      [title.trim(), (description || "").trim(), taskId]
    );

    res.json({ message: "Task updated successfully." });
  } catch (err) {
    console.error("updateTask error:", err);
    res.status(500).json({ message: "Server error updating task." });
  }
};

exports.getTaskSummary = async (req, res) => {
  try {
    const user = req.user;

    const targetUserId = user.role === "admin" && req.query.user_id
      ? parseInt(req.query.user_id)
      : user.id;

    const [rows] = await db.query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN is_completed = 0 THEN 1 ELSE 0 END) AS pending
      FROM tasks
      WHERE user_id = ?`,
      [targetUserId]
    );

    const total = rows[0]?.total || 0;
    const completed = rows[0]?.completed || 0;
    const pending = rows[0]?.pending || 0;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.json({ total, completed, pending, percent });
  } catch (err) {
    console.error("getTaskSummary error:", err);
    res.status(500).json({ message: "Server error building summary." });
  }
};
