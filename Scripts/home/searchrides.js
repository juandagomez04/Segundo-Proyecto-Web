// Scripts/home/rides-table.js
(function () {
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

        const froms = uniqSorted(rides.map(r => (r.departure || "").trim()));
        const tos = uniqSorted(rides.map(r => (r.arrival || "").trim()));

        // Mantén "All" como primera opción
        const curFrom = fromSel.value;
        const curTo = toSel.value;

        fromSel.innerHTML = `<option value="">All</option>` + froms.map(v => `<option value="${v}">${v}</option>`).join("");
        toSel.innerHTML = `<option value="">All</option>` + tos.map(v => `<option value="${v}">${v}</option>`).join("");

        // Intenta preservar lo seleccionado si existía
        if ([...fromSel.options].some(o => o.value === curFrom)) fromSel.value = curFrom;
        if ([...toSel.options].some(o => o.value === curTo)) toSel.value = curTo;
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
            <td><img src="Images/avatar.png" alt="avatar" class="avatar"> ${driverLabel(r.driverEmail)}</td>
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
            const link = e.target.closest(".from-link");
            if (!link) return;
            e.preventDefault();

            const fromName = link.dataset.from || link.textContent.trim();
            const toName = link.dataset.to || link.closest("tr")?.children[2]?.textContent?.trim();
            if (!fromName || !toName) return;

            // Avisamos al mapa
            const ev = new CustomEvent("draw-line", { detail: { fromName, toName } });
            document.dispatchEvent(ev);
        });
    }

    function rerender() {
        const all = getRides();
        populateFiltersFromRides(all); // ← llena los selects con valores reales
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
