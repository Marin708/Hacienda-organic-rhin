document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('message');

    // Función para verificar si el usuario ya está logueado
    function checkLoginStatus() {
        if (localStorage.getItem('userToken')) {
            // Si hay token, redirigir al dashboard
            window.location.href = 'app.html';
        }
    }

    // Ejecutar la verificación al cargar la página de login
    checkLoginStatus();

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = usernameInput.value;
            const password = passwordInput.value;

            // --- Lógica de Validación (Credenciales de prueba) ---
            // Credenciales: admin / 1234
            if (username === 'admin' && password === '1234') {
                // Autenticación exitosa
                errorMessage.style.display = 'none';

                // Guardar un token de sesión (CRÍTICO para app.js)
                localStorage.setItem('userToken', 'auth_success_token_12345');

                // Redirigir al dashboard
                window.location.href = 'app.html';

            } else {
                // Autenticación fallida
                errorMessage.textContent = 'Usuario o contraseña incorrectos.';
                errorMessage.style.display = 'block';
                // Limpiar el campo de contraseña por seguridad
                passwordInput.value = ''; 
            }
        });
    }
});