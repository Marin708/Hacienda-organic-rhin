// js/app.js - CÓDIGO FUNCIONAL DEFINITIVO (ID, EDITAR, ELIMINAR CORREGIDOS)

// ===============================================
// LÓGICA DE NAVEGACIÓN
// ===============================================

function checkSession() {
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
    }
}

function showInterface(targetId) {
    document.querySelectorAll('.interface').forEach(el => el.classList.remove('active'));
    const targetInterface = document.getElementById(targetId);
    if (targetInterface) {
        targetInterface.classList.add('active');
        const tableName = targetInterface.getAttribute('data-table');
        if (tableName) {
            renderTable(tableName);
        }
    }
    document.querySelectorAll('#buttonContainer button').forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`button[data-target="${targetId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// ===============================================
// MAPEADO DE TABLAS Y CONFIGURACIÓN
// ===============================================

const TABLE_CONFIGS = {
    'interface-2': { name: 'departamentos', title: 'Departamentos', fields: ['id', 'nombre', 'descripcion', 'estado'] },
    'interface-3': { name: 'cargos', title: 'Cargos', fields: ['id', 'nombre', 'salario_base', 'id_departamento', 'estado'] },
    'interface-4': { name: 'empleados', title: 'Empleados', fields: ['id', 'nombre', 'apellido', 'id_cargo', 'salario_actual', 'estado'] },
    'interface-5': { name: 'asistencia', title: 'Asistencia', fields: ['id', 'id_empleado', 'fecha', 'hora_entrada', 'hora_salida', 'estado'] },
    'interface-6': { name: 'nomina', title: 'Nómina', fields: ['id', 'id_empleado', 'periodo_inicio', 'periodo_fin', 'total_neto', 'estado'] },
    'interface-7': { name: 'tipos_producto', title: 'Tipos Producto', fields: ['id', 'nombre', 'categoria', 'unidad_medida', 'estado'] },
    'interface-8': { name: 'productos', title: 'Productos', fields: ['id', 'nombre', 'id_tipo_producto', 'precio_unitario', 'stock_actual', 'estado'] },
    'interface-9': { name: 'proveedores', title: 'Proveedores', fields: ['id', 'nombre', 'contacto', 'telefono', 'ruc_nit', 'estado'] },
    'interface-10': { name: 'recolecta', title: 'Recolecta', fields: ['id', 'id_producto', 'id_proveedor', 'cantidad', 'total', 'fecha', 'estado'] },
    'interface-11': { name: 'clientes', title: 'Clientes', fields: ['id', 'nombre', 'apellido', 'telefono', 'tipo_cliente', 'estado'] },
    'interface-12': { name: 'ventas', title: 'Ventas', fields: ['id', 'id_cliente', 'id_producto', 'cantidad', 'total', 'fecha', 'estado'] },
    'interface-13': { name: 'inventario', title: 'Inventario', fields: ['id', 'id_producto', 'tipo_movimiento', 'cantidad', 'fecha', 'responsable'] },
    'interface-14': { name: 'actividades', title: 'Log Actividades', fields: ['id', 'descripcion', 'responsable', 'fecha'] },
};

// ===============================================
// FUNCIÓN AUXILIAR DE CONVERSIÓN DE TIPO DE DATO
// ===============================================
function convertValue(key, value) {
    const NUMERIC_KEYS = [
        'id', 'id_departamento', 'id_cargo', 'id_empleado', 'id_producto', 'id_proveedor', 'id_cliente', 
        'salario_base', 'salario_actual', 'total_neto', 'precio_unitario', 'stock_actual', 'stock_minimo',
        'cantidad', 'total', 'descuento' 
    ];
    
    // Convertimos solo si el valor no está vacío
    if (NUMERIC_KEYS.includes(key) && value !== '' && value !== null && value !== undefined) {
        if (key.startsWith('id')) {
            // IDs siempre enteros
            return parseInt(value);
        }
        // Valores con decimales
        return parseFloat(value);
    }
    return value;
}


// ===============================================
// LÓGICA DE CRUD GENÉRICA (Local Storage)
// ===============================================

function getRecords(tableName) {
    const data = localStorage.getItem(tableName);
    return data ? JSON.parse(data) : [];
}

function saveRecords(tableName, records) {
    localStorage.setItem(tableName, JSON.stringify(records));
}

function saveRecord(tableName, recordData) {
    let records = getRecords(tableName);
    const timeStamp = new Date().toISOString();
    
    const dataToSave = {};

    // 1. Recolectar y CONVERTIR datos del formulario
    for (const key in recordData) {
        dataToSave[key] = convertValue(key, recordData[key]);
    }
    
    // 2. CREATE o UPDATE
    if (dataToSave.id && dataToSave.id > 0) { 
        // UPDATE (Actualizar) - dataToSave.id ya es número
        const index = records.findIndex(r => r.id === dataToSave.id);
        if (index !== -1) {
            records[index] = { ...records[index], ...dataToSave, editado_en: timeStamp };
        }
    } else {
        // CREATE (Crear)
        
        // CRÍTICO: CÁLCULO DE MAX ID SEGURO
        const existingIds = records.map(r => r.id).filter(id => typeof id === 'number' && !isNaN(id) && id !== null);

        const maxId = existingIds.length > 0 
            ? Math.max(...existingIds) 
            : 0;
            
        const newId = maxId + 1;
        
        records.push({ 
            id: newId, 
            ...dataToSave, 
            creado_en: timeStamp, 
            editado_en: timeStamp 
        });
    }

    saveRecords(tableName, records);
    return true;
}

function deleteRecord(tableName, id) {
    let records = getRecords(tableName);
    // CRUCIAL: Convertimos el ID del botón (string) a número entero para la comparación.
    records = records.filter(r => r.id !== parseInt(id)); 
    saveRecords(tableName, records);
}


// ===============================================
// RENDERIZADO DE TABLAS Y MANEJO DE EVENTOS
// ===============================================

function renderTable(tableName) {
    const records = getRecords(tableName);
    const tableBody = document.getElementById(`table-body-${tableName}`);
    const config = Object.values(TABLE_CONFIGS).find(c => c.name === tableName);
    
    if (!tableBody || !config) return;

    tableBody.innerHTML = ''; 

    records.forEach(record => {
        const row = tableBody.insertRow();
        
        config.fields.forEach(field => {
            const cell = row.insertCell();
            let value = record[field] !== undefined ? record[field] : '';
            
            // Asignamos el valor. Para el ID, 'value' es el número.
            cell.textContent = value; 
            
            // Aplicar formato de decimales solo a campos que lo requieren
            if (field !== 'id' && typeof value === 'number' && (field.includes('salario') || field.includes('precio') || field.includes('total') || field.includes('cantidad'))) {
                 cell.textContent = value.toFixed(2);
            }
            
            // Estilos para el estado
            if (field === 'estado' || field === 'estado_registro') {
                cell.innerHTML = `<span class="status-${value}">${value}</span>`;
            }
        });
        
        // Columna de Acciones
        const actionsCell = row.insertCell();
        // Los botones toman el ID de 'record.id', que es el valor numérico guardado.
        actionsCell.innerHTML = `
            <button class="edit-button" data-id="${record.id}" data-table="${tableName}">Editar</button>
            <button class="delete-button" data-id="${record.id}" data-table="${tableName}">Eliminar</button>
        `;
    });
}


function setupEventListeners() {
    // 1. Manejo Genérico del Formulario (CREATE/UPDATE)
    document.querySelectorAll('.crud-form-container form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const tableName = form.getAttribute('data-table');
            const recordData = {};
            
            Array.from(form.elements).forEach(el => {
                if (el.id && el.name !== 'password-confirm' && el.type !== 'submit' && el.type !== 'button') {
                    const key = el.id.replace(`${tableName}-`, ''); 
                    recordData[key] = el.value;
                }
            });
            
            saveRecord(tableName, recordData);
            form.closest('.crud-form-container').style.display = 'none';
            form.reset();
            renderTable(tableName);
        });
    });

    // 2. Manejo Genérico de Botones (Crear/Cancelar)
    document.querySelectorAll('.crud-button.create-button').forEach(btn => {
        btn.addEventListener('click', function() {
            const tableName = btn.getAttribute('data-table');
            const formContainer = document.getElementById(`form-container-${tableName}`);
            document.getElementById(`form-${tableName}`).reset();
            document.getElementById(`${tableName}-id`).value = ''; 
            formContainer.style.display = 'block';
        });
    });

    document.querySelectorAll('.cancel-button').forEach(btn => {
        btn.addEventListener('click', function() {
            btn.closest('.crud-form-container').style.display = 'none';
        });
    });


    // 3. Manejo Genérico de Botones de Tabla (EDIT/DELETE)
    document.getElementById('contentArea').addEventListener('click', function(e) {
        const button = e.target.closest('.delete-button, .edit-button');
        
        if (!button) return; 

        const id = button.dataset.id; // ID como string
        const tableName = button.dataset.table;

        if (button.classList.contains('delete-button')) {
            // DELETE (Llama a deleteRecord que usa parseInt(id))
            if (confirm(`¿Estás seguro de eliminar el registro ID ${id} de la tabla ${tableName}?`)) {
                deleteRecord(tableName, id); 
                renderTable(tableName);
            }
        } else if (button.classList.contains('edit-button')) {
            // EDIT (Llama a getRecords y busca el registro con parseInt(id))
            const record = getRecords(tableName).find(r => r.id === parseInt(id)); 
            if (!record) return;

            const formContainer = document.getElementById(`form-container-${tableName}`);
            const form = document.getElementById(`form-${tableName}`);
            
            // Cargar ID
            document.getElementById(`${tableName}-id`).value = record.id;
            
            // Cargar campos
            Array.from(form.elements).forEach(el => {
                const fieldName = el.id.replace(`${tableName}-`, '');
                if (record[fieldName] !== undefined) {
                    const value = record[fieldName];
                    
                    if (el.type === 'date' && value) {
                        el.value = value.substring(0, 10);
                    } else if (el.type === 'number' || el.tagName === 'SELECT') {
                        el.value = (typeof value === 'number') ? value.toString() : value;
                    } else {
                        el.value = value;
                    }
                }
            });
            
            formContainer.style.display = 'block';
        }
    });

    // 4. Manejo del Cierre de Sesión
    document.getElementById('logoutBtn').addEventListener('click', function() {
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    });
}


// ===============================================
// INICIALIZACIÓN
// ===============================================

function setupApp() {
    checkSession();

    const buttonContainer = document.getElementById('buttonContainer');
    
    Object.keys(TABLE_CONFIGS).forEach(id => {
        const config = TABLE_CONFIGS[id];
        const button = document.createElement('button');
        button.textContent = config.title;
        button.setAttribute('data-target', id);
        button.addEventListener('click', () => showInterface(id));
        buttonContainer.appendChild(button);
    });
    
    setupEventListeners();
    showInterface('interface-0');
}

window.onload = setupApp;