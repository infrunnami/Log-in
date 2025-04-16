// Obtener el token desde la URL (usando pathname, no query string)
const pathParts = window.location.pathname.split('/');
const token = pathParts[pathParts.length - 1];  // Último segmento de la URL

// Si no existe el token, redirigir al usuario
if (!token) {
    alert("Invalid or missing token.");
    window.location.href = "/";  // Redirige a la página de inicio o login
}

// Rellenar el campo hidden con el token
document.getElementById('token').value = token;

const submitBtn = document.getElementById("submitBtn");
const passwordField = document.getElementById("password");
const form = document.getElementById("form");

submitBtn.addEventListener("click", async function (event) {
    event.preventDefault();

    const newPassword = passwordField.value.trim();

    if (!newPassword) {
        alert("Please enter a new password.");
        return;
    }

    console.log("Token:", token);
    console.log("New password:", newPassword);

    // Realizar la petición de actualización de contraseña
    const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: token,
            password: newPassword,
        }),
    });

    const responseData = await response.json();

    if (response.ok) {
        alert("Password reset successfully!");
        window.location.href = "/"; // Redirigir al login o inicio
    } else {
        alert(responseData.message || "An error occurred while resetting the password.");
    }
});
