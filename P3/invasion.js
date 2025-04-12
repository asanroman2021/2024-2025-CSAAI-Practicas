const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const width = canvas.width;
const height = canvas.height;

// Variables de estado del juego
let score = 0, gameOver = false, gamePaused = false;
let keysPressed = {}, lastShotTime = 0;
const shotCooldown = 300;

// Elementos del juego
const player = {
    x: width / 2 - 20, y: height - 50,
    width: 40, height: 20, speed: 5
};
const bullets = [], aliens = [], explosions = [];
const alienRows = 3, alienCols = 8;
let alienSpeed = 0.8, direction = 1;
const maxAlienSpeed = 1.8, alienDropDistance = 30;

// Cargar imágenes
const explosionImg = new Image();
explosionImg.src = 'sonidos/explosion.png';

// Cargar imagen del alien - Asegurarse de que la ruta sea correcta
const alienImg = new Image();
alienImg.src = 'imagenes/Alien.png'; // Verificar que esta ruta sea correcta
alienImg.onload = () => console.log("Imagen de alien cargada correctamente");
alienImg.onerror = (e) => {
    console.error("Error al cargar la imagen del alien:", e);
    // Intentar con una ruta alternativa si la primera falla
    alienImg.src = 'sonidos/alien.png';
};
/* Añadir esta clase para mejorar la visualización de las imágenes de aliens */
const naveImg = new Image();
naveImg.src = 'imagenes/nave.png';
naveImg.onload = () => console.log("Imagen de nave cargada correctamente");
naveImg.onerror = (e) => console.error("Error al cargar la imagen de la nave:", e);

// Precargar y configurar sonidos
const shootSound = new Audio('sonidos/disparo.mp3');
shootSound.volume = 0.5; // Ajustar volumen

const explosionSound = new Audio('sonidos/explosion.mp3');
explosionSound.volume = 0.7;

const victorySound = new Audio('sonidos/victoria.mp3');
victorySound.volume = 0.8;

const gameOverSound = new Audio('sonidos/gameover.mp3');
gameOverSound.volume = 0.8;

// Función para reproducir sonidos de manera segura
function playSound(sound) {
    // Crear una copia del sonido para permitir superposición
    const soundClone = sound.cloneNode();
    soundClone.volume = sound.volume;
    
    // Reproducir con manejo de errores
    const playPromise = soundClone.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.warn("Error reproduciendo sonido:", error);
        });
    }
}

// Crear botón de pausa
const pauseButton = document.createElement('button');
pauseButton.textContent = 'PAUSA';
pauseButton.className = 'pause-button';
document.querySelector('.game-container').appendChild(pauseButton);
pauseButton.addEventListener('click', togglePause);

// Inicializar aliens
function createAliens() {
    for (let row = 0; row < alienRows; row++) {
        aliens[row] = [];
        for (let col = 0; col < alienCols; col++) {
            aliens[row][col] = {
                x: col * 60 + 50, y: row * 40 + 30,
                width: 40, height: 30, alive: true
            };
        }
    }
}
createAliens();

// Función para alternar pausa
function togglePause() {
    gamePaused = !gamePaused;
    pauseButton.textContent = gamePaused ? 'REANUDAR' : 'PAUSA';
    pauseButton.classList.toggle('paused', gamePaused);
    
    if (typeof gameTimer !== 'undefined') {
        gamePaused ? gameTimer.stop() : (gameOver ? null : gameTimer.resume());
    }
}

// Mantener proporción del canvas
// Reemplazar la función resizeCanvas actual con esta versión mejorada
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const ratio = width / height;
    
    // Obtener el ancho disponible (considerando márgenes y padding)
    const availableWidth = container.clientWidth;
    const availableHeight = window.innerHeight * 0.8; // Usar 80% de la altura de la ventana
    
    // Calcular dimensiones manteniendo la relación de aspecto
    let newWidth, newHeight;
    
    if (availableWidth / availableHeight > ratio) {
        // Si el contenedor es más ancho que alto (relativo al ratio)
        newHeight = availableHeight;
        newWidth = newHeight * ratio;
    } else {
        // Si el contenedor es más alto que ancho (relativo al ratio)
        newWidth = availableWidth;
        newHeight = newWidth / ratio;
    }
    
    // Aplicar las nuevas dimensiones
    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;
    
    // Actualizar la posición del botón de pausa para que sea accesible
    const pauseBtn = document.querySelector('.pause-button');
    if (pauseBtn) {
        pauseBtn.style.position = 'absolute';
        pauseBtn.style.top = '450px';
        pauseBtn.style.zIndex = '100';
        pauseBtn.style.padding = '10px 15px';
        pauseBtn.style.fontSize = '16px';
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Eventos de control
canvas.addEventListener('touchmove', (e) => {
    if (gamePaused || gameOver) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    
    player.x = Math.max(0, Math.min(width - player.width, touchX - player.width / 2));
    
    const now = Date.now();
    if (now - lastShotTime > shotCooldown) {
        shootBullet();
        lastShotTime = now;
    }
});

canvas.addEventListener('touchend', (e) => {
    if (!gameOver && !gamePaused) shootBullet();
});

document.addEventListener('keydown', (e) => {
    keysPressed[e.key] = true;
    if (e.key === 'p' || e.key === 'P') togglePause();
});

document.addEventListener('keyup', (e) => keysPressed[e.key] = false);

// Funciones del juego
function handlePlayerMovement() {
    if (gamePaused) return;
    
    if (keysPressed['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keysPressed['ArrowRight'] && player.x < width - player.width) player.x += player.speed;
    if (keysPressed[' '] && !gameOver) {
        const now = Date.now();
        if (now - lastShotTime > shotCooldown) {
            shootBullet();
            lastShotTime = now;
        }
    }
}

function shootBullet() {
    if (gamePaused) return;
    bullets.push({ 
        x: player.x + player.width / 2 - 3, 
        y: player.y, width: 6, height: 18 
    });
    playSound(shootSound);
}

function moveAliens() {
    if (gamePaused) return;
    
    let hitWall = false;
    
    aliens.forEach(row => {
        row.forEach(alien => {
            if (alien && alien.alive) {
                alien.x += alienSpeed * direction;
                if (alien.x >= width - alien.width || alien.x <= 0) hitWall = true;
            }
        });
    });
    
    if (hitWall) {
        direction *= -1;
        aliens.forEach(row => {
            row.forEach(alien => {
                if (alien && alien.alive) {
                    alien.y += alienDropDistance;
                    alienSpeed = Math.min(alienSpeed + 0.1, maxAlienSpeed);
                }
            });
        });
    }
}

function createExplosion(x, y) {
    explosions.push({
        x, y, size: 30, opacity: 1, frame: 0, maxFrames: 10
    });
    playSound(explosionSound);
}

function drawExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        ctx.globalAlpha = exp.opacity;
        
        if (explosionImg.complete && explosionImg.naturalWidth) {
            ctx.drawImage(explosionImg, exp.x - exp.size/2, exp.y - exp.size/2, exp.size, exp.size);
        } else {
            const gradient = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.size);
            gradient.addColorStop(0, `rgba(255, 255, 0, ${exp.opacity})`);
            gradient.addColorStop(0.5, `rgba(255, 120, 0, ${exp.opacity})`);
            gradient.addColorStop(1, `rgba(255, 0, 0, ${exp.opacity})`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(exp.x, exp.y, exp.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        if (!gamePaused) {
            exp.frame++;
            exp.size += 1;
            exp.opacity -= 0.1;
        }
        
        if (exp.frame >= exp.maxFrames) explosions.splice(i, 1);
        ctx.globalAlpha = 1;
    }
}

function checkCollisions() {
    if (gamePaused) return;
    
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        let bulletHit = false;
        
        outerLoop: for (let row = 0; row < aliens.length; row++) {
            for (let col = 0; col < aliens[row].length; col++) {
                const alien = aliens[row][col];
                if (alien && alien.alive && 
                    bullet.x < alien.x + alien.width && 
                    bullet.x + bullet.width > alien.x && 
                    bullet.y < alien.y + alien.height && 
                    bullet.y + bullet.height > alien.y) {
                    
                    createExplosion(alien.x + alien.width/2, alien.y + alien.height/2);
                    alien.alive = false;
                    aliens[row][col] = null;
                    bulletHit = true;
                    score += 10;
                    scoreDisplay.textContent = `Puntuación: ${score}`;
                    break outerLoop;
                }
            }
        }
        
        if (bulletHit) bullets.splice(i, 1);
    }
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    // Dibujar jugador
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    if (naveImg.complete && naveImg.naturalWidth) {
        ctx.drawImage(naveImg, player.x, player.y, player.width, player.height);
    } else {
        // Fallback si la imagen no está disponible
        ctx.fillStyle = 'green';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // Dibujar balas
    bullets.forEach(bullet => {
        const gradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x + bullet.width, bullet.y + bullet.height);
        gradient.addColorStop(0, 'orange');
        gradient.addColorStop(0.5, 'red');
        gradient.addColorStop(1, 'yellow');
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 5;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    ctx.shadowBlur = 0;

    // Dibujar aliens usando la imagen
    aliens.forEach(row => {
        row.forEach(alien => {
            if (alien && alien.alive) {
                // Verificar si la imagen está cargada correctamente
                if (alienImg.complete && alienImg.naturalWidth) {
                    // Usar la imagen del alien
                    ctx.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);
                } else {
                    // Fallback si la imagen no está disponible
                    ctx.fillStyle = 'yellow';
                    ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
                }
            }
        });
    });
    
    drawExplosions();

    // Mostrar mensajes según estado del juego
    if (gamePaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('JUEGO EN PAUSA', width / 2, height / 2);
    } else if (!gameOver) {
        handlePlayerMovement();
        moveAliens();
        checkCollisions();
        
        // Mover balas
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= 7;
            if (bullets[i].y < 0) bullets.splice(i, 1);
        }
    } else {
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            !aliens.some(row => row.some(alien => alien && alien.alive)) ? 'VICTORIA! Salvamos al mundo humano.' : 'Derrota =(, No hemos conseguido salvar a la humanidad.', 
            width / 2, height / 2
        );
    }
}

function checkGameOver() {
    if (gamePaused) return;
    
    // Victoria - todos los aliens destruidos
    if (aliens.every(row => row.every(alien => alien === null || !alien.alive))) {
        gameOver = true;
        playSound(victorySound);
        if (typeof gameTimer !== 'undefined') gameTimer.finalize();
        return;
    }

    // Derrota - aliens llegan al jugador
    aliens.forEach(row => {
        row.forEach(alien => {
            if (alien && alien.alive && alien.y + alien.height >= player.y) {
                gameOver = true;
                playSound(gameOverSound);
                if (typeof gameTimer !== 'undefined') gameTimer.finalize();
            }
        });
    });
}

function gameLoop() {
    draw();
    if (!gameOver && !gamePaused) checkGameOver();
    requestAnimationFrame(gameLoop);
}

// Iniciar el juego
gameLoop();
