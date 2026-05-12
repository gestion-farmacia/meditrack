document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que la página se recargue

    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const message = document.getElementById('message');

    // Aquí definimos el acceso (puedes cambiarlos a tu gusto)
    const USUARIO_VALIDO = "admin";
    const CLAVE_VALIDA = "12345";

    if (user === USUARIO_VALIDO && pass === CLAVE_VALIDA) {
        // Si es correcto, nos manda a la página de registro
        window.location.href = "registro.html";
    } else {
        // Si es incorrecto, muestra error
        message.textContent = "Usuario o contraseña incorrectos.";
    }
});