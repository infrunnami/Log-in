document.getElementById('backToLoginBtn').addEventListener('click', function() {
    window.location.href = '/';
});

document.getElementById('logoutBtn').addEventListener('click', async function () {
    try {
        // Hacer una solicitud para cerrar sesión
        const response = await fetch("http://localhost:4000/api/logout", {
            method: 'POST',
            credentials: 'same-origin', // Asegura que las cookies de sesión se envíen con la solicitud
        });

        const data = await response.json();

        if (data.status === "Success") {
            // Si la sesión se cierra correctamente, redirige al login
            window.location.href = '/';
        } else {
            alert("Error al cerrar sesión");
        }
    } catch (error) {
        console.error('Error cerrando sesión:', error);
        alert("Error al cerrar sesión");
    }
});