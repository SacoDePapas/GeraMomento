document.addEventListener('DOMContentLoaded', async () => {
    // API base URL
    const API_BASE_URL = 'http://172.20.10.14:8000';
    
    // --- Utility Functions ---
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

    function showFeedback(element, message, type) {
        element.textContent = message;
        element.className = `feedback-message ${type}`;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
            element.textContent = '';
            element.className = 'feedback-message';
        }, 3000);
    }

    // --- API Fetch Functions ---
    async function fetchRegisteredUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios`);
            if (!response.ok) throw new Error('Failed to fetch users');
            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            showFeedback(document.getElementById('registerFeedback'), 'Error loading users', 'error');
            return [];
        }
    }

    async function fetchHistoryData() {
        try {
            const response = await fetch(`${API_BASE_URL}/detecciones`);
            if (!response.ok) throw new Error('Failed to fetch history');
            return await response.json();
        } catch (error) {
            console.error('Error fetching history:', error);
            return [];
        }
    }

    async function fetchDoorStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/modulos`);
            if (!response.ok) throw new Error('Failed to fetch door status');
            return await response.json();
        } catch (error) {
            console.error('Error fetching door status:', error);
            return [];
        }
    }

    // --- Initialize Data ---
    let registeredUsers = await fetchRegisteredUsers();
    const historyData = await fetchHistoryData();
    const doorStatusData = await fetchDoorStatus();

    // --- Populate Tables ---
    const historyTableBody = document.querySelector('#historyTable tbody');
    const doorStatusTableBody = document.querySelector('#doorStatusTable tbody');

    function populateHistoryTable() {
        historyTableBody.innerHTML = '';
        historyData.forEach(item => {
            const row = historyTableBody.insertRow();
            row.insertCell().textContent = item.TagId;
            row.insertCell().textContent = item.Nombre;
            row.insertCell().textContent = item.FechaDeteccion;
            row.insertCell().textContent = item.HoraDeteccion;
            row.insertCell().textContent = item.status;
        });
    }

    function populateDoorStatusTable() {
        doorStatusTableBody.innerHTML = '';
        doorStatusData.forEach(item => {
            const row = doorStatusTableBody.insertRow();
            row.insertCell().textContent = item.Id;
            row.insertCell().textContent = item.Nombre;
            row.insertCell().textContent = item.status;
        });
    }

    populateHistoryTable();
    populateDoorStatusTable();

    // --- Export Functionality ---
    document.getElementById('exportButton').addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'historial_accesos.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                throw new Error('Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Error al exportar los datos');
        }
    });

    // --- Logout Functionality ---
    document.getElementById('logout-button').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // --- Registration Functionality ---
    const registerForm = document.getElementById('registerForm');
    const regTagIdInput = document.getElementById('regTagId');
    const regUserInput = document.getElementById('regUsername');
    const regPasswordInput = document.getElementById('regPassword');
    const regNombreCompletoInput = document.getElementById('regNombreCompleto');
    const regEdadInput = document.getElementById('regEdad');
    const regTipoUsuarioSelect = document.getElementById('regTipoUsuario');
    const registerFeedback = document.getElementById('registerFeedback');


    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const newUser = {
            tagId: regTagIdInput.value.trim(),
            nombre: regNombreCompletoInput.value.trim(),
            edad: parseInt(regEdadInput.value),
            tipo: regTipoUsuarioSelect.value,
            username: regUserInput.value.trim(),
            password: regPasswordInput.value.trim()
        };

        if (!newUser.tagId || !newUser.nombre || isNaN(newUser.edad) || newUser.edad <= 0 || !newUser.tipo || !newUser.username || !newUser.password) {
            showFeedback(registerFeedback, 'Por favor, rellena todos los campos correctamente.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

            if (response.ok) {
                const result = await response.json();
                registeredUsers = await fetchRegisteredUsers(); // Refresh user list
                showFeedback(registerFeedback, `Usuario "${newUser.nombre}" registrado con éxito.`, 'success');
                registerForm.reset();
                populateDeregisterSelect();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showFeedback(registerFeedback, error.message || 'Error al registrar usuario', 'error');
        }
    });

    // --- Deregistration Functionality ---
    const deregisterForm = document.getElementById('deregisterForm');
    const deregSearchInput = document.getElementById('deregSearch');
    const deregSelectUser = document.getElementById('deregSelectUser');
    const deregisterFeedback = document.getElementById('deregisterFeedback');

    async function populateDeregisterSelect(searchTerm = '') {
        deregSelectUser.innerHTML = '<option value="">Seleccionar</option>';
        
        const usersToShow = searchTerm 
            ? registeredUsers.filter(user =>
                user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.tagId.toLowerCase().includes(searchTerm.toLowerCase()))
            : registeredUsers;

        usersToShow.forEach(user => {
            const option = document.createElement('option');
            option.value = user.tagId;
            option.textContent = `${user.nombre} (ID: ${user.tagId})`;
            deregSelectUser.appendChild(option);
        });
    }

    populateDeregisterSelect();

    deregSearchInput.addEventListener('input', () => {
        populateDeregisterSelect(deregSearchInput.value);
    });

    deregisterForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const tagIdToRemove = deregSelectUser.value;

        if (!tagIdToRemove) {
            showFeedback(deregisterFeedback, 'Por favor, selecciona un usuario para dar de baja.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${tagIdToRemove}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                registeredUsers = await fetchRegisteredUsers(); // Refresh user list
                showFeedback(deregisterFeedback, `Usuario con Tag ID "${tagIdToRemove}" dado de baja.`, 'success');
                populateDeregisterSelect();
                deregisterForm.reset();
            } else {
                throw new Error('Failed to delete user');
            }
        } catch (error) {
            console.error('Deregistration error:', error);
            showFeedback(deregisterFeedback, 'Error al dar de baja al usuario', 'error');
        }
    });

    // --- Periodic Data Refresh ---
    setInterval(async () => {
        registeredUsers = await fetchRegisteredUsers();
        populateDeregisterSelect(deregSearchInput.value);
        
        const newHistoryData = await fetchHistoryData();
        if (JSON.stringify(newHistoryData) !== JSON.stringify(historyData)) {
            historyData = newHistoryData;
            populateHistoryTable();
        }
        
        const newDoorStatusData = await fetchDoorStatus();
        if (JSON.stringify(newDoorStatusData) !== JSON.stringify(doorStatusData)) {
            doorStatusData = newDoorStatusData;
            populateDoorStatusTable();
        }
    }, 30000); // Refresh every 30 seconds
});