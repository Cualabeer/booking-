import express from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import { resetDatabase } from "./resetDatabase.js";

dotenv.config();
const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Get all services
app.get("/api/services", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM services ORDER BY id");
  res.json(rows);
});

// Book a service
app.post("/api/book", async (req, res) => {
  const { name, phone, service } = req.body;
  await pool.query(
    "INSERT INTO bookings (name, phone, service) VALUES ($1, $2, $3)",
    [name, phone, service]
  );
  res.json({ success: true, message: "Booking confirmed!" });
});

// Admin: Reset / seed database
app.post("/api/admin/reset-database", async (req, res) => {
  try {
    const services = [
      { name: "Oil Change", price: 50, hours: 1, desc: "Full oil and filter service" },
      { name: "Brake Job", price: 120, hours: 2, desc: "Pads, discs, and fluid replacement" },
      { name: "Diagnostics / ECU", price: 80, hours: 3, desc: "Engine and ECU diagnostics" },
      { name: "Wheel Alignment", price: 60, hours: 1.5, desc: "Full 4-wheel alignment" },
      { name: "Air Conditioning", price: 70, hours: 2, desc: "AC recharge and inspection" },
      { name: "Tyres Replacement", price: 100, hours: 1.5, desc: "New tyres and balancing" },
      { name: "Bodywork / Paint", price: 300, hours: 5, desc: "Minor repairs and paintwork" },
      { name: "Performance Upgrade", price: 200, hours: 4, desc: "Tuning and performance enhancements" },
    ];
    await resetDatabase(services);
    res.json({ success: true, message: "Database reset and seeded successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database reset failed!" });
  }
});

// List all bookings (admin)
app.get("/api/bookings", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM bookings ORDER BY id DESC");
  res.json(rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));