const express = require("express");
const pool = require("../config/db");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

const allowedCategories = [
  "immigration", "housing", "employment", "health", "finance", "education", "general"
];

// GET /api/announcements (all logged-in users can view)
router.get("/", protect, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.title, a.message, a.category, a.created_at, a.updated_at,
              u.full_name AS created_by_name
       FROM announcements a
       JOIN users u ON u.id = a.created_by
       ORDER BY a.created_at DESC`
    );
    res.json({ announcements: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/announcements (admin only)
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { title, message, category } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "title and message are required" });
    }

    const safeCategory = allowedCategories.includes(category) ? category : "general";

    const [result] = await pool.query(
      "INSERT INTO announcements (title, message, category, created_by) VALUES (?,?,?,?)",
      [title, message, safeCategory, req.user.id]
    );

    res.status(201).json({ message: "Announcement created", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/announcements/:id (admin only) - edit
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, message, category } = req.body;

    const [rows] = await pool.query("SELECT id FROM announcements WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Announcement not found" });

    const safeCategory = category
      ? (allowedCategories.includes(category) ? category : "general")
      : null;

    await pool.query(
      `UPDATE announcements
       SET title = COALESCE(?, title),
           message = COALESCE(?, message),
           category = COALESCE(?, category),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title || null, message || null, safeCategory, id]
    );

    res.json({ message: "Announcement updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/announcements/:id (admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await pool.query("DELETE FROM announcements WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Announcement not found" });

    res.json({ message: "Announcement deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
