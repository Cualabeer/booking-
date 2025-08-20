document.addEventListener("DOMContentLoaded", async () => {
  const serviceSelect = document.querySelector("select[name='service']");
  const form = document.getElementById("bookingForm");

  // Fetch services and populate select
  try {
    const services = await fetch("/api/services").then(res => res.json());
    services.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.name;
      opt.textContent = `${s.name} (£${s.price})`;
      serviceSelect.appendChild(opt);
    });
  } catch (err) {
    alert("Failed to load services.");
    console.error(err);
  }

  // Handle form submission
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    // Client-side validation for number plate
    if (!/^[A-Za-z0-9]{1,7}$/.test(data.number_plate)) {
      alert("Number plate must be alphanumeric and max 7 characters.");
      return;
    }

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      alert(result.message);
      if (result.success) form.reset();
    } catch (err) {
      alert("Booking failed. Please try again.");
      console.error(err);
    }
  });
});