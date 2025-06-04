// script.js

// JavaScript para el efecto de difuminado (fade-in) de la imagen
document.addEventListener('DOMContentLoaded', () => {
    const backgroundImage = document.getElementById('backgroundImage');
    backgroundImage.style.opacity = 1;

    // JavaScript para la autenticación
    const loginForm = document.getElementById('loginForm');
    const errorMessageDiv = document.getElementById('error-message');

    // Definimos las credenciales directamente en JavaScript (INSEGURO PARA PRODUCCIÓN)
    const credentials = {
        "guardia": {
            "username": "guardia",
            "password": "seguridad123",
            "redirect": "dashboard_guardia.html"
        },
        "administrador": { // Asegúrate de que el key 'administrador' coincida exactamente con el value del <option> en login.html
            "username": "admin",
            "password": "admin123",
            "redirect": "dashboard_admin.html"
        }
    };

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Evita que el formulario se envíe de forma tradicional

        const userLevel = document.getElementById('user_level').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Restablecer mensaje de error
        errorMessageDiv.style.display = 'none';
        errorMessageDiv.textContent = '';

        // Verificar que se haya seleccionado un nivel y que sea uno de los niveles permitidos
        // Usamos un array y .includes() para una verificación más robusta
        const allowedLevels = ['guardia', 'administrador']; // Lista de niveles válidos
        if (!userLevel || !allowedLevels.includes(userLevel)) {
            errorMessageDiv.textContent = 'Por favor, selecciona un nivel de usuario válido (Guardia o Administrador).';
            errorMessageDiv.style.display = 'block';
            return;
        }

        // Verificar si el nivel de usuario existe en nuestras credenciales
        if (credentials[userLevel]) {
            const expectedUser = credentials[userLevel].username;
            const expectedPass = credentials[userLevel].password;
            const redirectPage = credentials[userLevel].redirect;

            // Comparar las credenciales ingresadas
            if (username === expectedUser && password === expectedPass) {
                // Credenciales correctas, redirigir
                window.location.href = redirectPage;
            } else {
                // Credenciales incorrectas
                errorMessageDiv.textContent = 'Usuario o contraseña incorrectos.';
                errorMessageDiv.style.display = 'block';
            }
        } else {
            // Este bloque teóricamente no debería alcanzarse si el chequeo de allowedLevels.includes(userLevel) funciona
            errorMessageDiv.textContent = 'Nivel de usuario no reconocido.';
            errorMessageDiv.style.display = 'block';
        }
    });
});