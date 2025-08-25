// Scripts/myrides/myrides.js
function getCurrentUser() {
    try { return JSON.parse(sessionStorage.getItem("currentUser")); }
    catch { return null; }
}

function getRides() {
    try { return JSON.parse(localStorage.getItem("rides")) || []; }
    catch { return []; }
}

function setRides(rides) {
    localStorage.setItem("rides", JSON.stringify(rides));
}

function formatCar(make, model, year) {
    const parts = [make, model, year].filter(Boolean);
    return parts.join(" ");
}

function renderRows(rides, tbody) {
    if (!rides.length) {
        tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; opacity:.7">
          No tienes rides creados todavía.
        </td>
      </tr>`;
        return;
    }

    // dentro de renderRows()
    tbody.innerHTML = rides.map(r => `
    <tr data-id="${r.id}">
        <td><a href="detailsride.html?id=${r.id}">${r.departure ?? ""}</a></td>
        <td>${r.arrival ?? ""}</td>
        <td>${r.seats ?? ""}</td>
        <td>${formatCar(r.make, r.model, r.year)}</td>
        <td>${(r.fee ?? 0)}</td>
        <td class="actions">
        <a href="editride.html?id=${r.id}">Edit</a>
        <a href="#" class="delete-ride">Delete</a>
        </td>
    </tr>
    `).join("");
}

function attachDeleteHandlers(tbody, driverEmail) {
    tbody.addEventListener("click", (e) => {
        const link = e.target.closest(".delete-ride");
        if (!link) return;

        e.preventDefault();
        const tr = link.closest("tr");
        const id = Number(tr?.dataset?.id);
        if (!id) return;

        if (!confirm("¿Eliminar este ride?")) return;

        let rides = getRides();
        // Solo permite borrar si el ride es del mismo conductor
        rides = rides.filter(r => !(r.id === id && r.driverEmail === driverEmail));
        setRides(rides);

        // Quitar fila del DOM o re-renderizar
        tr.remove();
        if (!tbody.querySelector("tr")) {
            renderRows([], tbody);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const current = getCurrentUser();

    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    const all = getRides();
    const mine = all.filter(r => r.driverEmail === current.data.email);

    renderRows(mine, tbody);
    attachDeleteHandlers(tbody, current.data.email);
});
