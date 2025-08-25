function getCurrentUser() {
    try { return JSON.parse(sessionStorage.getItem("currentUser")); }
    catch { return null; }
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
        // id autoincremental (simple): último id + 1
        const newId = rides.length ? (rides[rides.length - 1].id + 1) : 1;

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
