document.addEventListener("DOMContentLoaded", async () => {
  const serviceSelect = document.querySelector("select[name='service']");
  const form = document.getElementById("bookingForm");

  // Fetch services
  const services = await fetch("/api/services").then(r => r.json());
  services.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.name;
    opt.textContent = `${s.name} (£${s.price})`;
    serviceSelect.appendChild(opt);
  });

  // Form submit
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message);
    if(result.success) form.reset();
  });
});