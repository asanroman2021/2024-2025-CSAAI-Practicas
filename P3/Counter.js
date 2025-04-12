// Clase para manejar el contador de tiempo
class Counter {
    constructor(elementId) {
        this.timerElement = document.getElementById(elementId);
        this.startTime = Date.now();
        this.running = false;
        this.minutes = 0;
        this.seconds = 0;
        this.milliseconds = 0;
        this.intervalId = null;
        this.pausedTime = 0;
        this.totalPausedTime = 0;
    }

    // Iniciar el contador
    start() {
        if (!this.running) {
            this.startTime = Date.now() - this.totalPausedTime;
            this.running = true;
            this.intervalId = setInterval(() => this.update(), 10); // Actualizar cada 10ms
        }
    }

    // Detener el contador
    stop() {
        if (this.running) {
            clearInterval(this.intervalId);
            this.running = false;
            this.pausedTime = Date.now();
        }
    }

    // Reanudar el contador
    resume() {
        if (!this.running && this.pausedTime > 0) {
            // Calcular el tiempo que estuvo pausado
            this.totalPausedTime += (Date.now() - this.pausedTime);
            this.pausedTime = 0;
            this.start();
        }
    }

    // Reiniciar el contador
    reset() {
        this.stop();
        this.minutes = 0;
        this.seconds = 0;
        this.milliseconds = 0;
        this.totalPausedTime = 0;
        this.pausedTime = 0;
        this.updateDisplay();
    }

    // Actualizar el contador
    update() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.startTime;
        
        this.milliseconds = Math.floor((elapsedTime % 1000) / 10);
        this.seconds = Math.floor((elapsedTime / 1000) % 60);
        this.minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
        
        this.updateDisplay();
    }

    // Actualizar la visualización del contador
    updateDisplay() {
        const formattedMinutes = String(this.minutes).padStart(2, '0');
        const formattedSeconds = String(this.seconds).padStart(2, '0');
        const formattedMilliseconds = String(this.milliseconds).padStart(2, '0');
        
        this.timerElement.textContent = `Tiempo: ${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`;
    }

    // Obtener el tiempo actual como string
    getTimeString() {
        const formattedMinutes = String(this.minutes).padStart(2, '0');
        const formattedSeconds = String(this.seconds).padStart(2, '0');
        const formattedMilliseconds = String(this.milliseconds).padStart(2, '0');
        
        return `${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`;
    }
    
    // Finalizar el contador (para victoria o derrota)
    finalize() {
        this.stop();
        // Opcional: Añadir algún efecto visual al contador cuando finaliza
        this.timerElement.classList.add('finalized');
    }
}

// Crear e iniciar el contador cuando se carga la página
const gameTimer = new Counter('timer');
window.addEventListener('load', () => {
    gameTimer.start();
});
