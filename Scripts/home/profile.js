// Scripts/home/profile.js
(() => {
    const $ = (s) => document.querySelector(s);

    // Storage helpers
    const getCurrentUser = () => { try { return JSON.parse(sessionStorage.getItem("currentUser")); } catch { return null; } };
    const setCurrentUser = (obj) => sessionStorage.setItem("currentUser", JSON.stringify(obj));
    const getUsers = () => { try { return JSON.parse(localStorage.getItem("users")) || []; } catch { return []; } };
    const getDrivers = () => { try { return JSON.parse(localStorage.getItem("drivers")) || []; } catch { return []; } };
    const saveUsers = (arr) => localStorage.setItem("users", JSON.stringify(arr));
    const saveDrivers = (arr) => localStorage.setItem("drivers", JSON.stringify(arr));

    // Helpers adicionales para propagar cambios de email
    function updateRidesDriverEmail(oldEmail, newEmail) {
        const rides = JSON.parse(localStorage.getItem("rides") || "[]");
        let changed = false;
        const oldN = (oldEmail || "").toLowerCase();
        for (const r of rides) {
            if ((r?.driverEmail || "").toLowerCase() === oldN) {
                r.driverEmail = newEmail;
                changed = true;
            }
        }
        if (changed) localStorage.setItem("rides", JSON.stringify(rides));
    }
    function updateBookingsUserEmail(oldEmail, newEmail) {
        const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
        let changed = false;
        const oldN = (oldEmail || "").toLowerCase();
        for (const b of bookings) {
            if ((b?.userEmail || "").toLowerCase() === oldN) {
                b.userEmail = newEmail;
                changed = true;
            }
        }
        if (changed) localStorage.setItem("bookings", JSON.stringify(bookings));
    }

    // Cargar datos actuales al form
    function hydrateForm() {
        const cur = getCurrentUser();
        if (!cur) { alert("Inicia sesión."); location.href = "index.html"; return; }
        const d = cur.data || {};

        if ($("#fname")) $("#fname").value = d.fname || "";
        if ($("#lname")) $("#lname").value = d.lname || "";
        if ($("#email")) $("#email").value = d.email || "";
        if ($("#address")) $("#address").value = d.address || "";
        if ($("#country")) $("#country").value = d.country || "";
        if ($("#state")) $("#state").value = d.state || "";
        if ($("#city")) $("#city").value = d.city || "";
        if ($("#phone")) $("#phone").value = d.phone || "";

        // 🔥 Ahora también rellenamos password y repeat
        if ($("#password")) $("#password").value = d.password || "";
        if ($("#repeat")) $("#repeat").value = d.password || "";
    }


    // Comprobar si un email está tomado por otro registro
    function emailTaken(newEmail, originalEmail) {
        const norm = (s) => (s || "").trim().toLowerCase();
        const n = norm(newEmail), o = norm(originalEmail);
        const inUsers = getUsers().some(u => norm(u.email) === n && norm(u.email) !== o);
        const inDrivers = getDrivers().some(d => norm(d.email) === n && norm(d.email) !== o);
        return inUsers || inDrivers;
    }

    function onSubmit(e) {
        e.preventDefault();

        const cur = getCurrentUser();
        if (!cur) { alert("Inicia sesión."); location.href = "index.html"; return; }
        const type = cur.type; // "user" | "driver"
        const originalEmail = cur.data.email;

        const formData = {
            fname: ($("#fname")?.value || "").trim(),
            lname: ($("#lname")?.value || "").trim(),
            email: ($("#email")?.value || "").trim(),
            address: ($("#address")?.value || "").trim(),
            country: $("#country") ? $("#country").value : (cur.data.country || ""),
            state: ($("#state")?.value || "").trim(),
            city: ($("#city")?.value || "").trim(),
            phone: ($("#phone")?.value || "").trim(),
            password: $("#password")?.value || "",
            repeat: $("#repeat")?.value || ""
        };

        if (!formData.fname || !formData.lname || !formData.email) {
            alert("Completa nombre y correo.");
            return;
        }
        if ((formData.password || formData.repeat) && formData.password !== formData.repeat) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        const emailChanged = formData.email.toLowerCase() !== (originalEmail || "").toLowerCase();
        if (emailChanged && emailTaken(formData.email, originalEmail)) {
            alert("Ese correo ya está registrado.");
            return;
        }

        if (type === "user") {
            const list = getUsers();
            const i = list.findIndex(u => (u.email || "").toLowerCase() === (originalEmail || "").toLowerCase());
            if (i < 0) { alert("Usuario no encontrado."); return; }

            const updated = {
                ...list[i],
                fname: formData.fname,
                lname: formData.lname,
                email: formData.email,
                address: formData.address,
                country: formData.country,
                state: formData.state,
                city: formData.city,
                phone: formData.phone,
                bio: typeof list[i].bio === "string" ? list[i].bio : "" 
            };
            if (formData.password) updated.password = formData.password;

            list[i] = updated;
            saveUsers(list);
            setCurrentUser({ type: "user", data: updated });

            // Propagar cambio de email a bookings (si cambió)
            if (emailChanged) updateBookingsUserEmail(originalEmail, formData.email);

        } else if (type === "driver") {
            const list = getDrivers();
            const i = list.findIndex(d => (d.email || "").toLowerCase() === (originalEmail || "").toLowerCase());
            if (i < 0) { alert("Conductor no encontrado."); return; }

            const updated = {
                ...list[i],
                fname: formData.fname,
                lname: formData.lname,
                email: formData.email,
                address: formData.address,
                country: formData.country,
                state: formData.state,
                city: formData.city,
                phone: formData.phone,
                // conservar datos del vehículo y bio existentes
                brand: list[i].brand, model: list[i].model, year: list[i].year, plate: list[i].plate,
                bio: typeof list[i].bio === "string" ? list[i].bio : ""
            };
            if (formData.password) updated.password = formData.password;

            list[i] = updated;
            saveDrivers(list);
            setCurrentUser({ type: "driver", data: updated });

            // Propagar cambio de email a rides (si cambió)
            if (emailChanged) updateRidesDriverEmail(originalEmail, formData.email);

        } else {
            alert("Tipo de usuario desconocido.");
            return;
        }

        alert("Perfil actualizado ✅");
        window.location.href = "home_searchrides.html";
    }

    document.addEventListener("DOMContentLoaded", () => {
        hydrateForm();
        const form = document.querySelector("form.form");
        if (form) form.addEventListener("submit", onSubmit);
    });
})();
