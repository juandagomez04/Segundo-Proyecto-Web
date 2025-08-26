// Scripts/home/rides-table.js
(function () {
    function getCurrentUser() {
        try { return JSON.parse(sessionStorage.getItem("currentUser")); }
        catch { return null; }
    }

    function getBookings() {
        try { return JSON.parse(localStorage.getItem("bookings")) || []; }
        catch { return []; }
    }

    function saveBookings(bookings) {
        localStorage.setItem("bookings", JSON.stringify(bookings));
    }

    function getNextBookingId() {
        let counter = parseInt(localStorage.getItem("bookingIdCounter") || "0", 10);
        counter++;
        localStorage.setItem("bookingIdCounter", counter);
        return counter;
    }

    function createBooking(rideId) {
        const current = getCurrentUser();
        if (!current || !current.data?.email) {
            alert("Debes iniciar sesión para solicitar un ride.");
            return;
        }

        let bookings = getBookings();

        // Evitar duplicados: mismo usuario pidiendo mismo ride
        if (bookings.some(b => b.userEmail === current.data.email && b.rideId === rideId)) {
            alert("Ya solicitaste este ride.");
            return;
        }

        const booking = {
            id: getNextBookingId(),
            rideId,
            userEmail: current.data.email,
            status: "Waiting"
        };

        bookings.push(booking);
        saveBookings(bookings);

        alert("Solicitud enviada ✅");
    }


    const $ = (sel) => document.querySelector(sel);

    function getRides() {
        try { return JSON.parse(localStorage.getItem("rides")) || []; }
        catch { return []; }
    }

    function uniqSorted(arr) {
        return [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b));
    }

    function populateFiltersFromRides(rides) {
        const fromSel = $("#from");
        const toSel = $("#to");
        if (!fromSel || !toSel) return;

        // 1) Orígenes únicos
        const origins = [...new Set(rides.map(r => (r.departure || "").trim()).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b));

        // 2) Mapa origen -> Set(destinos)
        const destByOrigin = rides.reduce((acc, r) => {
            const from = (r.departure || "").trim();
            const to = (r.arrival || "").trim();
            if (!from || !to) return acc;
            if (!acc[from]) acc[from] = new Set();
            acc[from].add(to);
            return acc;
        }, {});

        // Guardar selecciones actuales (intenta preservarlas si siguen existiendo)
        const prevFrom = fromSel.value;
        const prevTo = toSel.value;

        // 3) Poblar FROM (con "All" al inicio)
        fromSel.innerHTML = `<option value="">All</option>` +
            origins.map(v => `<option value="${v}">${v}</option>`).join("");

        // Si el from previamente seleccionado aún existe, conservarlo
        if ([...fromSel.options].some(o => o.value === prevFrom)) {
            fromSel.value = prevFrom;
        }

        // 4) Calcular los destinos posibles según el FROM actual
        const selectedFrom = fromSel.value;
        let possibleTos;
        if (selectedFrom) {
            // Solo destinos que existan para ese origen
            possibleTos = destByOrigin[selectedFrom]
                ? [...destByOrigin[selectedFrom]].sort((a, b) => a.localeCompare(b))
                : [];
        } else {
            // Si FROM = All, mostrar todos los destinos que existan
            possibleTos = [...new Set(rides.map(r => (r.arrival || "").trim()).filter(Boolean))]
                .sort((a, b) => a.localeCompare(b));
        }

        // 5) Poblar TO (con "All" al inicio)
        toSel.innerHTML = `<option value="">All</option>` +
            possibleTos.map(v => `<option value="${v}">${v}</option>`).join("");

        // Si el TO anterior aún es válido dentro de los posibles, conservarlo
        if ([...toSel.options].some(o => o.value === prevTo)) {
            toSel.value = prevTo;
        } else {
            // Si no, por defecto All (""), así verás todos los destinos de ese FROM
            toSel.value = "";
        }
    }


    function getSelectedDays() {
        return Array.from(document.querySelectorAll(".filter-days input[name='days']:checked"))
            .map(cb => (cb.nextSibling?.textContent || cb.value || "").trim())
            .map(t => t.replace(/[^A-Za-z]/g, "")); // "Mon", "Tue", ...
    }

    function carString(r) {
        return [r.make, r.model, r.year].filter(Boolean).join(" ");
    }

    function driverLabel(email) {
        if (!email) return "unknown";
        return (email.split("@")[0] || email);
    }

    function render(rows) {
        const tbody = $("#ridesBody");
        if (!tbody) return;

        if (!rows.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;opacity:.7">No rides found.</td></tr>`;
            return;
        }

        tbody.innerHTML = rows.map(r => `
            <tr data-id="${r.id}">
                <td>
                    <a href="detailsride.html?id=${r.id}" class="driver-link">${driverLabel(r.driverEmail)}</a>
                </td>
                <td><a href="#" class="from-link" data-from="${r.departure}" data-to="${r.arrival}">${r.departure || ""}</a></td>
                <td>${r.arrival || ""}</td>
                <td>${r.seats ?? ""}</td>
                <td>${carString(r)}</td>
                <td>$${r.fee ?? 0}</td>
                <td><a href="#" class="request-link">Request</a></td>
            </tr>
        `).join("");
    }



    function filterRides(all) {
        const fromSel = $("#from");
        const toSel = $("#to");
        const daysSel = getSelectedDays();

        const wantFrom = (fromSel?.value || "").trim().toLowerCase(); // "" = All
        const wantTo = (toSel?.value || "").trim().toLowerCase(); // "" = All

        return all.filter(r => {
            const fromOK = !wantFrom || (r.departure || "").trim().toLowerCase() === wantFrom;
            const toOK = !wantTo || (r.arrival || "").trim().toLowerCase() === wantTo;

            if (daysSel.length) {
                const rideDays = Array.isArray(r.days) ? r.days : [];
                const hasCommon = rideDays.some(d => daysSel.includes(d));
                return fromOK && toOK && hasCommon;
            }
            return fromOK && toOK;
        });
    }

    function updateHeaderPreview() {
        const results = document.querySelector(".results p");
        const fromSel = $("#from");
        const toSel = $("#to");
        if (results && fromSel && toSel) {
            const f = fromSel.value || "Anywhere";
            const t = toSel.value || "Anywhere";
            results.innerHTML = `Rides found from <strong><em>${f}</em></strong> to <strong><em>${t}</em></strong>`;
        }
    }

    function attachRowClick() {
        const tbody = $("#ridesBody");
        if (!tbody) return;

        tbody.addEventListener("click", (e) => {
            // --- Click en FROM para trazar en mapa ---
            const fromLink = e.target.closest(".from-link");
            if (fromLink) {
                e.preventDefault();
                const fromName = fromLink.dataset.from || fromLink.textContent.trim();
                const toName = fromLink.dataset.to || fromLink.closest("tr")?.children[2]?.textContent?.trim();
                if (fromName && toName) {
                    const ev = new CustomEvent("draw-line", { detail: { fromName, toName } });
                    document.dispatchEvent(ev);
                }
                return;
            }

            // --- Click en REQUEST para crear booking ---
            const reqLink = e.target.closest(".request-link");
            if (reqLink) {
                e.preventDefault();
                const row = reqLink.closest("tr");
                const rideId = Number(row?.dataset?.id);
                if (rideId) {
                    createBooking(rideId);
                }
                return;
            }
        });
    }


    function rerender() {
        const all = getRides();
        populateFiltersFromRides(all);
        const rows = filterRides(all);
        render(rows);
        updateHeaderPreview();
    }

    document.addEventListener("DOMContentLoaded", () => {
        const form = document.querySelector(".filter-form");
        rerender();
        attachRowClick();

        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                rerender();
            });
        }

        // Re-render al cambiar selects y checkboxes
        const fromSel = $("#from"), toSel = $("#to");
        if (fromSel) fromSel.addEventListener("change", rerender);
        if (toSel) toSel.addEventListener("change", rerender);
        document.querySelectorAll(".filter-days input[name='days']")
            .forEach(cb => cb.addEventListener("change", rerender));
    });
})();
