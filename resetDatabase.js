import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function resetDatabase(services = []) {
  await pool.query(`DROP TABLE IF EXISTS bookings`);
  await pool.query(`DROP TABLE IF EXISTS services`);

  await pool.query(`
    CREATE TABLE services (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC NOT NULL,
      estimated_hours NUMERIC NOT NULL,
      description TEXT
    )
  `);

  for (let s of services) {
    await pool.query(
      "INSERT INTO services (name, price, estimated_hours, description) VALUES ($1,$2,$3,$4)",
      [s.name, s.price, s.hours, s.desc]
    );
  }

  await pool.query(`
    CREATE TABLE bookings (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone BIGINT NOT NULL,
      number_plate VARCHAR(7) NOT NULL,
      car_model TEXT,
      date TEXT,
      time TEXT,
      service TEXT NOT NULL,
      notes TEXT
    )
  `);

  await pool.query(
    `INSERT INTO bookings (name, phone, number_plate, car_model, date, time, service, notes)
     VALUES 
     ('Alice Smith', 5551234, 'AB123CD', 'BMW F21','2025-08-21','10:00','Oil Change','First-time customer'),
     ('Bob Johnson', 5555678, 'XY987ZT', 'Audi A3','2025-08-22','14:30','Brake Job','Call on arrival'),
     ('Charlie Lee', 5559012, 'GH456JK', 'VW Golf','2025-08-23','09:15','Wheel Alignment, Air Conditioning','VIP member')
    `
  );

  await pool.end();
  console.log("Database reset and seeded successfully!");
}