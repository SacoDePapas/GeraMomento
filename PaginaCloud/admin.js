document.addEventListener('DOMContentLoaded', () => {
    // --- Funciones de Utilidad ---
    function getFormattedDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    function generateRandomTagId() {
        return Math.floor(10000 + Math.random() * 90000).toString();
    }

    function showFeedback(element, message, type) {
        element.textContent = message;
        element.className = `feedback-message ${type}`;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
            element.textContent = '';
            element.className = 'feedback-message';
        }, 3000); // Ocultar después de 3 segundos
    }

    // --- Simulación de Base de Datos (en memoria del navegador) ---
    // Usaremos localStorage para persistir los datos entre sesiones del navegador
    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [
        { tagId: "RTG12345", nombre: "Juan Pérez", edad: 30, tipo: "personal", fechaRegistro: "01/01/2024 10:00:00" },
        { tagId: "RTG67890", nombre: "María García", edad: 22, tipo: "estudiante", fechaRegistro: "05/01/2024 14:30:00" }
    ];

    // --- Historial de Escaneos (datos de ejemplo) ---
    const historyTableBody = document.querySelector('#historyTable tbody');
    const historyData = [
        { tag: "41349", nombre: "Pene", fecha: "hoy", hora: "jaja", estado: "permitida" },
        { tag: "83238", nombre: "Pucha", fecha: "ayer", hora: "ash", estado: "denegada" },
        { tag: "12345", nombre: "Ana López", fecha: "01/06/2025", hora: "08:15:00", estado: "permitida" },
        { tag: "67890", nombre: "Luis Soto", fecha: "01/06/2025", hora: "09:00:00", estado: "denegada" },
    ];

    function populateHistoryTable() {
        historyTableBody.innerHTML = ''; // Limpiar antes de rellenar
        historyData.forEach(item => {
            const row = historyTableBody.insertRow();
            row.insertCell().textContent = item.tag;
            row.insertCell().textContent = item.nombre;
            row.insertCell().textContent = item.fecha;
            row.insertCell().textContent = item.hora;
            row.insertCell().textContent = item.estado;
        });
    }
    populateHistoryTable(); // Rellenar al cargar

    // --- Estados de Puerta (datos de ejemplo) ---
    const doorStatusTableBody = document.querySelector('#doorStatusTable tbody');
    const doorStatusData = [
        { puerta: "Mod 1", estado: "cerrada" },
        { puerta: "Mod 2", estado: "cerrada" },
        { puerta: "Mod 3", estado: "abierta" },
    ];

    function populateDoorStatusTable() {
        doorStatusTableBody.innerHTML = '';
        doorStatusData.forEach(item => {
            const row = doorStatusTableBody.insertRow();
            row.insertCell().textContent = item.puerta;
            row.insertCell().textContent = item.estado;
        });
    }
    populateDoorStatusTable(); // Rellenar al cargar

    // --- Funcionalidad de Exportar ---
    document.getElementById('exportButton').addEventListener('click', () => {
        alert('Función de Exportar simulada: Se descargarían los datos del historial.');
        // En un escenario real, aquí se generaría un archivo CSV/Excel
        // o se haría una llamada a un backend para obtener los datos.
    });

    // --- Funcionalidad de Cerrar Sesión ---
    document.getElementById('logoutButton').addEventListener('click', () => {
        window.location.href = 'login.html';
    });

    // --- Funcionalidad de Registro ---
    const registerForm = document.getElementById('registerForm');
    const regTagIdInput = document.getElementById('regTagId');
    const regNombreCompletoInput = document.getElementById('regNombreCompleto');
    const regEdadInput = document.getElementById('regEdad');
    const regTipoUsuarioSelect = document.getElementById('regTipoUsuario');
    const regFechaRegistroInput = document.getElementById('regFechaRegistro');
    const registerFeedback = document.getElementById('registerFeedback');

    // Set current date for registration form
    regFechaRegistroInput.value = getFormattedDateTime();

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const newTagId = regTagIdInput.value.trim();
        const newNombre = regNombreCompletoInput.value.trim();
        const newEdad = parseInt(regEdadInput.value);
        const newTipo = regTipoUsuarioSelect.value;
        const newFecha = regFechaRegistroInput.value;

        if (!newTagId || !newNombre || isNaN(newEdad) || newEdad <= 0 || !newTipo) {
            showFeedback(registerFeedback, 'Por favor, rellena todos los campos correctamente.', 'error');
            return;
        }

        // Check for duplicate Tag ID
        if (registeredUsers.some(user => user.tagId === newTagId)) {
            showFeedback(registerFeedback, 'Error: Ya existe un usuario con este Tag ID.', 'error');
            return;
        }

        const newUser = {
            tagId: newTagId,
            nombre: newNombre,
            edad: newEdad,
            tipo: newTipo,
            fechaRegistro: newFecha
        };

        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers)); // Guardar en localStorage

        showFeedback(registerFeedback, `Usuario "${newNombre}" registrado con éxito.`, 'success');
        registerForm.reset(); // Limpiar formulario
        regFechaRegistroInput.value = getFormattedDateTime(); // Reset fecha
        populateDeregisterSelect(); // Actualizar lista de dar de baja
    });

    // --- Funcionalidad de Búsqueda y Dar de Baja ---
    const deregisterForm = document.getElementById('deregisterForm');
    const deregSearchInput = document.getElementById('deregSearch');
    const deregSelectUser = document.getElementById('deregSelectUser');
    const deregisterFeedback = document.getElementById('deregisterFeedback');

    function populateDeregisterSelect(searchTerm = '') {
        deregSelectUser.innerHTML = '<option value="">Seleccionar</option>';
        const filteredUsers = registeredUsers.filter(user =>
            user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.tagId.toLowerCase().includes(searchTerm.toLowerCase())
        );
        filteredUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.tagId;
            option.textContent = `${user.nombre} (ID: ${user.tagId})`;
            deregSelectUser.appendChild(option);
        });
    }
    populateDeregisterSelect(); // Rellenar al cargar

    deregSearchInput.addEventListener('input', () => {
        populateDeregisterSelect(deregSearchInput.value);
    });

    deregisterForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const tagIdToRemove = deregSelectUser.value;

        if (!tagIdToRemove) {
            showFeedback(deregisterFeedback, 'Por favor, selecciona un usuario para dar de baja.', 'error');
            return;
        }

        const initialLength = registeredUsers.length;
        registeredUsers = registeredUsers.filter(user => user.tagId !== tagIdToRemove);

        if (registeredUsers.length < initialLength) {
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers)); // Guardar en localStorage
            showFeedback(deregisterFeedback, `Usuario con Tag ID "${tagIdToRemove}" dado de baja.`, 'success');
            populateDeregisterSelect(); // Actualizar lista
            deregisterForm.reset();
        } else {
            showFeedback(deregisterFeedback, 'Error: Usuario no encontrado.', 'error');
        }
    });
});