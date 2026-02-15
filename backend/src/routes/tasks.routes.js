const express = require("express");
const pool = require("../config/db");
const { protect } = require("../middleware/auth");

const router = express.Router();

/* ===============================
   GET ALL TASKS (for logged user)
================================= */
router.get("/", protect, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    res.json({ tasks: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   CREATE TASK
================================= */
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)",
      [req.user.id, title, description || null, due_date || null]
    );

    res.status(201).json({
      message: "Task created",
      taskId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   UPDATE TASK
================================= */
router.put("/:id", protect, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, due_date, status } = req.body;

    const [task] = await pool.query(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (!task.length) {
      return res.status(404).json({ message: "Task not found" });
    }

    await pool.query(
      `UPDATE tasks 
       SET title = ?, description = ?, due_date = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [
        title || task[0].title,
        description || task[0].description,
        due_date || task[0].due_date,
        status || task[0].status,
        id,
        req.user.id
      ]
    );

    res.json({ message: "Task updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   DELETE TASK
================================= */
router.delete("/:id", protect, async (req, res) => {
  try {
    const id = req.params.id;

    const [result] = await pool.query(
      "DELETE FROM tasks WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
