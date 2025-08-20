import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Pool } from "pg";

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Fetch services
app.get("/api/services", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM services ORDER BY id");
  res.json(rows);
});

// Book a service
app.post("/api/book", async (req, res) => {
  try {
    const { name, phone, number_plate, car_model, date, time, service, notes } = req.body;

    if (!/^[A-Za-z0-9]{1,7}$/.test(number_plate)) {
      return res.json({ success: false, message: "Invalid number plate" });
    }

    await pool.query(
      "INSERT INTO bookings(name, phone, number_plate, car_model, date, time, service, notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
      [name, phone, number_plate, car_model, date, time, service, notes]
    );

    res.json({ success: true, message: "Booking successful!" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Booking failed" });
  }
});

// Get all bookings (admin)
app.get("/api/bookings", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM bookings ORDER BY id DESC");
  res.json(rows);
});

// Admin: reset database
app.post("/api/admin/reset-database", async (req, res) => {
  try {
    await pool.query("DROP TABLE IF EXISTS bookings");
    await pool.query("DROP TABLE IF EXISTS services");

    await pool.query(`
      CREATE TABLE services (
        id SERIAL PRIMARY KEY,
        name TEXT,
        price NUMERIC,
        estimated_hours NUMERIC,
        description TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        name TEXT,
        phone NUMERIC,
        number_plate VARCHAR(7),
        car_model TEXT,
        date DATE,
        time TIME,
        service TEXT,
        notes TEXT
      )
    `);

    // Seed some default services
    await pool.query(`
      INSERT INTO services(name, price, estimated_hours, description) VALUES
      ('Oil Change', 50, 1, 'Engine oil and filter change'),
      ('Brake Repair', 150, 2, 'Brake pads replacement'),
      ('Wheel Alignment', 80, 1.5, '4-wheel alignment')
    `);

    res.json({ success: true, message: "Database reset and services seeded." });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Database reset failed" });
  }
});

// Admin: add test bookings
app.post("/api/admin/add-test-data", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT COUNT(*) FROM bookings");
    if (parseInt(rows[0].count) > 0) return res.json({ success: false, message: "Test data already exists" });

    await pool.query(`
      INSERT INTO bookings(name, phone, number_plate, car_model, date, time, service, notes) VALUES
      ('John Doe', 1234567890, 'ABC1234', 'BMW F21', '2025-08-21', '10:00', 'Oil Change', 'No issues'),
      ('Jane Smith', 9876543210, 'XYZ5678', 'VW Golf', '2025-08-22', '14:00', 'Brake Repair', 'Check brake fluid')
    `);

    res.json({ success: true, message: "Test bookings added." });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to add test data" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));