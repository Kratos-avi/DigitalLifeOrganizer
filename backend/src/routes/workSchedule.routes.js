const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect } = require("../middleware/auth");

router.use(protect);

// ---------- Helpers ----------
function getWeekRange(shiftDateStr) {
  const d = new Date(shiftDateStr + "T00:00:00");
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

function minutesToHM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

// ---------- GET shifts ----------
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    let sql = "SELECT * FROM work_schedules WHERE user_id=? ";
    const params = [userId];

    if (from) {
      sql += "AND shift_date >= ? ";
      params.push(from);
    }
    if (to) {
      sql += "AND shift_date <= ? ";
      params.push(to);
    }

    sql += "ORDER BY shift_date ASC, start_time ASC";

    const [rows] = await db.query(sql, params);
    res.json({ shifts: rows });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ---------- POST add shift (ALLOW >24h/week but WARN) ----------
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { shift_date, start_time, end_time, workplace, role, notes } = req.body;

    if (!shift_date || !start_time || !end_time) {
      return res.status(400).json({ message: "shift_date, start_time, end_time are required" });
    }

    // compute minutes for new shift (overnight allowed)
    const startMin = timeToMinutes(start_time);
    const endMin = timeToMinutes(end_time);

    let newShiftMinutes = endMin - startMin;
    if (newShiftMinutes <= 0) {
      newShiftMinutes = (24 * 60 - startMin) + endMin; // overnight
    }

    // optional safety
    if (newShiftMinutes > 16 * 60) {
      return res.status(400).json({ message: "Shift too long. Please enter a valid shift." });
    }

    // find week range
    const { start, end } = getWeekRange(shift_date);

    // current week minutes (handles overnight correctly)
    const [rows] = await db.query(
      `
      SELECT
        COALESCE(SUM(
          TIMESTAMPDIFF(
            MINUTE,
            CONCAT(shift_date,' ',start_time),
            CONCAT(
              DATE_ADD(shift_date, INTERVAL (end_time <= start_time) DAY),
              ' ',
              end_time
            )
          )
        ), 0) AS totalMinutes
      FROM work_schedules
      WHERE user_id=? AND shift_date BETWEEN ? AND ?
      `,
      [userId, start, end]
    );

    const existingMinutes = rows?.[0]?.totalMinutes ?? 0;
    const weeklyTotalAfter = existingMinutes + newShiftMinutes;
    const limitMinutes = 24 * 60;

    // ✅ Always insert (NO blocking)
    const [result] = await db.query(
      `INSERT INTO work_schedules (user_id, shift_date, start_time, end_time, workplace, role, notes)
       VALUES (?,?,?,?,?,?,?)`,
      [userId, shift_date, start_time, end_time, workplace || null, role || null, notes || null]
    );

    // ✅ If exceeds 24h/week, return warning
    const warning =
      weeklyTotalAfter > limitMinutes
        ? {
            code: "WEEKLY_LIMIT_EXCEEDED",
            message: `Reminder: You are over 24 hours this week (${minutesToHM(weeklyTotalAfter)}).`,
            weekStart: start,
            weekEnd: end,
            weeklyTotalMinutes: weeklyTotalAfter,
            weeklyTotalText: minutesToHM(weeklyTotalAfter),
          }
        : null;

    res.json({
      message: "Shift added",
      id: result.insertId,
      warning,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ---------- PUT update shift ----------
router.put("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const { shift_date, start_time, end_time, workplace, role, notes } = req.body;

    const [result] = await db.query(
      `UPDATE work_schedules
       SET shift_date=?, start_time=?, end_time=?, workplace=?, role=?, notes=?
       WHERE id=? AND user_id=?`,
      [shift_date, start_time, end_time, workplace || null, role || null, notes || null, id, userId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ---------- DELETE shift ----------
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;

    const [result] = await db.query("DELETE FROM work_schedules WHERE id=? AND user_id=?", [id, userId]);
    res.json({ message: "Deleted", deleted: result.affectedRows });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
