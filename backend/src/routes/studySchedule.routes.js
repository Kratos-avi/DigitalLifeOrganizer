const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect } = require("../middleware/auth");

router.use(protect);

// ---------- Helpers ----------
function getWeekRange(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = (d.getDay() + 6) % 7; // Mon=0..Sun=6

  const monday = new Date(d);
  monday.setDate(d.getDate() - day);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const toYMD = (x) => x.toISOString().slice(0, 10);
  return { start: toYMD(monday), end: toYMD(sunday) };
}

function timeToMinutes(t) {
  const [hh, mm] = String(t).split(":");
  return (parseInt(hh, 10) || 0) * 60 + (parseInt(mm, 10) || 0);
}

function calcMinutes(start_time, end_time) {
  // overnight allowed
  const s = timeToMinutes(start_time);
  const e = timeToMinutes(end_time);
  let diff = e - s;
  if (diff <= 0) diff = (24 * 60 - s) + e;
  return diff;
}

function minutesToHM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

// ---------- GET study sessions ----------
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    let sql = "SELECT * FROM study_schedules WHERE user_id=? ";
    const params = [userId];

    if (from) {
      sql += "AND study_date >= ? ";
      params.push(from);
    }
    if (to) {
      sql += "AND study_date <= ? ";
      params.push(to);
    }

    sql += "ORDER BY study_date DESC, start_time ASC";

    const [rows] = await db.query(sql, params);

    // Weekly total (based on current week)
    const today = new Date().toISOString().slice(0, 10);
    const { start, end } = getWeekRange(today);

    const [weekRows] = await db.query(
      `
      SELECT
        COALESCE(SUM(
          TIMESTAMPDIFF(
            MINUTE,
            CONCAT(study_date,' ',start_time),
            CONCAT(
              DATE_ADD(study_date, INTERVAL (end_time <= start_time) DAY),
              ' ',
              end_time
            )
          )
        ), 0) AS totalMinutes
      FROM study_schedules
      WHERE user_id=? AND study_date BETWEEN ? AND ?
      `,
      [userId, start, end]
    );

    const weeklyTotalMinutes = weekRows?.[0]?.totalMinutes ?? 0;

    res.json({
      sessions: rows,
      weekly: {
        weekStart: start,
        weekEnd: end,
        totalMinutes: weeklyTotalMinutes,
        totalText: minutesToHM(weeklyTotalMinutes),
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ---------- POST add study session ----------
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { study_date, start_time, end_time, subject, notes } = req.body;

    if (!study_date || !start_time || !end_time || !subject) {
      return res.status(400).json({ message: "study_date, start_time, end_time, subject are required" });
    }

    const minutes = calcMinutes(start_time, end_time);

    // Optional safety: max 12 hours per single session
    if (minutes > 12 * 60) {
      return res.status(400).json({ message: "Study session too long. Please enter a valid session." });
    }

    const [result] = await db.query(
      `INSERT INTO study_schedules (user_id, study_date, start_time, end_time, subject, notes)
       VALUES (?,?,?,?,?,?)`,
      [userId, study_date, start_time, end_time, subject, notes || null]
    );

    // After insert, compute current week total and return reminder if needed
    const { start, end } = getWeekRange(study_date);

    const [weekRows] = await db.query(
      `
      SELECT
        COALESCE(SUM(
          TIMESTAMPDIFF(
            MINUTE,
            CONCAT(study_date,' ',start_time),
            CONCAT(
              DATE_ADD(study_date, INTERVAL (end_time <= start_time) DAY),
              ' ',
              end_time
            )
          )
        ), 0) AS totalMinutes
      FROM study_schedules
      WHERE user_id=? AND study_date BETWEEN ? AND ?
      `,
      [userId, start, end]
    );

    const weeklyTotalMinutes = weekRows?.[0]?.totalMinutes ?? 0;

    // Example UI reminder rule (you can change):
    // if weekly study < 10 hours, show reminder
    const reminder =
      weeklyTotalMinutes < 10 * 60
        ? {
            code: "LOW_STUDY_HOURS",
            message: `Reminder: Your study hours this week are ${minutesToHM(weeklyTotalMinutes)}. Try to reach 10h+ for good progress.`,
            weekStart: start,
            weekEnd: end,
            weeklyTotalMinutes,
            weeklyTotalText: minutesToHM(weeklyTotalMinutes),
          }
        : null;

    res.json({
      message: "Study session added",
      id: result.insertId,
      weeklyTotalMinutes,
      weeklyTotalText: minutesToHM(weeklyTotalMinutes),
      reminder,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ---------- DELETE study session ----------
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;

    const [result] = await db.query(
      "DELETE FROM study_schedules WHERE id=? AND user_id=?",
      [id, userId]
    );

    res.json({ message: "Deleted", deleted: result.affectedRows });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
