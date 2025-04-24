let juegoIniciado = false;
let cartas = [];
let cartasVolteadas = [];
let parejasEncontradas = 0;
let parejasTotales = 0;
let dimensiones = 4;
let puedeVoltear = true;

const tablero = document.getElementById('tablero');
const botonIniciar = document.getElementById('boton-iniciar');
const botonReiniciar = document.getElementById('boton-reiniciar');
const botonesDimensiones = document.querySelectorAll('.boton-dimension');
const elementoMensajeResultado = document.getElementById('mensaje-resultado');
const elementoMovimientosFinales = document.getElementById('movimientos-finales');
const elementoTiempoFinal = document.getElementById('tiempo-final');
const botonJugarDeNuevo = document.getElementById('boton-jugar-otra-vez');

// Emojis para las cartas
const simbolos = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
    '🐧', '🐦', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗',
    '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
    '🦟', '🦗', '🕷️', '🦂', '🦀', '🦞', '🦐', '🦑'
];

// Configuración de eventos
botonIniciar.addEventListener('click', iniciarJuego);
botonReiniciar.addEventListener('click', reiniciarJuego);

botonesDimensiones.forEach(boton => {
    boton.addEventListener('click', () => {
        if (juegoIniciado) return;
        
        dimensiones = parseInt(boton.dataset.dimension);
        
        botonesDimensiones.forEach(b => b.classList.remove('activo'));
        boton.classList.add('activo');
        
        inicializarJuego();
    });
});

document.querySelector(`.boton-dimension[data-dimension="4"]`).classList.add('activo');

botonJugarDeNuevo.addEventListener('click', () => {
    elementoMensajeResultado.classList.add('oculto');
    reiniciarJuego();
});

// Prepara el tablero y las cartas
function inicializarJuego() {
    tablero.innerHTML = '';
    tablero.className = 'tablero';
    tablero.classList.add(`tamaño-${dimensiones}`);
    
    juegoIniciado = false;
    cartasVolteadas = [];
    parejasEncontradas = 0;
    parejasTotales = (dimensiones * dimensiones) / 2;
    puedeVoltear = true;
    
    // Ocultar mensaje de resultado si está visible
    elementoMensajeResultado.classList.add('oculto');
    
    crearCartas();
    renderizarCartas();
}

// Crea los pares de cartas para el juego
function crearCartas() {
    const cartasTotales = dimensiones * dimensiones;
    const simbolosNecesarios = cartasTotales / 2;
    
    const simbolosJuego = simbolos.slice(0, simbolosNecesarios);
    
    cartas = [];
    for (let simbolo of simbolosJuego) {
        cartas.push({ simbolo, emparejada: false });
        cartas.push({ simbolo, emparejada: false });
    }
    
    mezclarCartas();
}

// Mezcla aleatoriamente las cartas
function mezclarCartas() {
    for (let i = cartas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
    }
}

// Coloca las cartas en el tablero
function renderizarCartas() {
    tablero.innerHTML = '';
    
    cartas.forEach((carta, indice) => {
        const elementoCarta = document.createElement('div');
        elementoCarta.className = 'carta';
        elementoCarta.dataset.index = indice;
        
        const cartaFrontal = document.createElement('div');
        cartaFrontal.className = 'carta-frontal';
        cartaFrontal.innerHTML = '🃏';
        
        const cartaTrasera = document.createElement('div');
        cartaTrasera.className = 'carta-trasera';
        cartaTrasera.textContent = carta.simbolo;
        
        elementoCarta.appendChild(cartaFrontal);
        elementoCarta.appendChild(cartaTrasera);
        
        if (carta.emparejada) {
            elementoCarta.classList.add('volteada', 'emparejada');
        }
        
        elementoCarta.addEventListener('click', () => voltearCarta(indice));
        tablero.appendChild(elementoCarta);
    });
}

// Maneja el volteo de una carta
function voltearCarta(indice) {
    if (!juegoIniciado) {
        iniciarJuego();
    }
    
    if (!puedeVoltear || cartasVolteadas.length >= 2 || cartas[indice].emparejada || 
        cartasVolteadas.some(indiceCarta => indiceCarta === indice)) {
        return;
    }
    
    cartasVolteadas.push(indice);
    
    const elementoCarta = document.querySelector(`.carta[data-index="${indice}"]`);
    elementoCarta.classList.add('volteada');
    
    if (cartasVolteadas.length === 2) {
        incrementarMovimientos();
        comprobarPareja();
    }
}

// Verifica si las cartas volteadas forman pareja
function comprobarPareja() {
    const [primerIndice, segundoIndice] = cartasVolteadas;
    const primeraCarta = cartas[primerIndice];
    const segundaCarta = cartas[segundoIndice];
    
    if (primeraCarta.simbolo === segundaCarta.simbolo) {
        manejarPareja(primerIndice, segundoIndice);
    } 
    else {
        manejarNoPareja(primerIndice, segundoIndice);
    }
}

// Procesa las cartas que forman pareja
function manejarPareja(primerIndice, segundoIndice) {
    cartas[primerIndice].emparejada = true;
    cartas[segundoIndice].emparejada = true;
    
    document.querySelector(`.carta[data-index="${primerIndice}"]`).classList.add('emparejada');
    document.querySelector(`.carta[data-index="${segundoIndice}"]`).classList.add('emparejada');
    
    parejasEncontradas++;
    cartasVolteadas = [];
    
    if (parejasEncontradas === parejasTotales) {
        finalizarJuego();
    }
}

// Procesa las cartas que no forman pareja
function manejarNoPareja(primerIndice, segundoIndice) {
    puedeVoltear = false;
    
    setTimeout(() => {
        document.querySelector(`.carta[data-index="${primerIndice}"]`).classList.remove('volteada');
        document.querySelector(`.carta[data-index="${segundoIndice}"]`).classList.remove('volteada');
        cartasVolteadas = [];
        puedeVoltear = true;
    }, 1000);
}

// Inicia el juego
function iniciarJuego() {
    if (juegoIniciado) return;
    
    juegoIniciado = true;
    reiniciarMovimientos();
    iniciarTemporizador();
    
    botonesDimensiones.forEach(boton => {
        boton.disabled = true;
        boton.style.opacity = '0.5';
        boton.style.cursor = 'not-allowed';
    });
}

// Finaliza el juego y muestra resultados
function finalizarJuego() {
    detenerTemporizador();
    
    elementoMovimientosFinales.textContent = document.getElementById('movimientos').textContent;
    elementoTiempoFinal.textContent = document.getElementById('tiempo').textContent;
    elementoMensajeResultado.classList.remove('oculto');
}

// Reinicia el juego
function reiniciarJuego() {
    detenerTemporizador();
    reiniciarMovimientos();
    
    botonesDimensiones.forEach(boton => {
        boton.disabled = false;
        boton.style.opacity = '1';
        boton.style.cursor = 'pointer';
    });
    
    inicializarJuego();
}

// Inicializar el juego al cargar la página
window.addEventListener('DOMContentLoaded', inicializarJuego);
