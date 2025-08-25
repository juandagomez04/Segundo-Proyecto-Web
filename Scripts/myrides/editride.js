// Scripts/myrides/editride.js
function getCurrentUser() {
  try { return JSON.parse(sessionStorage.getItem("currentUser")); }
  catch { return null; }
}
function getRides() {
  try { return JSON.parse(localStorage.getItem("rides")) || []; }
  catch { return []; }
}
function setRides(r) {
  localStorage.setItem("rides", JSON.stringify(r));
}
function getParam(name) {
  const p = new URLSearchParams(location.search);
  return p.get(name);
}
function selectIfExists(selectEl, value) {
  if (!selectEl) return;
  const opt = Array.from(selectEl.options).find(o => o.value === value || o.textContent === value);
  if (opt) {
    selectEl.value = opt.value;
  } else if (value) {
    const o = document.createElement("option");
    o.value = o.textContent = value;
    selectEl.appendChild(o);
    selectEl.value = value;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 1) Protección básica: solo drivers
  const current = getCurrentUser();
  if (!current || current.type !== "driver") {
    alert("Acceso denegado. Solo conductores pueden editar rides.");
    location.href = "home_searchrides.html";
    return;
  }

  // 2) Obtener ID y ride
  const id = Number(getParam("id"));
  if (!id) {
    alert("ID de ride inválido.");
    location.href = "myrides.html";
    return;
  }
  const rides = getRides();
  const idx = rides.findIndex(r => r.id === id);
  if (idx === -1) {
    alert("Ride no encontrado.");
    location.href = "myrides.html";
    return;
  }
  const ride = rides[idx];

  // 3) Verificar propiedad (solo el dueño puede editar)
  if (ride.driverEmail !== current.data.email) {
    alert("No puedes editar un ride que no es tuyo.");
    location.href = "myrides.html";
    return;
  }

  // 4) Referencias a campos
  const $ = (id) => document.getElementById(id);
  const form = document.querySelector(".ride-form");
  if (!form) return;

  const departureEl = $("departure");
  const arrivalEl   = $("arrival");
  const seatsEl     = $("seats");
  const feeEl       = $("fee");
  const modelEl     = $("model");
  const yearEl      = $("year");
  const timeSel     = $("time");
  const makeSel     = $("make");

  // 5) Prellenar datos
  departureEl.value = ride.departure || "";
  arrivalEl.value   = ride.arrival   || "";
  seatsEl.value     = ride.seats ?? 1;
  feeEl.value       = ride.fee   ?? 0;
  modelEl.value     = ride.model || "";
  yearEl.value      = ride.year  || "";

  selectIfExists(makeSel, ride.make);
  selectIfExists(timeSel, ride.time);

  // Días
  const chosen = new Set(ride.days || []);
  document.querySelectorAll("input[name='days']").forEach(cb => {
    cb.checked = chosen.has(cb.value);
  });

  // 6) Guardar cambios
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Capturar valores
    const newDeparture = departureEl.value.trim();
    const newArrival   = arrivalEl.value.trim();
    const newDays = Array.from(document.querySelectorAll("input[name='days']:checked"))
                         .map(cb => cb.value);
    const newTime  = timeSel.value;
    const newSeats = parseInt(seatsEl.value, 10) || 1;
    const newFee   = parseFloat(feeEl.value) || 0;
    const newMake  = makeSel.value;
    const newModel = modelEl.value.trim();
    const newYear  = yearEl.value;

    // Validaciones simples
    if (!newDeparture || !newArrival) {
      alert("Debes completar Departure y Arrival.");
      return;
    }

    // Sobrescribir objeto
    rides[idx] = {
      ...ride, // conserva id y driverEmail
      departure: newDeparture,
      arrival: newArrival,
      days: newDays,
      time: newTime,
      seats: newSeats,
      fee: newFee,
      make: newMake,
      model: newModel,
      year: newYear
    };

    setRides(rides);
    alert("Ride actualizado ✅");
    location.href = "myrides.html";
  });
});
