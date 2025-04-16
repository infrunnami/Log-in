const token = new URLSearchParams(window.location.search).get("token");

console.log("Token recibido:", token);

if (!token) {
    console.log("Token no encontrado.");
    alert("El enlace de recuperación no es válido.");
} else {
    document.getElementById("token").value = token; // Rellenar el campo hidden con el token
}

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

    try {
        const response = await fetch("/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password: newPassword }),
        });

        let responseData;
        try {
            responseData = await response.json(); // Intenta parsear JSON
        } catch (error) {
            console.error("El servidor no devolvió JSON válido:", error);
            throw new Error("Respuesta inválida del servidor");
        }

        if (response.ok) {
            alert("Password reset successfully!");
            window.location.href = "/";
        } else {
            alert(responseData.message || "Error al resetear la contraseña");
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("Ocurrió un error. Por favor, inténtalo de nuevo.");
    }
});
