const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect } = require("../middleware/auth");

router.use(protect);

function toYMD(d) { return d.toISOString().slice(0, 10); }
function parseYMD(s) { return new Date(s + "T00:00:00"); }

function isoWeekday(d) {
  const w = d.getDay();
  return w === 0 ? 7 : w;
}

function termWeekNumber(termStartStr, dateStr) {
  const start = parseYMD(termStartStr);
  const cur = parseYMD(dateStr);
  const diffDays = Math.floor((cur - start) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

// generate week events for weekStart (Mon date): /generate?weekStart=YYYY-MM-DD
function generateWeekEvents(template, weekStartStr, skipWeek = 8) {
  const ws = parseYMD(weekStartStr); // Monday
  const startBound = parseYMD(template.start_date);
  const endBound = parseYMD(template.end_date);

  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(ws);
    d.setDate(ws.getDate() + i);
    const ymd = toYMD(d);

    if (d < startBound || d > endBound) continue;
    if (isoWeekday(d) !== Number(template.weekday)) continue;

    const wk = termWeekNumber(template.start_date, ymd);
    if (wk === skipWeek) continue;

    out.push({
      type: "template",
      template_id: template.id,
      date: ymd,
      workplace: template.workplace || null,
      role: template.role || null,
      start_time: template.start_time,
      end_time: template.end_time,
      notes: template.notes || null,
      weekNumber: wk
    });
  }
  return out;
}

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      "SELECT * FROM work_templates WHERE user_id=? ORDER BY weekday, start_time",
      [userId]
    );
    res.json({ templates: rows });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { workplace, role, weekday, start_time, end_time, start_date, end_date, notes } = req.body;

    if (!weekday || !start_time || !end_time || !start_date || !end_date) {
      return res.status(400).json({ message: "weekday, start_time, end_time, start_date, end_date required" });
    }

    const [result] = await db.query(
      `INSERT INTO work_templates (user_id, workplace, role, weekday, start_time, end_time, start_date, end_date, notes)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [userId, workplace || null, role || null, weekday, start_time, end_time, start_date, end_date, notes || null]
    );

    res.json({ message: "Template saved", id: result.insertId });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;

    const [result] = await db.query(
      "DELETE FROM work_templates WHERE id=? AND user_id=?",
      [id, userId]
    );

    res.json({ message: "Deleted", deleted: result.affectedRows });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/generate", async (req, res) => {
  try {
    const userId = req.user.id;
    const weekStart = req.query.weekStart; // YYYY-MM-DD (Monday)
    if (!weekStart || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      return res.status(400).json({ message: "weekStart=YYYY-MM-DD (Monday) required" });
    }

    const [templates] = await db.query(
      "SELECT * FROM work_templates WHERE user_id=?",
      [userId]
    );

    let events = [];
    for (const t of templates) {
      events = events.concat(generateWeekEvents(t, weekStart, 8)); // skip week 8
    }

    res.json({ weekStart, events });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
