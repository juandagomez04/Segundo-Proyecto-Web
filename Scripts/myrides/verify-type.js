// Función para obtener el usuario actual
function getCurrentUser() {
    try {
        return JSON.parse(sessionStorage.getItem("currentUser"));
    } catch (e) {
        return null;
    }
}

// Función para proteger páginas solo de conductores
function protectDriverPage() {
    const current = getCurrentUser();

    if (!current || current.type !== "driver") {
        alert("Acceso denegado 🚫 Solo los conductores pueden entrar en Rides.");
        window.location.href = "home_searchrides.html"; // lo mandamos al home
    }
}

// Al cargar la página myrides.html ejecutamos la verificación
document.addEventListener("DOMContentLoaded", () => {
    protectDriverPage();
});

