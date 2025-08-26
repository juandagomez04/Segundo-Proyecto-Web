function getCurrentUser() {
    try { return JSON.parse(sessionStorage.getItem("currentUser")); }
    catch { return null; }
}

// utils
function getRides() {
    try { return JSON.parse(localStorage.getItem("rides")) || []; }
    catch { return []; }
}
function saveRides(rides) {
    localStorage.setItem("rides", JSON.stringify(rides));
}

// inicializa rideIdCounter si no existe (migra desde datos viejos)
(function initRideIdCounter() {
    if (localStorage.getItem("rideIdCounter") == null) {
        const rides = getRides();
        const maxId = rides.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
        localStorage.setItem("rideIdCounter", String(maxId));
    }
})();

function getNextRideId() {
    let c = parseInt(localStorage.getItem("rideIdCounter") || "0", 10);
    c += 1;
    localStorage.setItem("rideIdCounter", String(c));
    return c;
}

document.addEventListener("DOMContentLoaded", () => {
    // 1) Proteger la página: solo drivers pueden estar aquí
    const current = getCurrentUser();
    if (!current || current.type !== "driver") {
        alert("Solo los conductores pueden crear rides 🚫");
        window.location.href = "home_searchrides.html";
        return;
    }

    // 2) Tomar el formulario
    const form = document.querySelector(".ride-form");
    if (!form) return;

    // 3) Manejar submit
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        let rides = JSON.parse(localStorage.getItem("rides")) || [];
        
        const newId = getNextRideId();

        const departure = document.getElementById("departure").value.trim();
        const arrival = document.getElementById("arrival").value.trim();
        const days = Array.from(document.querySelectorAll("input[name='days']:checked"))
            .map(cb => cb.value);
        const time = document.getElementById("time").value;
        const seats = parseInt(document.getElementById("seats").value, 10) || 1;
        const fee = parseFloat(document.getElementById("fee").value) || 0;
        const make = document.getElementById("make").value;
        const model = document.getElementById("model").value.trim();
        const year = document.getElementById("year").value;

        const ride = {
            id: newId,
            driverEmail: current.data.email,
            departure, arrival, days, time, seats, fee,
            make, model, year
        };

        rides.push(ride);
        localStorage.setItem("rides", JSON.stringify(rides));

        alert("Ride creado con éxito ✅");
        window.location.href = "myrides.html";
    });
});
