// Scripts/bookings/router.js
(function () {
    function getCurrentUser() {
        try { return JSON.parse(sessionStorage.getItem("currentUser")); }
        catch { return null; }
    }

    function loadScript(src) {
        const s = document.createElement("script");
        s.src = src;
        s.defer = true;
        document.body.appendChild(s);
    }

    document.addEventListener("DOMContentLoaded", () => {
        const current = getCurrentUser();
        if (!current) {
            alert("Debes iniciar sesión.");
            window.location.href = "index.html";
            return;
        }

        if (current.type === "driver") {
            loadScript("./Scripts/bookings/drivers.js");
        } else if (current.type === "user") {
            loadScript("./Scripts/bookings/users.js"); 
        }
        else {
            alert("Tipo de usuario no reconocido.");
            window.location.href = "index.html";
        }
    });
})();

