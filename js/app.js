// --- 1. REFERENCIAS AL DOM ---
const vistaConsulta = document.getElementById('vistaConsulta');
const vistaFormulario = document.getElementById('vistaFormulario');
const listaPacientes = document.getElementById('listaPacientes');
const buscador = document.getElementById('buscador');
const filtroBotones = document.querySelectorAll('.filter-btn');

const pacienteForm = document.getElementById('pacienteForm');
const selectorPatologia = document.getElementById('patologia');
const contenedorOtros = document.getElementById('contenedor-otros');
const btnNuevo = document.getElementById('btnNuevo');
const btnCancelar = document.getElementById('btnCancelar');
const logoutBtn = document.getElementById('logoutBtn');

let editandoID = null; 
let filtroActual = "Todos";

// --- 2. GESTIÓN DE VISTAS ---
btnNuevo.addEventListener('click', () => {
    editandoID = null; 
    document.querySelector('.btn-save').textContent = "Guardar";
    vistaConsulta.style.display = 'none';
    vistaFormulario.style.display = 'block';
});

btnCancelar.addEventListener('click', () => {
    vistaFormulario.style.display = 'none';
    vistaConsulta.style.display = 'block';
    pacienteForm.reset();
    contenedorOtros.style.display = 'none';
});

logoutBtn.addEventListener('click', () => {
    window.location.href = "index.html";
});

// --- 3. LÓGICA DE FILTROS Y BÚSQUEDA ---
filtroBotones.forEach(boton => {
    boton.addEventListener('click', () => {
        filtroBotones.forEach(b => b.classList.remove('active'));
        boton.classList.add('active');
        filtroActual = boton.getAttribute('data-filter');
        mostrarPacientes();
    });
});

buscador.addEventListener('input', () => mostrarPacientes());

selectorPatologia.addEventListener('change', () => {
    contenedorOtros.style.display = selectorPatologia.value === 'Otros' ? 'block' : 'none';
});

// --- 4. FUNCIÓN PARA MOSTRAR PACIENTES (Versión Corregida) ---
function mostrarPacientes() {
    // Traemos los datos
    let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    const textoBusqueda = buscador.value.toLowerCase();

    // Aplicamos los filtros
    const pacientesFiltrados = pacientes.filter(p => {
        const coincideFiltro = (filtroActual === "Todos" || p.patologia === filtroActual);
        const coincideBusqueda = (p.nombre.toLowerCase().includes(textoBusqueda) || p.cedula.includes(textoBusqueda));
        return coincideFiltro && coincideBusqueda;
    });

    // Limpiamos la lista
    listaPacientes.innerHTML = '';
    
    // SI NO HAY PACIENTES: Mostramos un mensaje claro
    if (pacientesFiltrados.length === 0) {
        listaPacientes.innerHTML = `<p style="text-align:center; padding:20px; color:#666;">
            No se encontraron pacientes registrados.
        </p>`;
        return;
    }

    // SI HAY PACIENTES: Los dibujamos
    pacientesFiltrados.forEach(p => {
        listaPacientes.innerHTML += `
            <div class="paciente-card">
                <div class="card-info">
                    <strong>${p.nombre}</strong> <span class="tag">${p.patologia}</span><br>
                    <small>C.I: ${p.cedula} | Edad: ${p.edad} años</small><br>
                    <div class="medicamento-info">
                        <strong>💊 Tratamiento:</strong> ${p.medicamento || 'Sin asignar'}
                    </div>
                    <small>📞 Tel: ${p.telefono || 'N/A'}</small><br>
                    <small>📍 ${p.direccion || 'Sin dirección'}</small>
                </div>
                <div class="card-actions">
                    <button class="btn-edit" onclick="prepararEdicion(${p.id})">✏️</button>
                    <button class="btn-delete" onclick="eliminarPaciente(${p.id})">🗑️</button>
                </div>
            </div>
        `;
    });
}

// --- 5. GESTIÓN DE INICIO (El secreto del Master) ---
// Este bloque asegura que todo se ejecute apenas cargue la página
document.addEventListener('DOMContentLoaded', () => {
    console.log("MediTrack cargado correctamente.");
    actualizarEstadoRed(); // Revisa si hay internet
    mostrarPacientes();    // Muestra la lista de inmediato
});


// --- 5. EDITAR, GUARDAR Y ELIMINAR ---
window.prepararEdicion = (id) => {
    let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    const p = pacientes.find(pac => pac.id === id);

    if (p) {
        editandoID = id;
        document.getElementById('nombre').value = p.nombre;
        document.getElementById('cedula').value = p.cedula;
        document.getElementById('direccion').value = p.direccion;
        document.getElementById('telefono').value = p.telefono;
        document.getElementById('edad').value = p.edad;
        document.getElementById('medicamento').value = p.medicamento;

        const opcionesEstandar = ["Hipertensión", "Cardiopata", "Diabetico", "Psiquiatrico", "Bronco Pulmonar", "Endocrina"];
        
        if (opcionesEstandar.includes(p.patologia)) {
            selectorPatologia.value = p.patologia;
            contenedorOtros.style.display = 'none';
        } else {
            selectorPatologia.value = "Otros";
            contenedorOtros.style.display = 'block';
            document.getElementById('otra_patologia').value = p.patologia;
        }

        document.querySelector('.btn-save').textContent = "Actualizar Cambios";
        vistaConsulta.style.display = 'none';
        vistaFormulario.style.display = 'block';
    }
};

pacienteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    
    const patologiaFinal = selectorPatologia.value === 'Otros' 
                            ? document.getElementById('otra_patologia').value 
                            : selectorPatologia.value;

    const datos = {
        id: editandoID ? editandoID : Date.now(),
        nombre: document.getElementById('nombre').value,
        cedula: document.getElementById('cedula').value,
        direccion: document.getElementById('direccion').value,
        telefono: document.getElementById('telefono').value,
        edad: document.getElementById('edad').value,
        patologia: patologiaFinal,
        medicamento: document.getElementById('medicamento').value
    };

    if (editandoID) {
        const index = pacientes.findIndex(p => p.id === editandoID);
        pacientes[index] = datos;
    } else {
        pacientes.push(datos);
    }

    localStorage.setItem('pacientes', JSON.stringify(pacientes));
    pacienteForm.reset();
    btnCancelar.click(); 
    mostrarPacientes();
});

window.eliminarPaciente = (id) => {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
        let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
        pacientes = pacientes.filter(p => p.id !== id);
        localStorage.setItem('pacientes', JSON.stringify(pacientes));
        mostrarPacientes();
    }
};

// --- 6. GESTIÓN DE CONEXIÓN A INTERNET ---
const barraStatus = document.getElementById('status-red');
const textoStatus = document.getElementById('status-texto');

function actualizarEstadoRed() {
    // Verificamos si los elementos existen antes de usarlos
    if (!barraStatus || !textoStatus) return; 

    if (navigator.onLine) {
        barraStatus.classList.remove('offline');
        barraStatus.classList.add('online');
        textoStatus.innerText = "● Modo Online - Sincronizado";
    } else {
        barraStatus.classList.remove('online');
        barraStatus.classList.add('offline');
        textoStatus.innerText = "○ Modo Offline - Local";
    }
}

window.addEventListener('online', actualizarEstadoRed);
window.addEventListener('offline', actualizarEstadoRed);

// --- 7. SIMULACIÓN DE SINCRONIZACIÓN ---
function sincronizarConServidor() {
    const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    if (pacientes.length > 0) {
        console.log("Sincronizando registros con el servidor...");
    }
}

// --- 8. INICIO AUTOMÁTICO ---
document.addEventListener('DOMContentLoaded', () => {
    actualizarEstadoRed();
    mostrarPacientes();
});