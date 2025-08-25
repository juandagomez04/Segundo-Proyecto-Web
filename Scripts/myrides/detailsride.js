function getCurrentUser() {
    try { return JSON.parse(sessionStorage.getItem("currentUser")); }
    catch { return null; }
}
function getRides() {
    try { return JSON.parse(localStorage.getItem("rides")) || []; }
    catch { return []; }
}
function getParam(name) {
    const p = new URLSearchParams(location.search);
    return p.get(name);
}

document.addEventListener("DOMContentLoaded", () => {
    // (Opcional) proteger para conductores
    const current = getCurrentUser();
    if (!current || current.type !== "driver") {
        alert("Acceso denegado. Solo conductores.");
        location.href = "home_searchrides.html";
        return;
    }

    const id = Number(getParam("id"));
    const rides = getRides();
    const ride = rides.find(r => r.id === id);

    if (!ride) {
        alert("Ride no encontrado.");
        location.href = "myrides.html";
        return;
    }

    // Rellenar campos
    const $ = (id) => document.getElementById(id);

    $("departure").value = ride.departure || "";
    $("arrival").value = ride.arrival || "";
    $("seats").value = ride.seats ?? 1;
    $("fee").value = ride.fee ?? 0;
    $("model").value = ride.model || "";
    $("year").value = ride.year || "";

    // Marca (select): seleccionar opción, y si no existe la creamos
    const makeSel = $("make");
    const opt = Array.from(makeSel.options).find(o => o.value === ride.make);
    if (opt) {
        makeSel.value = ride.make;
    } else {
        const o = document.createElement("option");
        o.value = o.textContent = ride.make || "Other";
        makeSel.appendChild(o);
        makeSel.value = o.value;
    }

    // Time (select): igual lógica que make
    const timeSel = $("time");
    const timeOpt = Array.from(timeSel.options).find(o => o.value === ride.time || o.textContent === ride.time);
    if (timeOpt) {
        timeSel.value = timeOpt.value;
    } else {
        const o = document.createElement("option");
        o.value = o.textContent = ride.time || "";
        timeSel.appendChild(o);
        timeSel.value = o.value;
    }

    // Days: marcar solo los que tenga el ride
    const dayChecks = document.querySelectorAll("input[name='days']");
    const chosen = new Set(ride.days || []);
    dayChecks.forEach(cb => {
        cb.checked = chosen.has(cb.value);
    });

    // (Opcional) mostrar nombre del conductor en la sección de perfil
    const profile = document.querySelector(".profile-section p");
    if (profile && current?.data?.fname) {
        const fn = current.data.fname || "";
        const ln = current.data.lname || "";
        profile.textContent = (fn + " " + ln).trim() || current.data.email || "Driver";
    }
});
