let selectedServices = [];

async function loadServices() {
  const res = await fetch("/api/services");
  const services = await res.json();
  const select = document.getElementById("serviceSelect");
  services.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.name;
    opt.textContent = `${s.name} (£${s.price})`;
    select.appendChild(opt);
  });
}

document.getElementById("bookingForm").addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    name: e.target.name.value,
    phone: e.target.phone.value,
    car_model: e.target.car_model.value,
    date: e.target.date.value,
    time: e.target.time.value,
    notes: e.target.notes.value,
    service: e.target.service.value
  };
  const res = await fetch("/api/book", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data)});
  const json = await res.json();
  alert(json.message);
  e.target.reset();
});

async function loadBookings() {
  const res = await fetch("/api/bookings");
  const bookings = await res.json();
  const tbody = document.querySelector("#bookingsTable tbody");
  tbody.innerHTML = "";
  bookings.forEach(b => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${b.id}</td><td>${b.name}</td><td>${b.phone}</td>
      <td>${b.car_model}</td><td>${b.date}</td><td>${b.time}</td>
      <td>${b.service}</td><td>${b.notes}</td>`;
    tbody.appendChild(row);
  });
}

document.getElementById("resetDbBtn").addEventListener("click", async () => {
  if (!confirm("Reset database? This removes all data!")) return;
  const res = await fetch("/api/admin/reset-database", { method: "POST" });
  const json = await res.json();
  alert(json.message);
  loadBookings();
  checkBookingsForTestData();
});

// Add Test Data button
async function checkBookingsForTestData() {
  const res = await fetch("/api/bookings");
  const bookings = await res.json();
  const btn = document.getElementById("addTestDataBtn");
  btn.style.display = bookings.length > 0 ? "none" : "inline-block";
}

document.getElementById("addTestDataBtn").addEventListener("click", async () => {
  if (!confirm("Add sample bookings to the database?")) return;
  const btn = document.getElementById("addTestDataBtn");
  btn.disabled = true;
  document.getElementById("adminMessage").textContent = "Adding test bookings...";
  const res = await fetch("/api/admin/add-test-data", { method: "POST" });
  const json = await res.json();
  document.getElementById("adminMessage").textContent = json.message;
  btn.style.display = "none";
  loadBookings();
});

function openTab(tabName) {
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
  document.getElementById(tabName + "Tab").style.display = "block";
  if (tabName === "admin") loadBookings();
}

window.onload = () => {
  openTab("booking");
  loadServices();
  checkBookingsForTestData();
};