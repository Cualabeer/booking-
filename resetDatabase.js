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
      phone TEXT NOT NULL,
      car_model TEXT,
      date TEXT,
      time TEXT,
      service TEXT NOT NULL,
      notes TEXT
    )
  `);

  await pool.end();
  console.log("Database reset and seeded successfully!");
}