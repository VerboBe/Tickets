/*Esta funcion saca los tickets guardados en el navegador (localStorage), si no hay nada regresa una lista vacia*/
function obtenerTickets() {
    var guardados = localStorage.getItem("tickets");
    if (guardados === null) {
        return [];
    }
    return JSON.parse(guardados);
}

/*Esta funcion guarda los tickets en el navegador, los convertimos a texto porque localStorage solo guarda texto :0*/
function guardarTickets(tickets) {
    localStorage.setItem("tickets", JSON.stringify(tickets));
}

/*Busca el numero mas chiquito que nadie este usando, empieza en 1 y va subiendo hasta encontrar uno libre*/
function obtenerNumeroDisponible(tickets) {
    var numero = 1;
    var repetido = true;

    /*Mientras el numero este repetido seguimos buscando*/
    while (repetido) {
        repetido = false;

        /*Revisamos ticket por ticket si ya tiene este numero*/
        for (var i = 0; i < tickets.length; i++) {
            if (Number(tickets[i].numero) === numero) {
                repetido = true;
            }
        }

        /*Si estaba repetido probamos con el siguiente*/
        if (repetido) {
            numero++;
        }
    }
    return numero;
}

/*Obtenemos los lugares del html donde pondremos cosas (si una pagina no tiene alguno, valdra null)*/
var formulario = document.getElementById("formulario-ticket");
var listaTickets = document.getElementById("lista-tickets");
var graficaPrioridades = document.getElementById("grafica-prioridades");
var graficaTiempos = document.getElementById("grafica-tiempos");
var graficaEspera = document.getElementById("grafica-espera");



/*Esta funcion arma el html de UNA columna de la grafica de barras, la altura depende de que tan grande es el total contra el maximo*/
function crearColumna(nombre, clase, total, maximo) {
    var altura = (total / maximo) * 100;
    return "<div class='columna-prioridad'>" +
        "<span class='cantidad-columna'>" + total + "</span>" +
        "<div class='pista-columna'>" +
        "<div class='barra-columna " + clase + "' style='height: " + altura + "%'></div>" +
        "</div>" +
        "<span class='etiqueta-columna'>" + nombre + "</span>" +
        "</div>";
}

/*Esta funcion cuenta cuantos tickets prioritarios y normales hay, y los muestra en una grafica de barras*/
function actualizarGraficaPrioridades(tickets) {
    /*Si esta pagina no tiene la grafica, no hacemos nada :v*/
    if (graficaPrioridades === null) {
        return;
    }

    var prioritarios = 0;
    var normales = 0;

    /*Contamos los tickets uno por uno*/
    for (var i = 0; i < tickets.length; i++) {
        if (tickets[i].prioridad === "prioritaria") {
            prioritarios++;
        } else {
            normales++;
        }
    }

    /*El maximo sirve para que la barra mas grande llene la caja (minimo 1 para no dividir entre 0)*/
    var maximo = Math.max(1, prioritarios, normales);

    /*Modificamos el contenedor para que muestre las dos columnas*/
    graficaPrioridades.innerHTML =
        crearColumna("Prioritarios", "prioritarios", prioritarios, maximo) +
        crearColumna("Normales", "normales", normales, maximo);
}



/*Esta funcion suma los minutos estimados de cada tipo de ticket y los muestra en una grafica de pastel*/
function actualizarGraficaTiempos(tickets) {
    if (graficaTiempos === null) {
        return;
    }

    var minutosPrioritarios = 0;
    var minutosNormales = 0;

    /*Sumamos los minutos de cada ticket (el Number es porque el formulario los guarda como texto)*/
    for (var i = 0; i < tickets.length; i++) {
        var minutos = Number(tickets[i].tiempo);
        if (tickets[i].prioridad === "prioritaria") {
            minutosPrioritarios = minutosPrioritarios + minutos;
        } else {
            minutosNormales = minutosNormales + minutos;
        }
    }

    var total = minutosPrioritarios + minutosNormales;

    /*Sacamos que porcentaje del pastel es de los prioritarios (si no hay nada, 0 para no dividir entre 0)*/
    var porcentaje = 0;
    if (total > 0) {
        porcentaje = (minutosPrioritarios / total) * 100;
    }

    /*Si no hay minutos el pastel sale gris, si si hay se pinta con dos colores usando un degradado cónico*/
    var fondo = "#e8edf2";
    if (total > 0) {
        fondo = "conic-gradient(var(--color-prioritaria) 0 " + porcentaje + "%, var(--color-normal) " + porcentaje + "% 100%)";
    }

    /*Creamos el pastel y la leyenda con html, por eso lo llamamos todo junto*/
    graficaTiempos.innerHTML =
        "<div class='pastel-tiempo' role='img' style='background: " + fondo + "'></div>" +
        "<div class='leyenda-pastel'>" +
        "<p class='item-leyenda'><span class='muestra-color prioritarios'></span><span>Prioritarios: " + minutosPrioritarios + " min</span></p>" +
        "<p class='item-leyenda'><span class='muestra-color normales'></span><span>Normales: " + minutosNormales + " min</span></p>" +
        "</div>";
}



/*Esta funcion muestra cuanto tiempo lleva esperando cada ticket.
Antes era una grafica de lineas con SVG (muy dificil de entender), ahora es solo una lista de texto*/
function actualizarGraficaEspera(tickets) {
    if (graficaEspera === null) {
        return;
    }

    /*Si no hay tickets avisamos y nos salimos*/
    if (tickets.length === 0) {
        graficaEspera.innerHTML = "Sin tickets en espera.";
        return;
    }

    var ahora = Date.now(); //La hora de ahora en milisegundos
    var html = "";

    for (var i = 0; i < tickets.length; i++) {
        /*Restamos la hora actual menos la hora en que se registro, y lo pasamos a minutos (1 minuto = 60000 milisegundos)*/
        var minutos = Math.round((ahora - Number(tickets[i].registradoEn)) / 60000);
        if (minutos < 0) {
            minutos = 0;
        }
        html += "<p>Ticket " + tickets[i].numero + " (" + tickets[i].prioridad + "): " + minutos + " min esperando</p>";
    }

    graficaEspera.innerHTML = html;
}

/*Esta funcion llama a las tres graficas de un solo golpe*/
function actualizarGraficas(tickets) {
    actualizarGraficaPrioridades(tickets);
    actualizarGraficaTiempos(tickets);
    actualizarGraficaEspera(tickets);
}



/*Esto solo se ejecuta en la pagina que tiene el formulario (registrar tickets)*/
if (formulario !== null) {
    var campoNumero = document.getElementById("numero-ticket");
    var mensaje = document.getElementById("mensaje-guardado");

    /*Al abrir la pagina ya mostramos el numero de ticket que sigue*/
    campoNumero.value = obtenerNumeroDisponible(obtenerTickets());

    /*Cuando se envia el formulario guardamos el ticket*/
    formulario.addEventListener("submit", function (evento) {
        /*Esto evita que la pagina se recargue sola*/
        evento.preventDefault();

        /*Tomamos los datos del formulario y los tickets que ya existian*/
        var datos = new FormData(formulario);
        var tickets = obtenerTickets();

        /*Insertamos el nuevo ticket en la lista*/
        tickets.push({
            numero: Number(campoNumero.value),
            cliente: datos.get("nombre-cliente"),
            problema: datos.get("tipo-problema"),
            prioridad: datos.get("prioridad"),
            tiempo: datos.get("tiempo-estimado"),
            registradoEn: Date.now()
        });

        /*Guardamos, vaciamos el formulario y ponemos el siguiente numero disponible*/
        guardarTickets(tickets);
        formulario.reset();
        campoNumero.value = obtenerNumeroDisponible(tickets);
        mensaje.textContent = "Ticket guardado.";
    });

    /*El boton para irnos a la pagina donde se atiende a los clientes*/
    document.getElementById("boton-atender-clientes").addEventListener("click", function () {
        window.location.href = "atender.html";
    });
}



/*Esta funcion elimina un ticket por su numero (cuando ya lo atendimos) y vuelve a mostrar la lista*/
function atenderTicket(numero) {
    var tickets = obtenerTickets();
    var restantes = [];

    /*Metemos en restantes a todos los tickets MENOS el que atendimos*/
    for (var i = 0; i < tickets.length; i++) {
        if (String(tickets[i].numero) !== String(numero)) {
            restantes.push(tickets[i]);
        }
    }

    guardarTickets(restantes);
    mostrarLista();
}

/*Esta funcion dibuja la lista de tickets: primero los prioritarios y luego los normales*/
function mostrarLista() {
    var tickets = obtenerTickets();

    /*Actualizamos las graficas con los tickets que quedan*/
    actualizarGraficas(tickets);

    /*Armamos una lista ordenada: primero metemos los prioritarios y despues los normales*/
    var ordenados = [];
    for (var i = 0; i < tickets.length; i++) {
        if (tickets[i].prioridad === "prioritaria") {
            ordenados.push(tickets[i]);
        }
    }
    for (var j = 0; j < tickets.length; j++) {
        if (tickets[j].prioridad === "normal") {
            ordenados.push(tickets[j]);
        }
    }

    /*Vaciamos la lista, y si no hay tickets avisamos*/
    listaTickets.innerHTML = "";
    if (ordenados.length === 0) {
        listaTickets.textContent = "Todavía no hay tickets registrados.";
        return;
    }

    /*Este bucle crea una tarjeta por cada ticket*/
    for (var k = 0; k < ordenados.length; k++) {
        var ticket = ordenados[k];
        var nombrePrioridad = "Normal";
        if (ticket.prioridad === "prioritaria") {
            nombrePrioridad = "Prioritaria";
        }

        /*Creamos la tarjeta del ticket con html*/
        var tarjeta = document.createElement("article");
        tarjeta.className = "ticket";
        tarjeta.innerHTML =
            "<h2>Ticket " + ticket.numero + "</h2>" +
            "<div class='acciones-ticket'>" +
            "<span class='etiqueta-prioridad " + ticket.prioridad + "'>" + nombrePrioridad + "</span>" +
            "<button class='boton-atender-ticket' data-numero='" + ticket.numero + "'>Atender</button>" +
            "</div>" +
            "<p class='detalles-ticket'>Cliente: " + ticket.cliente + "<br>Problema: " + ticket.problema + "<br>Tiempo estimado: " + ticket.tiempo + " minutos</p>";

        listaTickets.appendChild(tarjeta);
    }

    /*Ahora le damos funcion a todos los botones "Atender" que acabamos de crear (ajuas ajuas)*/
    var botones = document.querySelectorAll(".boton-atender-ticket");
    for (var b = 0; b < botones.length; b++) {
        botones[b].addEventListener("click", function () {
            /*this es el boton que se presiono, de ahi sacamos el numero del ticket*/
            atenderTicket(this.getAttribute("data-numero"));
        });
    }
}



/*Esto solo se ejecuta en la pagina que tiene la lista de tickets (atender clientes)*/
if (listaTickets !== null) {
    /*Si algun ticket viejo no tiene fecha de registro, le ponemos la de ahora para que no marque error*/
    var ticketsViejos = obtenerTickets();
    for (var t = 0; t < ticketsViejos.length; t++) {
        if (!ticketsViejos[t].registradoEn) {
            ticketsViejos[t].registradoEn = Date.now();
        }
    }
    guardarTickets(ticketsViejos);

    /*Mostramos la lista por primera vez*/
    mostrarLista();

    /*Cada 60000 milisegundos (1 minuto) actualizamos los tiempos de espera*/
    setInterval(function () {
        actualizarGraficaEspera(obtenerTickets());
    }, 60000);
}

/*Hola amikitos*/ 