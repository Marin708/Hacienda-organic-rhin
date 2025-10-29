/*
 * ========================================================
 * CONFIGURACIÓN DE TABLAS Y NAVEGACIÓN
 * ========================================================
 */

// Define la configuración para cada tabla: nombre visible, campos, y la clave primaria
const TABLE_CONFIGS = {
    // Índice 2
    departamentos: { 
        title: "Departamentos", 
        fields: ['id', 'nombre', 'descripcion', 'estado'],
        pk: 'id' // Primary Key
    },
    // Índice 3
    cargos: { 
        title: "Cargos", 
        fields: ['id', 'nombre', 'salario_base', 'id_departamento', 'estado'],
        pk: 'id'
    },
    // Índice 4
    empleados: { 
        title: "Empleados", 
        fields: ['id', 'nombre', 'apellido', 'id_cargo', 'salario_actual', 'estado'],
        pk: 'id'
    },
    // Índice 5
    asistencia: { 
        title: "Asistencia", 
        fields: ['id', 'id_empleado', 'fecha', 'hora_entrada', 'hora_salida', 'estado'],
        pk: 'id'
    },
    // Índice 6
    nomina: { 
        title: "Nómina", 
        fields: ['id', 'id_empleado', 'periodo_inicio', 'periodo_fin', 'total_neto', 'estado'],
        pk: 'id'
    },
    // Índice 7
    tipos_producto: { 
        title: "Tipos Producto", 
        fields: ['id', 'nombre', 'categoria', 'unidad_medida', 'estado'],
        pk: 'id'
    },
    // Índice 8
    productos: { 
        title: "Productos", 
        fields: ['id', 'nombre', 'id_tipo_producto', 'precio_unitario', 'stock_actual', 'estado'],
        pk: 'id'
    },
    // Índice 9
    proveedores: { 
        title: "Proveedores", 
        fields: ['id', 'nombre', 'contacto', 'telefono', 'ruc_nit', 'estado'],
        pk: 'id'
    },
    // Índice 10
    recolecta: { 
        title: "Recolecta (Compras)", 
        fields: ['id', 'id_producto', 'id_proveedor', 'cantidad', 'total', 'fecha', 'estado'],
        pk: 'id'
    },
    // Índice 11
    clientes: { 
        title: "Clientes", 
        fields: ['id', 'nombre', 'apellido', 'telefono', 'tipo_cliente', 'estado'],
        pk: 'id'
    },
    // Índice 12
    ventas: { 
        title: "Ventas", 
        fields: ['id', 'id_cliente', 'id_producto', 'cantidad', 'total', 'fecha', 'estado'],
        pk: 'id'
    },
    // Índice 13
    inventario: { 
        title: "Inventario", 
        fields: ['id', 'id_producto', 'tipo_movimiento', 'cantidad', 'fecha', 'responsable'],
        pk: 'id'
    },
    // Índice 14
    actividades: { 
        title: "Log Actividades", 
        fields: ['id', 'descripcion', 'responsable', 'fecha'],
        pk: 'id'
    }
};

// Lista de botones a generar en el sidebar
const NAV_BUTTONS = [
    { targetId: 'interface-2', label: 'Departamentos', tableName: 'departamentos' },
    { targetId: 'interface-3', label: 'Cargos', tableName: 'cargos' },
    { targetId: 'interface-4', label: 'Empleados', tableName: 'empleados' },
    { targetId: 'interface-5', label: 'Asistencia', tableName: 'asistencia' },
    { targetId: 'interface-6', label: 'Nómina', tableName: 'nomina' },
    { targetId: 'interface-7', label: 'Tipos Producto', tableName: 'tipos_producto' },
    { targetId: 'interface-8', label: 'Productos', tableName: 'productos' },
    { targetId: 'interface-9', label: 'Proveedores', tableName: 'proveedores' },
    { targetId: 'interface-10', label: 'Recolecta (Compras)', tableName: 'recolecta' },
    { targetId: 'interface-11', label: 'Clientes', tableName: 'clientes' },
    { targetId: 'interface-12', label: 'Ventas', tableName: 'ventas' },
    { targetId: 'interface-13', label: 'Inventario', tableName: 'inventario' },
    { targetId: 'interface-14', label: 'Actividades', tableName: 'actividades' }
];

/*
 * ========================================================
 * LÓGICA DE SESIÓN Y NAVEGACIÓN
 * ========================================================
 */

function checkSession() {
    // CRÍTICO: Si no hay token, redirigir al login
    if (!localStorage.getItem('userToken')) {
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem('userToken');
    window.location.href = 'index.html';
}

function setupNavigation() {
    const container = document.getElementById('buttonContainer');
    
    // 1. Generar los botones dinámicamente
    NAV_BUTTONS.forEach(btnConfig => {
        const button = document.createElement('button');
        button.textContent = btnConfig.label;
        button.dataset.target = btnConfig.targetId;
        button.dataset.tableName = btnConfig.tableName;

        button.addEventListener('click', () => {
            showInterface(btnConfig.targetId, btnConfig.tableName);
        });
        container.appendChild(button);
    });

    // 2. Manejar el botón de Dashboard Principal
    const dashboardButton = container.querySelector('[data-target="interface-0"]');
    if (dashboardButton) {
        dashboardButton.addEventListener('click', () => {
            showInterface('interface-0', 'dashboard');
        });
        // Marcar el dashboard como activo al inicio
        dashboardButton.classList.add('active');
    }
    
    // 3. Configurar el botón de Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

function showInterface(targetId, tableName) {
    // Ocultar todas las interfaces
    document.querySelectorAll('.interface').forEach(el => {
        el.classList.remove('active');
    });

    // Mostrar la interfaz objetivo
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.classList.add('active');
    }

    // Actualizar la clase 'active' en los botones de navegación
    document.querySelectorAll('#buttonContainer button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.target === targetId) {
            btn.classList.add('active');
        }
    });

    // Cargar los datos de la tabla si no es el dashboard
    if (tableName && tableName !== 'dashboard') {
        loadData(tableName);
    }
}

/*
 * ========================================================
 * LÓGICA GENÉRICA CRUD CON LOCAL STORAGE
 * ========================================================
 */

function loadData(tableName) {
    const data = JSON.parse(localStorage.getItem(tableName)) || [];
    renderTable(tableName, data);
}

function renderTable(tableName, data) {
    const tbody = document.getElementById(`table-body-${tableName}`);
    if (!tbody) return;

    tbody.innerHTML = ''; 
    const config = TABLE_CONFIGS[tableName];

    data.forEach(item => {
        const row = tbody.insertRow();

        config.fields.forEach(field => {
            const cell = row.insertCell();
            let value = item[field];
            
            // Lógica para aplicar el estilo de estado
            if (field === 'estado') {
                const statusClass = `status-${value.toLowerCase().replace(/\s/g, '')}`;
                cell.innerHTML = `<span class="${statusClass}">${value}</span>`;
            } else {
                // Formatear valor (ej: salario/total)
                if (typeof value === 'number' && (field.includes('salario') || field.includes('total') || field.includes('precio'))) {
                    value = `$${value.toFixed(2)}`;
                } else if (field.includes('fecha') && value) {
                    value = new Date(value).toLocaleDateString('es-CO');
                }
                cell.textContent = value;
            }
        });

        // Celda de Acciones (Editar/Eliminar)
        const actionCell = row.insertCell();
        actionCell.innerHTML = `
            <button class="edit-button" data-id="${item[config.pk]}" data-table="${tableName}">Editar</button>
            <button class="delete-button" data-id="${item[config.pk]}" data-table="${tableName}">Eliminar</button>
        `;
    });
    
    setupActionListeners(tableName);
}

function setupActionListeners(tableName) {
    const tableElement = document.getElementById(`table-body-${tableName}`);
    if (!tableElement) return;

    // Listeners para Editar
    tableElement.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (e) => {
            editItem(tableName, e.target.dataset.id);
        });
    });

    // Listeners para Eliminar
    tableElement.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (e) => {
            if (confirm(`¿Está seguro de eliminar el registro ID ${e.target.dataset.id} de ${tableName}?`)) {
                deleteItem(tableName, e.target.dataset.id);
            }
        });
    });
}

function editItem(tableName, id) {
    const data = JSON.parse(localStorage.getItem(tableName)) || [];
    const config = TABLE_CONFIGS[tableName];
    const item = data.find(i => String(i[config.pk]) === String(id));

    if (!item) return;
    
    const formContainer = document.getElementById(`form-container-${tableName}`);
    const form = document.getElementById(`form-${tableName}`);
    
    formContainer.style.display = 'block';

    // Rellenar todos los campos del formulario
    config.fields.forEach(field => {
        const input = document.getElementById(`${tableName}-${field}`);
        if (input) {
            // Manejo especial para fechas
            if (input.type === 'date' && item[field]) {
                 input.value = String(item[field]).split('T')[0];
            } else {
                input.value = item[field] || '';
            }
        }
    });
}

function deleteItem(tableName, id) {
    let data = JSON.parse(localStorage.getItem(tableName)) || [];
    const config = TABLE_CONFIGS[tableName];

    data = data.filter(item => String(item[config.pk]) !== String(id));
    
    localStorage.setItem(tableName, JSON.stringify(data));
    loadData(tableName);
}

function setupCreateButton(tableName) {
    const createButton = document.querySelector(`.crud-button.create-button[data-table="${tableName}"]`);
    const formContainer = document.getElementById(`form-container-${tableName}`);
    const form = document.getElementById(`form-${tableName}`);

    if (createButton) {
        createButton.addEventListener('click', () => {
            form.reset(); 
            const idField = document.getElementById(`${tableName}-${TABLE_CONFIGS[tableName].pk}`);
            if(idField) idField.value = ''; 
            formContainer.style.display = 'block';
        });
    }
}

function setupFormListeners(tableName) {
    const form = document.getElementById(`form-${tableName}`);
    const formContainer = document.getElementById(`form-container-${tableName}`);
    const cancelButton = form ? form.querySelector('.cancel-button') : null;

    if (form) {
        form.addEventListener('submit', (e) => handleFormSubmit(e, tableName));
    }
    
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            formContainer.style.display = 'none';
            form.reset();
        });
    }
}

function handleFormSubmit(e, tableName) {
    e.preventDefault();
    
    const config = TABLE_CONFIGS[tableName];
    let data = JSON.parse(localStorage.getItem(tableName)) || [];
    const formContainer = document.getElementById(`form-container-${tableName}`);
    const form = document.getElementById(`form-${tableName}`);
    const idField = document.getElementById(`${tableName}-${config.pk}`);
    const itemId = idField ? idField.value : null;

    let newItem = {};

    // Recoger los valores del formulario
    config.fields.forEach(field => {
        const input = document.getElementById(`${tableName}-${field}`);
        if (input) {
            if (input.type === 'number') {
                newItem[field] = parseFloat(input.value) || 0;
            } else {
                newItem[field] = input.value;
            }
        }
    });

    if (itemId) {
        // Lógica de Edición
        data = data.map(item => {
            if (String(item[config.pk]) === String(itemId)) {
                return newItem;
            }
            return item;
        });
    } else {
        // Lógica de Creación: Generar nuevo ID
        const newId = data.length > 0 ? Math.max(...data.map(item => item[config.pk])) + 1 : 1;
        newItem[config.pk] = newId;
        data.push(newItem);
    }

    // Guardar, ocultar y recargar
    localStorage.setItem(tableName, JSON.stringify(data));
    formContainer.style.display = 'none';
    form.reset();
    loadData(tableName);
}

/**
 * Inicializa la lógica CRUD para todas las tablas.
 */
function setupAllCrud() {
    Object.keys(TABLE_CONFIGS).forEach(tableName => {
        setupCreateButton(tableName);
        setupFormListeners(tableName);
    });
}

/*
 * ========================================================
 * INICIALIZACIÓN
 * ========================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    setupNavigation();
    setupAllCrud();
    
    // Mostrar la interfaz de Dashboard al cargar la página
    showInterface('interface-0', 'dashboard');
});