// Scripts/home/settings.js
(() => {
    const $ = (s) => document.querySelector(s);

    const getCurrentUser = () => { try { return JSON.parse(sessionStorage.getItem("currentUser")); } catch { return null; } };
    const setCurrentUser = (obj) => sessionStorage.setItem("currentUser", JSON.stringify(obj));
    const getUsers = () => { try { return JSON.parse(localStorage.getItem("users")) || []; } catch { return []; } };
    const getDrivers = () => { try { return JSON.parse(localStorage.getItem("drivers")) || []; } catch { return []; } };
    const saveUsers = (arr) => localStorage.setItem("users", JSON.stringify(arr));
    const saveDrivers = (arr) => localStorage.setItem("drivers", JSON.stringify(arr));

    // Rellenar valores actuales
    function hydrate() {
        const cur = getCurrentUser();
        const d = cur.data || {};
        if ($("#fname")) $("#fname").value = d.fname || "";
        if ($("#bio")) $("#bio").value = typeof d.bio === "string" ? d.bio : "";
    }

    function onSubmit(e) {
        e.preventDefault();
        const cur = getCurrentUser();

        const newName = ($("#fname")?.value || "").trim();
        const newBio = ($("#bio")?.value || "").trim();

        if (!newName) { alert("El nombre público no puede ir vacío."); return; }

        if (cur.type === "user") {
            const list = getUsers();
            const i = list.findIndex(u => (u.email || "").toLowerCase() === (cur.data.email || "").toLowerCase());
            list[i] = { ...list[i], fname: newName, bio: newBio };
            saveUsers(list);
            setCurrentUser({ type: "user", data: list[i] });
        } else if (cur.type === "driver") {
            const list = getDrivers();
            const i = list.findIndex(d => (d.email || "").toLowerCase() === (cur.data.email || "").toLowerCase());
            list[i] = { ...list[i], fname: newName, bio: newBio };
            saveDrivers(list);
            setCurrentUser({ type: "driver", data: list[i] });
        } else {
            alert("Tipo de usuario desconocido.");
            return;
        }

        window.history.back();
    }

    document.addEventListener("DOMContentLoaded", () => {
        hydrate();
        const form = document.querySelector("form.form");
        if (form) form.addEventListener("submit", onSubmit);
    });
})();
