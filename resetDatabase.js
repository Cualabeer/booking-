import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function resetDatabase(services) {
  await pool.query(`DROP TABLE IF EXISTS bookings`);
  await pool.query(`DROP TABLE IF EXISTS services`);

  await pool.query(`
    CREATE TABLE services (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price NUMERIC(8,2) DEFAULT 0,
      estimated_hours NUMERIC(4,2) DEFAULT 1,
      description TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE bookings (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      phone VARCHAR(50),
      service VARCHAR(100)
    )
  `);

  for (let s of services) {
    await pool.query(
      "INSERT INTO services (name, price, estimated_hours, description) VALUES ($1, $2, $3, $4)",
      [s.name, s.price, s.hours, s.desc]
    );
  }
}