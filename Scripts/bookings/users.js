// Scripts/bookings/user.js
(function () {
    const $ = (s) => document.querySelector(s);

    function getCurrentUser() { try { return JSON.parse(sessionStorage.getItem("currentUser")); } catch { return null; } }
    function getRides() { try { return JSON.parse(localStorage.getItem("rides")) || []; } catch { return []; } }
    function getDrivers() { try { return JSON.parse(localStorage.getItem("drivers")) || []; } catch { return []; } }
    function getBookings() { try { return JSON.parse(localStorage.getItem("bookings")) || []; } catch { return []; } }

    function driverNameByEmail(email) {
        const d = getDrivers().find(x => x.email === email);
        return d ? `${d.fname || ""} ${d.lname || ""}`.trim() || email : (email || "").split("@")[0] || "Driver";
    }
    const rideById = (id) => getRides().find(r => r.id === id);
    const myBookings = (mail) => getBookings().filter(b => b.userEmail === mail);

    function renderRows(rows) {
        const tbody = document.querySelector("#bookingsBody");
        const th3 = document.querySelector("#col3");
        if (th3) th3.textContent = "Status";
        if (!rows.length) { tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;opacity:.7">You don't have bookings yet.</td></tr>`; return; }

        tbody.innerHTML = rows.map(b => {
            const ride = rideById(b.rideId);
            const route = ride ? `${ride.departure} - ${ride.arrival}` : `Ride #${b.rideId}`;
            const driver = ride ? driverNameByEmail(ride.driverEmail) : "Driver";
            const statusBadge = b.status === "Aceptado"
                ? `<span class="badge accepted">Accepted</span>`
                : `<span class="badge pending">Waiting</span>`;
            return `
            <tr data-bid="${b.id}">
                <td><strong>${driver}</strong></td>
                <td>${route}</td>
                <td>${statusBadge}</td>
            </tr>`;
        }).join("");
    }

    function init() {
        const current = getCurrentUser();
        if (!current || current.type !== "user") return;     // no expulsar
        renderRows(myBookings(current.data.email));
    }

    // 🔑 Igual que arriba: corre ya si el DOM está listo
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
