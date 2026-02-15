const express = require("express");
const pool = require("../config/db");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET /api/deadlines (my deadlines)
router.get("/", protect, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM deadlines WHERE user_id = ? ORDER BY due_date ASC",
      [req.user.id]
    );
    res.json({ deadlines: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/deadlines (create)
router.post("/", protect, async (req, res) => {
  try {
    const { title, category, due_date, notes, priority } = req.body;

    if (!title || !due_date) {
      return res.status(400).json({ message: "title and due_date are required" });
    }

    const allowedCategory = ["immigration","housing","employment","health","finance","education","other"];
    const safeCategory = allowedCategory.includes(category) ? category : "other";

    const allowedPriority = ["low","medium","high"];
    const safePriority = allowedPriority.includes(priority) ? priority : "medium";

    const [result] = await pool.query(
      `INSERT INTO deadlines (user_id, title, category, due_date, notes, priority)
       VALUES (?,?,?,?,?,?)`,
      [req.user.id, title, safeCategory, due_date, notes || null, safePriority]
    );

    res.status(201).json({ message: "Deadline created", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/deadlines/:id (update)
router.put("/:id", protect, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, category, due_date, notes, priority, status } = req.body;

    const [owned] = await pool.query(
      "SELECT * FROM deadlines WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (!owned.length) return res.status(404).json({ message: "Deadline not found" });

    const allowedCategory = ["immigration","housing","employment","health","finance","education","other"];
    const safeCategory = category ? (allowedCategory.includes(category) ? category : "other") : null;

    const allowedPriority = ["low","medium","high"];
    const safePriority = priority ? (allowedPriority.includes(priority) ? priority : "medium") : null;

    const allowedStatus = ["upcoming","done"];
    const safeStatus = status ? (allowedStatus.includes(status) ? status : "upcoming") : null;

    await pool.query(
      `UPDATE deadlines
       SET title = COALESCE(?, title),
           category = COALESCE(?, category),
           due_date = COALESCE(?, due_date),
           notes = COALESCE(?, notes),
           priority = COALESCE(?, priority),
           status = COALESCE(?, status)
       WHERE id = ? AND user_id = ?`,
      [title || null, safeCategory, due_date || null, notes || null, safePriority, safeStatus, id, req.user.id]
    );

    res.json({ message: "Deadline updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/deadlines/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await pool.query(
      "DELETE FROM deadlines WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Deadline not found" });

    res.json({ message: "Deadline deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
