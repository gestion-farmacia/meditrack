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

// --- 4. FUNCIÓN PARA MOSTRAR PACIENTES (DESDE LOCAL Y NUBE) ---
function mostrarPacientes() {
    let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    const textoBusqueda = buscador.value.toLowerCase();

    const pacientesFiltrados = pacientes.filter(p => {
        const coincideFiltro = (filtroActual === "Todos" || p.patologia === filtroActual);
        const coincideBusqueda = (p.nombre.toLowerCase().includes(textoBusqueda) || p.cedula.includes(textoBusqueda));
        return coincideFiltro && coincideBusqueda;
    });

    listaPacientes.innerHTML = '';
    
    if (pacientesFiltrados.length === 0) {
        listaPacientes.innerHTML = `<p style="text-align:center; padding:20px; color:#666;">No hay pacientes registrados.</p>`;
        return;
    }

    pacientesFiltrados.forEach(p => {
        listaPacientes.innerHTML += `
            <div class="paciente-card">
                <div class="card-info">
                    <strong>${p.nombre}</strong> <span class="tag">${p.patologia}</span><br>
                    <small>C.I: ${p.cedula} | Edad: ${p.edad} años</small><br>
                    <div class="medicamento-info"><strong>💊 Tratamiento:</strong> ${p.medicamento || 'Sin asignar'}</div>
                    <small>📞 Tel: ${p.telefono || 'N/A'}</small><br>
                    <small>📍 ${p.direccion || 'Sin dirección'}</small>
                </div>
                <div class="card-actions">
                    <button class="btn-edit" onclick="prepararEdicion(${p.id})">✏️</button>
                    <button class="btn-delete" onclick="eliminarPaciente(${p.id})">🗑️</button>
                </div>
            </div>`;
    });
}

// --- 5. LÓGICA DE FIREBASE (NUBE) ---
async function guardarEnFirebase(datos) {
    try {
        const { collection, addDoc, doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        if (editandoID) {
            await setDoc(doc(window.db, "pacientes", editandoID.toString()), datos);
        } else {
            await addDoc(collection(window.db, "pacientes"), datos);
        }
        console.log("¡Sincronizado con Firebase!");
    } catch (error) {
        console.error("Error en nube:", error);
    }
}

// Cargar datos de la nube al iniciar
async function cargarDesdeFirebase() {
    try {
        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        const querySnapshot = await getDocs(collection(window.db, "pacientes"));
        let pacientesNube = [];
        querySnapshot.forEach((doc) => {
            pacientesNube.push({ ...doc.data(), id: doc.id });
        });
        if (pacientesNube.length > 0) {
            localStorage.setItem('pacientes', JSON.stringify(pacientesNube));
            mostrarPacientes();
        }
    } catch (error) {
        console.error("Error cargando de la nube:", error);
    }
}

// --- 6. GUARDAR, EDITAR Y ELIMINAR ---
pacienteForm.addEventListener('submit', async (e) => {
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

    // Guardado Local (para velocidad y modo offline)
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
    
    // Guardado en Nube (Firebase)
    await guardarEnFirebase(datos);

    pacienteForm.reset();
    btnCancelar.click(); 
    mostrarPacientes();
});

window.prepararEdicion = (id) => {
    let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    const p = pacientes.find(pac => pac.id == id);
    if (p) {
        editandoID = id;
        document.getElementById('nombre').value = p.nombre;
        document.getElementById('cedula').value = p.cedula;
        document.getElementById('direccion').value = p.direccion;
        document.getElementById('telefono').value = p.telefono;
        document.getElementById('edad').value = p.edad;
        document.getElementById('medicamento').value = p.medicamento;
        document.querySelector('.btn-save').textContent = "Actualizar Cambios";
        vistaConsulta.style.display = 'none';
        vistaFormulario.style.display = 'block';
    }
};

window.eliminarPaciente = (id) => {
    if (confirm("¿Eliminar este registro?")) {
        let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
        pacientes = pacientes.filter(p => p.id != id);
        localStorage.setItem('pacientes', JSON.stringify(pacientes));
        mostrarPacientes();
        // Nota: Para eliminar de Firebase se requiere una función extra, la añadiremos luego.
    }
};

// --- 7. ESTADO DE RED ---
const barraStatus = document.getElementById('status-red');
const textoStatus = document.getElementById('status-texto');

function actualizarEstadoRed() {
    if (!barraStatus || !textoStatus) return; 
    if (navigator.onLine) {
        barraStatus.className = 'status-barra online';
        textoStatus.innerText = "● Modo Online - Sincronizado";
        cargarDesdeFirebase(); // Si vuelve el internet, actualizamos datos
    } else {
        barraStatus.className = 'status-barra offline';
        textoStatus.innerText = "○ Modo Offline - Local";
    }
}

window.addEventListener('online', actualizarEstadoRed);
window.addEventListener('offline', actualizarEstadoRed);

// --- 8. INICIO ---
document.addEventListener('DOMContentLoaded', () => {
    actualizarEstadoRed();
    mostrarPacientes();
});
pacienteForm.addEventListener('submit', async (e) => { // Agregamos 'async' aquí
    e.preventDefault();
    
    // ... (aquí va tu código que ya tienes para armar el objeto 'datos') ...

    // 1. Guardas en el celular (lo que ya hacías)
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
    
    // 2. ¡ESTO ES LO NUEVO! Envías a la nube
    await guardarEnFirebase(datos); // Usamos 'await' para esperar a la nube

    pacienteForm.reset();
    btnCancelar.click(); 
    mostrarPacientes();
});
