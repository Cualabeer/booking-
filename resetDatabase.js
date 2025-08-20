import express from "express";
import pkg from "pg";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pkg;

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Customer Booking Form
app.get("/", async (req, res) => {
  const { rows: services } = await pool.query("SELECT * FROM services ORDER BY name");
  res.render("index", { services, laborRate: 35 });
});

app.post("/book", async (req, res) => {
  const { name, phone, service } = req.body;
  try {
    await pool.query(
      "INSERT INTO bookings (name, phone, service) VALUES ($1, $2, $3)",
      [name, phone, service]
    );
    res.redirect("/bookings");
  } catch (err) {
    console.error("Failed to save booking:", err);
    res.status(500).send("Error saving booking");
  }
});

// Admin: Bookings with savings
app.get("/bookings", async (req, res) => {
  const laborRate = 35;
  const { rows: bookings } = await pool.query(`
    SELECT b.id, b.name, b.phone, s.name AS service_name, s.price, s.estimated_hours
    FROM bookings b
    LEFT JOIN services s ON b.service = s.name
    ORDER BY b.id DESC
  `);

  bookings.forEach(b => {
    b.savings = Math.max((b.estimated_hours * laborRate) - b.price, 0).toFixed(2);
  });

  res.render("bookings", { bookings });
});

app.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM bookings WHERE id=$1", [id]);
  res.redirect("/bookings");
});

// Admin: Manage Services
app.get("/services", async (req, res) => {
  const { rows: services } = await pool.query("SELECT * FROM services ORDER BY name");
  res.render("services", { services });
});

app.post("/services/add", async (req, res) => {
  const { name, price, estimated_hours, description } = req.body;
  await pool.query(
    "INSERT INTO services (name, price, estimated_hours, description) VALUES ($1, $2, $3, $4)",
    [name, price, estimated_hours, description]
  );
  res.redirect("/services");
});

app.post("/services/delete/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM services WHERE id=$1", [id]);
  res.redirect("/services");
});

app.post("/services/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, estimated_hours, description } = req.body;
  await pool.query(
    "UPDATE services SET name=$1, price=$2, estimated_hours=$3, description=$4 WHERE id=$5",
    [name, price, estimated_hours, description, id]
  );
  res.redirect("/services");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Booking app running...");
});