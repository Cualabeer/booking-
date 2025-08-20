import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3000;

// Parse form bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views"));

// Postgres pool (Render Postgres requires SSL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create table on startup
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT NOT NULL,
      date DATE NOT NULL,
      time TIME NOT NULL
    )
  `);
}
init().catch(err => {
  console.error("Failed to init DB:", err);
  process.exit(1);
});

// Homepage booking form
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "views" });
});

// Admin/staff view: list bookings
app.get("/bookings", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, phone, service, date, time FROM bookings ORDER BY date, time"
  );

  let html = `
    <h1>Bookings</h1>
    <a href="/">New Booking</a>
    <table border="1" cellpadding="6" cellspacing="0" style="margin-top:10px;">
      <tr>
        <th>ID</th><th>Name</th><th>Phone</th><th>Service</th><th>Date</th><th>Time</th><th>Action</th>
      </tr>
  `;

  for (const b of rows) {
    html += `
      <tr>
        <td>${b.id}</td>
        <td>${escapeHtml(b.name)}</td>
        <td>${escapeHtml(b.phone)}</td>
        <td>${escapeHtml(b.service)}</td>
        <td>${b.date}</td>
        <td>${b.time}</td>
        <td>
          <form action="/delete/${b.id}" method="POST" style="display:inline;">
            <button type="submit">Delete</button>
          </form>
        </td>
      </tr>
    `;
  }

  html += "</table>";
  res.send(html);
});

// Handle booking submission (online or phone)
app.post("/book", async (req, res) => {
  const { name, phone, service, date, time } = req.body;

  await pool.query(
    "INSERT INTO bookings (name, phone, service, date, time) VALUES ($1, $2, $3, $4::date, $5::time)",
    [name, phone, service, date, time]
  );

  res.redirect("/bookings");
});

// Delete a booking
app.post("/delete/:id", async (req, res) => {
  await pool.query("DELETE FROM bookings WHERE id = $1", [req.params.id]);
  res.redirect("/bookings");
});

// Tiny helper to avoid HTML injection in the table
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

app.listen(port, () => {
  console.log(`Booking app running at http://localhost:${port}`);
});