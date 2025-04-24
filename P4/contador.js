let intervaloTiempo;
let segundos = 0;
let movimientos = 0;

const elementoTiempo = document.getElementById('tiempo');
const elementoMovimientos = document.getElementById('movimientos');

// Inicia el contador de tiempo
function iniciarTemporizador() {
    segundos = 0;
    actualizarVisualizacionTiempo();
    
    if (intervaloTiempo) {
        clearInterval(intervaloTiempo);
    }
    
    intervaloTiempo = setInterval(() => {
        segundos++;
        actualizarVisualizacionTiempo();
    }, 1000);
}

// Detiene el contador de tiempo
function detenerTemporizador() {
    if (intervaloTiempo) {
        clearInterval(intervaloTiempo);
        intervaloTiempo = null;
    }
}

// Actualiza el formato del tiempo en pantalla
function actualizarVisualizacionTiempo() {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    
    const minutosFormateados = minutos < 10 ? '0' + minutos : minutos;
    const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
    
    elementoTiempo.textContent = `${minutosFormateados}:${segundosFormateados}`;
}

// Incrementa el contador de movimientos
function incrementarMovimientos() {
    movimientos++;
    actualizarVisualizacionMovimientos();
}

// Reinicia el contador de movimientos
function reiniciarMovimientos() {
    movimientos = 0;
    actualizarVisualizacionMovimientos();
}

// Actualiza el contador de movimientos en pantalla
function actualizarVisualizacionMovimientos() {
    elementoMovimientos.textContent = movimientos;
}
