import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, password required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "invalid email" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "password must be at least 8 characters" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "email already registered" });
  }

  const hash = await bcrypt.hash(password, 10);
  const result = db
    .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run(name, email, hash);

  const user = { id: result.lastInsertRowid, name, email };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({ token, user });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!row) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const match = await bcrypt.compare(password, row.password_hash);
  if (!match) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const user = { id: row.id, name: row.name, email: row.email };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });

  res.json({ token, user });
});

// ME (verify token / get current user)
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ error: "no token provided" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ user: { id: payload.id, name: payload.name, email: payload.email } });
  } catch {
    res.status(401).json({ error: "invalid or expired token" });
  }
});

export default router;
