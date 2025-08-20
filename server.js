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

// Get services
app.get("/api/services", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM services ORDER BY id");
  res.json(rows);
});

// Book a service
app.post("/api/book", async (req, res) => {
  const { name, phone, number_plate, car_model, date, time, notes, service } = req.body;

  if (!/^[A-Za-z0-9]{1,7}$/.test(number_plate)) {
    return res.status(400).json({ success: false, message: "Invalid number plate!" });
  }

  await pool.query(
    `INSERT INTO bookings (name, phone, number_plate, car_model, date, time, service, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [name, phone, number_plate, car_model, date, time, service, notes]
  );
  res.json({ success: true, message: "Booking confirmed!" });
});

// Get all bookings
app.get("/api/bookings", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM bookings ORDER BY id DESC");
  res.json(rows);
});

// Admin: reset database
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

// Admin: add test bookings
app.post("/api/admin/add-test-data", async (req, res) => {
  try {
    const sampleBookings = [
      { name: "Alice Smith", phone: 5551234, number_plate: "AB123CD", car_model: "BMW F21", date: "2025-08-21", time: "10:00", service: "Oil Change", notes: "First-time customer" },
      { name: "Bob Johnson", phone: 5555678, number_plate: "XY987ZT", car_model: "Audi A3", date: "2025-08-22", time: "14:30", service: "Brake Job", notes: "Call on arrival" },
      { name: "Charlie Lee", phone: 5559012, number_plate: "GH456JK", car_model: "VW Golf", date: "2025-08-23", time: "09:15", service: "Wheel Alignment, Air Conditioning", notes: "VIP member" }
    ];

    for (let b of sampleBookings) {
      await pool.query(
        `INSERT INTO bookings (name, phone, number_plate, car_model, date, time, service, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [b.name, b.phone, b.number_plate, b.car_model, b.date, b.time, b.service, b.notes]
      );
    }

    res.json({ success: true, message: "Sample bookings added successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add sample bookings." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Booking app running on port ${PORT}`));