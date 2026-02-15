const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const starterTasks = require("../data/starterTasks");

const router = express.Router();

/* ===============================
   CREATE JWT TOKEN
================================= */
function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/* ===============================
   REGISTER
================================= */
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Basic validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        message: "full_name, email and password are required"
      });
    }

    const safeRole = role === "admin" ? "admin" : "newcomer";

    // Check if email already exists
    const [exists] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (exists.length) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?,?,?,?)",
      [full_name, email, password_hash, safeRole]
    );

    const user = {
      id: result.insertId,
      email,
      role: safeRole
    };

    /* ===============================
       AUTO-ADD STARTER TASKS
       (ONLY FOR NEWCOMER USERS)
    ================================= */
    if (safeRole === "newcomer") {
      const today = new Date();

      for (const t of starterTasks) {
        const due = new Date(today);
        due.setDate(due.getDate() + (t.due_days || 7));
        const dueDate = due.toISOString().slice(0, 10);

      await pool.query(
      "INSERT INTO tasks (user_id, title, description, due_date, is_starter) VALUES (?,?,?,?,1)",
      [user.id, t.title, t.description || null, dueDate]
);
      }
    }

    const token = makeToken(user);

    return res.status(201).json({
      message: "Registered",
      token,
      user
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   LOGIN
================================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required"
      });
    }

    const [rows] = await pool.query(
      "SELECT id, email, role, password_hash FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const u = rows[0];

    const passwordMatch = await bcrypt.compare(password, u.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = {
      id: u.id,
      email: u.email,
      role: u.role
    };

    const token = makeToken(user);

    return res.json({
      message: "Logged in",
      token,
      user
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
