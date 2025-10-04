// js/login.js

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Hardcoded credentials for simulation
    const USERNAME_VALID = 'admin';
    const PASSWORD_VALID = '1234';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('message');

    if (username === USERNAME_VALID && password === PASSWORD_VALID) {
        // Usa sessionStorage para mantener la sesión
        sessionStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'app.html';
    } else {
        messageElement.textContent = 'Credenciales incorrectas.';
        messageElement.style.display = 'block';
    }
});