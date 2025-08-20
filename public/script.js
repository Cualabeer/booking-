document.addEventListener("DOMContentLoaded", async () => {
  const customerBtn = document.getElementById("customerBtn");
  const adminBtn = document.getElementById("adminBtn");
  const customerSection = document.getElementById("customerSection");
  const adminSection = document.getElementById("adminSection");
  const burgerBtn = document.getElementById("burgerBtn");
  const adminNav = document.getElementById("adminNav");
  const serviceSelect = document.querySelector("select[name='service']");
  const form = document.getElementById("bookingForm");
  const bookingsTableBody = document.querySelector("#bookingsTable tbody");

  // Toggle user type
  customerBtn.addEventListener("click", () => {
    customerSection.style.display = "block";
    adminSection.style.display = "none";
  });
  adminBtn.addEventListener("click", async () => {
    customerSection.style.display = "none";
    adminSection.style.display = "block";
    loadBookings();
  });

  // Toggle admin nav
  burgerBtn.addEventListener("click", () => adminNav.classList.toggle("show"));

  // Populate services
  try {
    const services = await fetch("/api/services").then(res => res.json());
    services.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.name;
      opt.textContent = `${s.name} (£${s.price})`;
      serviceSelect.appendChild(opt);
    });
  } catch { alert("Failed to load services."); }

  // Booking form submission
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    if (!/^[A-Za-z0-9]{1,7}$/.test(data.number_plate)) {
      return alert("Number plate must be alphanumeric, max 7 chars");
    }

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      alert(result.message);
      if(result.success) form.reset();
    } catch { alert("Booking failed"); }
  });

  // Admin actions
  document.getElementById("resetDbBtn").addEventListener("click", async () => {
    if (!confirm("Erase all bookings and services?")) return;
    const res = await fetch("/api/admin/reset-database", { method: "POST" });
    const result = await res.json();
    alert(result.message);
    adminNav.classList.remove("show");
    loadBookings();
  });

  document.getElementById("addTestDataBtn").addEventListener("click", async () => {
    const res = await fetch("/api/admin/add-test-data", { method: "POST" });
    const result = await res.json();
    alert(result.message);
    adminNav.classList.remove("show");
    loadBookings();
  });

  // Load bookings table
  async function loadBookings() {
    bookingsTableBody.innerHTML = "";
    try {
      const bookings = await fetch("/api/bookings").then(r => r.json());
      bookings.forEach(b => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${b.name}</td><td>${b.phone}</td><td>${b.number_plate}</td>
          <td>${b.car_model}</td><td>${b.date}</td><td>${b.time}</td>
          <td>${b.service}</td><td>${b.notes}</td>`;
        bookingsTableBody.appendChild(row);
      });
    } catch { alert("Failed to load bookings."); }
  }
});