// script.js

// JavaScript para el efecto de difuminado (fade-in) de la imagen
document.addEventListener('DOMContentLoaded', () => {
    const backgroundImage = document.getElementById('backgroundImage');
    backgroundImage.style.opacity = 1;

    // JavaScript para la autenticación
    const loginForm = document.getElementById('loginForm');
    const errorMessageDiv = document.getElementById('error-message');



    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Evita que el formulario se envíe de forma tradicional
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Restablecer mensaje de error
        errorMessageDiv.style.display = 'none';
        errorMessageDiv.textContent = '';
        

        // Verificar que se haya seleccionado un nivel y que sea uno de los niveles permitidos
        // Usamos un array y .includes() para una verificación más robusta

        // Verificar si el nivel de usuario existe en nuestras credenciales
        if (!!username && !!password) {
            const data = {
                username: username,
                password: password
            };
            fetch("http://172.20.10.14:8000/login",{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(response => response.json())
            .then(data => {
                alert(data.success);
                window.location.href = data.redirect_url; 
            });
        } else {
            // Este bloque teóricamente no debería alcanzarse si el chequeo de allowedLevels.includes(userLevel) funciona
            errorMessageDiv.textContent = 'Nivel de usuario no reconocido.';
            errorMessageDiv.style.display = 'block';
        }
    });
});