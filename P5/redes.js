// Variables de trabajo
const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');

let redAleatoria;
let nodoOrigen = 0, nodoDestino = 0;
let rutaMinimaConRetardos;
let numNodos = 0;

const conexionesPorNodo = 2; 
const radioNodo = 40; 
const retardoAleatorioNodo = 1000; 
const pesoCanalAleatorio = 100; 

const btnCrearRed = document.getElementById("btnCNet"); 
const btnRutaMinima = document.getElementById("btnMinPath");
const numNodosDisplay = document.getElementById("numNodos");


// Clase para representar un nodo en el grafo
class Nodo {

    constructor(id, x, y, retardo) {
      this.id = id; // Identificador del nodo
      this.x = x; // Coordenada X del nodo
      this.y = y; // Coordenada Y del nodo
      this.retardo = retardo; // Retardo del nodo en milisegundos (renombrado de delay)
      this.conexiones = []; // Array de conexiones a otros nodos
    }
    
    // Método para agregar una conexión desde este nodo a otro nodo con un peso dado
    conectar(nodo, peso) {
      this.conexiones.push({ nodo, peso });
    }

      
    // Método para saber si un nodo está en la lista de conexiones de otro
    estaConectado(idn) { 
        let estaConectado = false;

        this.conexiones.forEach(({ nodo: conexion, peso }) => {      
        if (idn == conexion.id) {
            estaConectado = true;
        }      
    });
    
    return estaConectado;
  }

    // Método para saber la distancia entre dos nodos
    distanciaNodo(nx, ny) { 

        var a = nx - this.x;
        var b = ny - this.y;
            
        return Math.floor(Math.sqrt( a*a + b*b ));
    
    }

      
    // Método para encontrar el nodo más alejado
    nodoMasLejano(nodos) { 

        let distn = 0;
        let cnode = this.id;
        let distaux = 0;
        let pos = 0;
        let npos = 0;

        for (let nodo of nodos) {
        distaux = this.distanciaNodo(nodo.x, nodo.y);
    
        if (distaux != 0 && distaux > distn) {
            distn = distaux;
            cnode = nodo.id;
            npos = pos;
        }

        pos += 1;
        }
    
        return {pos: npos, id: cnode, distance: distn,}; // Mantenemos distance para compatibilidad

    }

     
    // Método para encontrar el nodo más cercano
    nodoMasCercano(nodos) { 

        let nodoLejano = this.nodoMasLejano(nodos);
        let cnode = nodoLejano.id;
        let distn = nodoLejano.distance;
        let distaux = 0;
        let pos = 0;
        let npos = 0;    
    
        for (let nodo of nodos) {
        distaux = this.distanciaNodo(nodo.x, nodo.y);
    
        if (distaux != 0 && distaux <= distn) {
            distn = distaux;
            cnode = nodo.id;
            npos = pos;
        }

        pos += 1;
        }
    
        return {pos:npos, id: cnode, distance: distn,}
  
    }

  
}

// Función para generar una red aleatoria con nodos en diferentes estados de congestión
function crearRedAleatoriaConCongestion(numNodos, numConexiones) {
  
    const nodos = [];
    let x = 0, y = 0, retardo = 0;
    let nodoActual = 0, nodoAleatorio = 0, nodoElegido = 0, peso = 0;
    let espacioB = false;
  
    const xs = Math.floor(canvas.width / numNodos);
    const ys = Math.floor(canvas.height / 2 );
    const xr = canvas.width - radioNodo;
    const yr = canvas.height - radioNodo;
    let xp = radioNodo;
    let yp = radioNodo;
    let xsa = xs;
    let ysa = ys;
  
    for (let i = 0; i < numNodos; i++) {
  
      if (Math.random() < 0.5) {
        yp = radioNodo;
        ysa = ys;
      } 
      else {
        yp = ys;
        ysa = yr;
      }
  
      x = numeroAleatorio(xp, xsa); 
      y = numeroAleatorio(yp, ysa); 
  
      xp = xsa;
      xsa = xsa + xs;
  
      if ( xsa > xr && xsa <= canvas.width ) {
        xsa = xr;
      }
  
      if ( xsa > xr && xsa < canvas.width ) {
        xp = radioNodo;
        xsa = xs;
      }    
  
      retardo = generarRetardo(); 
      nodos.push(new Nodo(i, x, y, retardo)); 
    }
  
  for (let nodo of nodos) {
 
     const arrayClonado = [...nodos];
 
     for (let j = 0; j < numConexiones; j++) {
       let nodoProximo = nodo.nodoMasCercano(arrayClonado);
 
       if (!nodo.estaConectado(nodoProximo.id) && !arrayClonado[nodoProximo.pos].estaConectado(nodo.id)) {
         // Añadimos una nueva conexión
         // Con el nodo más cercano y la distancia a ese nodo como el peso de la conexión
         nodo.conectar(arrayClonado[nodoProximo.pos], nodoProximo.distance);
       }
 
       // Eliminamos el nodo seleccionado del array clonado para evitar que 
       // vuelva a salir elegido con splice.
       // 0 - Inserta en la posición que le indicamos.
       // 1 - Remplaza el elemento, y como no le damos un nuevo elemento se queda vacío.      
       arrayClonado.splice(nodoProximo.pos, 1);
     }
 
   }
  
    return nodos;
    
}

//Generar un número aleatorio dentro de un rango
function numeroAleatorio(min, max) { 
    return Math.floor(Math.random() * (max - min) + min);
}

// Función para generar un retardo aleatorio entre 0 y 1000 ms
function generarRetardo() {
    return Math.random() * retardoAleatorioNodo;
}

// Dibujar la red en el canvas
function dibujarRed(nodos) { 
  nodos.forEach(nodo => {
    nodo.conexiones.forEach(({ nodo: conexion, peso }) => {
      ctx.beginPath();
      ctx.moveTo(nodo.x, nodo.y);
      ctx.lineTo(conexion.x, conexion.y);
      ctx.strokeStyle = '#0066cc'; // Azul para las conexiones
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      pw = "N" + nodo.id + " peso " + peso; 
      const midX = Math.floor((nodo.x + conexion.x)/2);
      const midY = Math.floor((nodo.y + conexion.y)/2);
      ctx.fillText(pw, midX, midY);  

    });
  });

  let descNodo; 

  nodos.forEach(nodo => {
    ctx.beginPath();
    ctx.arc(nodo.x, nodo.y, radioNodo, 0, 2 * Math.PI);
    ctx.fillStyle = nodo.color || '#0066cc'; 
    ctx.fill();
    ctx.strokeStyle = '#003366';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = '12px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    descNodo = "N" + nodo.id + " retardo " + Math.floor(nodo.retardo); 
    ctx.fillText(descNodo, nodo.x, nodo.y + 5);
  });
}

function actualizarNumNodosDisplay() {
numNodosDisplay.textContent = "Número de nodos: " + numNodos;
}

// Función de callback para generar la red de manera aleatoria
btnCrearRed.onclick = () => {

  document.getElementById("mensaje").textContent = "Generando red...";
  document.getElementById("tiempoEnvio").textContent = "Tiempo de envío: " + " ms";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Esperar 5 segundos antes de generar la red
  setTimeout(() => {
    numNodos = 5;
    redAleatoria = crearRedAleatoriaConCongestion(numNodos, conexionesPorNodo);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarRed(redAleatoria);
    document.getElementById("mensaje").textContent = "Red generada correctamente";
    actualizarNumNodosDisplay();
  }, 5000); 
};


btnRutaMinima.onclick = () => {
  if (!redAleatoria) {
      document.getElementById("mensaje").textContent = "Debes generar la red primero";
      mostrarErrorRedNoGenerada();
      return;
  }
  const audio = document.getElementById('audioBoton');
  audio.play();
  const nodoOrigen = redAleatoria[0];
  const nodoDestino = redAleatoria[4];
  
  // Primero, restauramos todos los nodos a su color original
  for (const nodo of redAleatoria) {
      nodo.color = '#0066cc'; // Color azul por defecto
  }
  
  // Obtenemos la ruta mínima usando el algoritmo de Dijkstra
  const rutaMinima = dijkstraConRetardos(redAleatoria, nodoOrigen, nodoDestino);

  let tiempoTotal = 0;
  
  // Coloreamos cada nodo de la ruta mínima
  for (const nodo of rutaMinima) {
      nodo.color = '#00cc44'; // Verde para los nodos de la ruta
      tiempoTotal += nodo.retardo;
  }

  console.log("Ruta mínima:", rutaMinima.map(nodo => nodo.id));
  console.log("Tiempo total de retardo:", tiempoTotal, "ms");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dibujarRed(redAleatoria);

  document.getElementById("tiempoEnvio").textContent = "Tiempo de envío: " + tiempoTotal.toFixed(3) + " ms";
  document.getElementById("mensaje").textContent = "Ruta calculada correctamente";
};

function mostrarErrorRedNoGenerada() {
  const audio = document.getElementById('audioError');
  audio.play();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = '24px Arial';
  ctx.fillStyle = '#FF0000'; // Rojo
  ctx.textAlign = 'center'; 
  ctx.textBaseline = 'bottom'; 
  ctx.fillText('¡Debes generar la red primero!', canvas.width / 2, canvas.height); 

  const img = new Image();
  img.onload = function() {
    const nuevoAncho = img.width * 0.5; 
    const nuevoAlto = img.height * 0.5; 
    const x = (canvas.width - nuevoAncho) / 2;
    const y = (canvas.height - nuevoAlto) / 2;
    ctx.drawImage(img, x, y, nuevoAncho, nuevoAlto);
  };

  img.src = 'error.png'; 
}
