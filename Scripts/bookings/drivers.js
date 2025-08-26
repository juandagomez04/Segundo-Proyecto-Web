// Scripts/bookings/driver.js
(function () {
    const $ = (s) => document.querySelector(s);

    function getCurrentUser() { try { return JSON.parse(sessionStorage.getItem("currentUser")); } catch { return null; } }
    function getRides() { try { return JSON.parse(localStorage.getItem("rides")) || []; } catch { return []; } }
    function getUsers() { try { return JSON.parse(localStorage.getItem("users")) || []; } catch { return []; } }
    function getBookings() { try { return JSON.parse(localStorage.getItem("bookings")) || []; } catch { return []; } }
    function saveBookings(b) { localStorage.setItem("bookings", JSON.stringify(b)); }

    function userNameByEmail(email) {
        const u = getUsers().find(x => x.email === email);
        return u ? `${u.fname || ""} ${u.lname || ""}`.trim() || email : (email || "").split("@")[0] || "User";
    }
    const rideById = (id) => getRides().find(r => r.id === id);

    function myPendingBookings(driverEmail) {
        const rideIdsMine = new Set(getRides().filter(r => r.driverEmail === driverEmail).map(r => r.id));
        return getBookings().filter(b => rideIdsMine.has(b.rideId));
    }

    function renderRows(rows) {
        const tbody = document.querySelector("#bookingsBody");
        const th3 = document.querySelector("#col3");
        if (th3) th3.textContent = "Accept / Reject";
        if (!rows.length) { tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;opacity:.7">No bookings yet.</td></tr>`; return; }

        tbody.innerHTML = rows.map(b => {
            const ride = rideById(b.rideId);
            const route = ride ? `${ride.departure} - ${ride.arrival}` : `Ride #${b.rideId}`;
            const requester = userNameByEmail(b.userEmail);
            const actions = b.status === "Aceptado"
                ? `<span class="badge accepted">Aceptado</span>`
                : `<a href="#" class="accept" data-id="${b.id}">Accept</a> | <a href="#" class="reject" data-id="${b.id}">Reject</a>`;
            return `
            <tr data-bid="${b.id}">
                <td><strong>${requester}</strong></td>
                <td>${route}</td>
                <td>${actions}</td>
            </tr>`;
        }).join("");
    }

    function attachActions(driverEmail) {
        const tbody = document.querySelector("#bookingsBody");
        tbody.addEventListener("click", (e) => {
            const a = e.target.closest(".accept"); const r = e.target.closest(".reject");
            if (!a && !r) return; e.preventDefault();
            const id = Number((a || r).dataset.id);
            let bookings = getBookings(); const idx = bookings.findIndex(b => b.id === id); if (idx === -1) return;
            if (a) bookings[idx].status = "Aceptado";
            if (r) bookings = bookings.filter(b => b.id !== id);
            saveBookings(bookings);
            renderRows(myPendingBookings(driverEmail));
        });
    }

    function init() {
        const current = getCurrentUser();
        if (!current || current.type !== "driver") return;
        const mine = myPendingBookings(current.data.email);
        renderRows(mine);
        attachActions(current.data.email);
    }

    // 🔑 Ejecuta ahora si el DOM ya está listo (porque el router carga este script tarde)
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
