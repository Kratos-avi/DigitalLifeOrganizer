const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "full_name, email, password required" });
    }

    const safeRole = role === "admin" ? "admin" : "newcomer";

    const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) return res.status(409).json({ message: "Email already exists" });

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?,?,?,?)",
      [full_name, email, password_hash, safeRole]
    );

    const user = { id: result.insertId, email, role: safeRole };
    const token = makeToken(user);

    res.status(201).json({ message: "Registered", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const [rows] = await pool.query(
      "SELECT id, email, role, password_hash FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) return res.status(401).json({ message: "Invalid credentials" });

    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const user = { id: u.id, email: u.email, role: u.role };
    const token = makeToken(user);

    res.json({ message: "Logged in", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
