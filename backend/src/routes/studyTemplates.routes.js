const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect } = require("../middleware/auth");

router.use(protect);

// Helpers
function toYMD(d) { return d.toISOString().slice(0, 10); }
function parseYMD(s) { return new Date(s + "T00:00:00"); }

// ISO weekday -> Mon=1..Sun=7
function isoWeekday(d) {
  const w = d.getDay(); // Sun=0..Sat=6
  return w === 0 ? 7 : w;
}

// week number from termStart (Mon..Sun blocks), week1 starts at termStart date
function termWeekNumber(termStartStr, dateStr) {
  const start = parseYMD(termStartStr);
  const cur = parseYMD(dateStr);
  const diffDays = Math.floor((cur - start) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1; // week 1..n
}

// generate all dates in month that match weekday, within [start_date, end_date], skipping week 8
function generateMonthEvents(template, monthStr, skipWeek = 8) {
  const [Y, M] = monthStr.split("-").map(Number); // YYYY-MM
  const first = new Date(Date.UTC(Y, M - 1, 1));
  const last = new Date(Date.UTC(Y, M, 0)); // last day

  const startBound = parseYMD(template.start_date);
  const endBound = parseYMD(template.end_date);

  const out = [];
  for (let d = new Date(first); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    const local = new Date(d.toISOString().slice(0,10) + "T00:00:00");
    const ymd = toYMD(local);

    // bounds
    if (local < startBound || local > endBound) continue;

    // weekday match
    if (isoWeekday(local) !== Number(template.weekday)) continue;

    // skip week 8
    const wk = termWeekNumber(template.start_date, ymd);
    if (wk === skipWeek) continue;

    out.push({
      type: "template",
      template_id: template.id,
      date: ymd,
      subject: template.subject,
      start_time: template.start_time,
      end_time: template.end_time,
      notes: template.notes || null,
      weekNumber: wk
    });
  }
  return out;
}

// GET templates
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      "SELECT * FROM study_templates WHERE user_id=? ORDER BY weekday, start_time",
      [userId]
    );
    res.json({ templates: rows });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST template
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, weekday, start_time, end_time, start_date, end_date, notes } = req.body;

    if (!subject || !weekday || !start_time || !end_time || !start_date || !end_date) {
      return res.status(400).json({ message: "subject, weekday, start_time, end_time, start_date, end_date required" });
    }

    const [result] = await db.query(
      `INSERT INTO study_templates (user_id, subject, weekday, start_time, end_time, start_date, end_date, notes)
       VALUES (?,?,?,?,?,?,?,?)`,
      [userId, subject, weekday, start_time, end_time, start_date, end_date, notes || null]
    );

    res.json({ message: "Template saved", id: result.insertId });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// DELETE template
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const [result] = await db.query(
      "DELETE FROM study_templates WHERE id=? AND user_id=?",
      [id, userId]
    );
    res.json({ message: "Deleted", deleted: result.affectedRows });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Generate events for a month: /api/study-templates/generate?month=YYYY-MM
router.get("/generate", async (req, res) => {
  try {
    const userId = req.user.id;
    const month = req.query.month; // YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "month=YYYY-MM is required" });
    }

    const [templates] = await db.query(
      "SELECT * FROM study_templates WHERE user_id=?",
      [userId]
    );

    let events = [];
    for (const t of templates) {
      events = events.concat(generateMonthEvents(t, month, 8)); // skip week 8
    }

    res.json({ month, events });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
