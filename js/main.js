class Pelicula {
    constructor(titulo, genero, vista, reseña, vecesVista) {
        this.titulo = titulo;
        this.genero = genero;
        this.vista = vista;
        this.reseña = reseña;
        this.vecesVista = vecesVista;
    }
}
// ARRAYS Y LOCALSTORAGE

const actores = recuperarDato("actores") || [];
let peliculas = [];
let hayPeliculasGuardadas = false;

const guardadas = localStorage.getItem("peliculas");

if (guardadas !== null) {
    try {
        peliculas = JSON.parse(guardadas);
        hayPeliculasGuardadas = true;
    } catch (error) {
        console.error("No se pudieron recuperar las películas guardadas:", error);
    }
}
if (hayPeliculasGuardadas) {
    peliculas = peliculas.map(pelicula => {

        const { stock, ...datos } = pelicula;

        const vecesVista = Number.isInteger(datos.vecesVista)
            ? Math.max(0, datos.vecesVista)
            : (datos.vista ? 1 : 0);

        return {
            ...datos,
            vecesVista,
            vista: vecesVista > 0
        };
    });

    guardarPeliculas();
}
// ELEMENTOS DEL HTML

const formulario = document.getElementById("formulario-pelicula");
const inputTitulo = document.getElementById("titulo");
const inputGenero = document.getElementById("genero");
const contenedor = document.getElementById("contenedorpeliculas");
const mensaje = document.getElementById("mensaje");

const selectAnimo = document.getElementById("estado-animo");
const botonRecomendar = document.getElementById("boton-recomendar");
const resultadoRecomendacion = document.getElementById("resultado-recomendacion");

const inputBuscar = document.getElementById("buscar-pelicula");
const botonBuscar = document.getElementById("boton-buscar");
const resultadoBusqueda = document.getElementById("resultado-busqueda");
const botonVisualizaciones =
    document.getElementById("boton-visualizaciones");

const resultadoVisualizaciones =
    document.getElementById("resultado-visualizaciones");

const inputActor = document.getElementById("actor-favorito");
const botonActor = document.getElementById("boton-actor");
const listaActores = document.getElementById("lista-actores");

const botonVaciar = document.getElementById("boton-vaciar");
const mensajeVaciar = document.getElementById("mensaje-vaciar");
const botonRecuperar = document.getElementById("boton-recuperar");

const formularioUsuario = document.getElementById("formulario-usuario");
const inputNombre = document.getElementById("nombre-usuario");
const inputAño = document.getElementById("año-nacimiento");
const mensajeBienvenida = document.getElementById("mensaje-bienvenida");

const filtroGenero = document.getElementById("filtro-genero");

const botonCargar = document.getElementById("boton-cargar");
const estadoCarga = document.getElementById("estado-carga");

// GUARDAR PELÍCULAS

function guardarPeliculas() {
    guardarDato("peliculas", peliculas);
    hayPeliculasGuardadas = true;
}

// FETCH 
async function leerCatalogo() {

    const respuesta = await fetch("./db/data.json");

    if (!respuesta.ok) {
        throw new Error("No se pudo leer db/data.json");
    }

    return await respuesta.json();
}

// CARGAR PELÍCULAS DESDE EL JSON

async function cargarPeliculas() {
    try {
        estadoCarga.textContent = "Cargando películas...";
        botonCargar.disabled = true;

        // Si no existen películas guardadas, cargar el JSON
        if (!hayPeliculasGuardadas) {
            const datos = await leerCatalogo();
            peliculas = datos;
            guardarPeliculas();
        }

        renderizarPeliculas();

        estadoCarga.textContent =
            peliculas.length + " películas disponibles";

    } catch (error) {
        console.error("Error al cargar películas:", error);

        estadoCarga.textContent =
            "No se pudo cargar el catálogo original.";

    } finally {
        botonCargar.disabled = false;
    }

}

botonCargar.addEventListener("click", cargarPeliculas);

// MOSTRAR PELÍCULAS

function renderizarPeliculas() {

    contenedor.innerHTML = "";

    const generoSeleccionado = filtroGenero.value;

    const peliculasFiltradas = peliculas.filter(pelicula =>
        generoSeleccionado === "Todos" ||
        pelicula.genero === generoSeleccionado
    );

    peliculasFiltradas.forEach((pelicula, indice) => {

        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-pelicula";

        const titulo = document.createElement("h3");
        titulo.textContent = pelicula.titulo;

        const genero = document.createElement("p");
        genero.textContent = "Género: " + pelicula.genero;

        const veces = document.createElement("p");
        veces.textContent = "Veces vista: " + (pelicula.vecesVista ?? 0);

        const estado = document.createElement("p");
        estado.textContent =
            "Estado: " + (pelicula.vecesVista > 0 ? "Vista" : "No vista");

        const resenaMostrada = document.createElement("p");
        resenaMostrada.textContent =
            "Reseña: " + (pelicula.reseña || "Sin reseña");

        const inputResena = document.createElement("textarea");
        inputResena.id = "resena-input-" + indice;
        inputResena.placeholder = "Escribí tu reseña...";
        inputResena.value = pelicula.reseña || "";

        const botonVista = document.createElement("button");
        botonVista.id = "vista-" + indice;
        botonVista.textContent = "Registrar visualización";

        const botonQuitarVista = document.createElement("button");
        botonQuitarVista.textContent = "Quitar una visualización";
        botonQuitarVista.disabled = (pelicula.vecesVista ?? 0) === 0;

        const botonResena = document.createElement("button");
        botonResena.id = "resena-" + indice;
        botonResena.textContent = "Guardar reseña";
        const botonEditarPelicula = document.createElement("button");
        botonEditarPelicula.textContent = "Editar película";

        const botonEliminar = document.createElement("button");
        botonEliminar.id = "eliminar-" + indice;
        botonEliminar.textContent = "Eliminar";
        botonEliminar.classList.add("boton-eliminar");

        // MARCAR COMO VISTA O NO VISTA
        // REGISTRAR VISUALIZACIÓN
        botonVista.addEventListener("click", function () {

            pelicula.vecesVista += 1;
            pelicula.vista = true;

            guardarPeliculas();
            renderizarPeliculas();
        });

        // QUITAR UNA VISUALIZACIÓN
        botonQuitarVista.addEventListener("click", function () {

            if (pelicula.vecesVista <= 0) return;

            pelicula.vecesVista -= 1;
            pelicula.vista = pelicula.vecesVista > 0;

            guardarPeliculas();
            renderizarPeliculas();
        });

        // GUARDAR RESEÑA

        botonResena.addEventListener("click", function () {

            pelicula.reseña = inputResena.value.trim();

            guardarPeliculas();
            renderizarPeliculas();

        });
        // EDITAR PELÍCULA


        // EDITAR PELÍCULA
        botonEditarPelicula.addEventListener("click", async function () {

            const resultado = await Swal.fire({
                title: "Editar película",
                html: `
                    <input id="editar-titulo" class="swal2-input"
                        placeholder="Título">

                    <select id="editar-genero" class="swal2-select">
                        <option value="Terror">Terror</option>
                        <option value="Comedia">Comedia</option>
                        <option value="Ciencia ficción">Ciencia ficción</option>
                        <option value="Animación">Animación</option>
                        <option value="Drama">Drama</option>
                        <option value="Romance">Romance</option>
                    </select>
                `,

                didOpen: () => {
                    document.getElementById("editar-titulo").value = pelicula.titulo;
                    document.getElementById("editar-genero").value = pelicula.genero;
                },

                showCancelButton: true,
                confirmButtonText: "Guardar cambios",
                cancelButtonText: "Cancelar",

                preConfirm: () => {
                    const titulo = document.getElementById("editar-titulo").value.trim();
                    const genero = document.getElementById("editar-genero").value;

                    if (titulo.length < 2) {
                        Swal.showValidationMessage("Ingresá un título válido.");
                        return false;
                    }

                    const repetida = peliculas.some(otra =>
                        otra !== pelicula &&
                        otra.titulo.toLowerCase() === titulo.toLowerCase()
                    );

                    if (repetida) {
                        Swal.showValidationMessage("Esa película ya existe.");
                        return false;
                    }

                    return { titulo, genero };
                }
            });

            if (!resultado.isConfirmed) return;

            pelicula.titulo = resultado.value.titulo;
            pelicula.genero = resultado.value.genero;

            guardarPeliculas();
            renderizarPeliculas();
        });


        // ELIMINAR PELÍCULA

        botonEliminar.addEventListener("click", function () {

            peliculas = peliculas.filter(
                peli => peli !== pelicula
            );

            guardarPeliculas();
            renderizarPeliculas();

        });

        tarjeta.appendChild(titulo);
        tarjeta.appendChild(genero);
        tarjeta.appendChild(veces);
        tarjeta.appendChild(estado);
        tarjeta.appendChild(resenaMostrada);
        tarjeta.appendChild(inputResena);
        tarjeta.appendChild(botonVista);
        tarjeta.appendChild(botonQuitarVista);
        tarjeta.appendChild(botonResena);
        tarjeta.appendChild(botonEditarPelicula);
        tarjeta.appendChild(botonEliminar);

        contenedor.appendChild(tarjeta);

    });
}

filtroGenero.addEventListener("change", renderizarPeliculas);

// AGREGAR PELÍCULA CON CONSTRUCTOR

formulario.addEventListener("submit", function (event) {

    event.preventDefault();

    const titulo = inputTitulo.value.trim();
    const genero = inputGenero.value;

    if (titulo.length < 2) {
        mensaje.textContent =
            "Ingresá un título de al menos dos caracteres.";
        return;
    }

    if (genero === "") {
        mensaje.textContent = "Seleccioná un género.";
        return;
    }

    const existente = peliculas.find(pelicula =>
        pelicula.titulo.toLowerCase() === titulo.toLowerCase()
    );

    if (existente) {
        mensaje.textContent = "Esta película ya está en tu diario.";
        return;
    }

    // NEW PELICULA

    const nuevaPelicula = new Pelicula(
        titulo,
        genero,
        false,
        "",
        0
    );

    peliculas.push(nuevaPelicula);

    filtroGenero.value = "Todos";

    guardarPeliculas();
    renderizarPeliculas();

    mensaje.textContent = "";
    formulario.reset();

    Swal.fire({
        title: "¡Película agregada!",
        text: "La película se guardó correctamente.",
        icon: "success"
    });

});

// VACIAR DIARIO

function vaciarDiario() {

    Swal.fire({
        title: "¿Querés vaciar tu diario?",
        text: "Se eliminarán las películas de tu colección.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, vaciar",
        cancelButtonText: "Cancelar"

    }).then(resultado => {

        if (resultado.isConfirmed) {

            peliculas = [];

            guardarPeliculas();
            renderizarPeliculas();

            mensajeVaciar.textContent =
                "Tu diario fue vaciado correctamente.";

        }

    });
}

botonVaciar.addEventListener("click", vaciarDiario);

// RECUPERAR PELÍCULAS DESDE EL JSON

async function recuperarDiario() {

    const resultado = await Swal.fire({
        title: "¿Querés recuperar las películas originales?",
        text: "Se reemplazará tu colección actual.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, recuperar",
        cancelButtonText: "Cancelar"
    });

    if (!resultado.isConfirmed) {
        return;
    }

    try {

        const datos = await leerCatalogo();

        peliculas = datos;

        filtroGenero.value = "Todos";

        guardarPeliculas();
        renderizarPeliculas();

        mensajeVaciar.textContent =
            "¡Diario recuperado correctamente!";

        Swal.fire({
            title: "¡Diario recuperado!",
            text: peliculas.length + " películas restauradas.",
            icon: "success"
        });

    } catch (error) {

        console.error(error);

        Swal.fire({
            title: "Error al recuperar",
            text: "Revisá que db/data.json exista y usá Live Server.",
            icon: "error"
        });

    }
}

botonRecuperar.addEventListener("click", recuperarDiario);

// REINICIAR DATOS DE LA APLICACIÓN

const botonReiniciar = document.getElementById("boton-reiniciar");

botonReiniciar.addEventListener("click", async function () {

    const resultado = await Swal.fire({
        title: "¿Reiniciar Film Journal?",
        text: "Se borrarán tus películas, actores y datos personales.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, reiniciar",
        cancelButtonText: "Cancelar"
    });

    if (resultado.isConfirmed) {

        eliminarDato("peliculas");
        eliminarDato("actores");
        eliminarDato("nombre");
        eliminarDato("añoNacimiento");

        peliculas = [];
        actores.length = 0;
        hayPeliculasGuardadas = false;

        renderizarPeliculas();
        renderizarActores();

        formularioUsuario.reset();
        mensajeBienvenida.textContent = "";
        mensajeVaciar.textContent = "Datos eliminados correctamente.";

        Swal.fire({
            title: "Aplicación reiniciada",
            text: "Tus datos fueron eliminados.",
            icon: "success"
        });
    }
});
// BUSCAR PELÍCULA

function consultar() {

    const buscar = inputBuscar.value.trim().toLowerCase();

    if (buscar === "") {
        resultadoBusqueda.textContent = "Ingresá una película.";
        return;
    }

    const pelicula = peliculas.find(
        peli => peli.titulo.toLowerCase() === buscar
    );

    if (pelicula) {

        resultadoBusqueda.innerHTML = "";

        const titulo = document.createElement("h3");
        titulo.textContent = pelicula.titulo;

        const detalle = document.createElement("p");

        detalle.textContent =
            "Género: " + pelicula.genero +
            " | Veces vista: " + pelicula.vecesVista +
            " | Estado: " + (pelicula.vista ? "Vista" : "No vista") +
            " | Reseña: " + (pelicula.reseña || "Sin reseña");

        resultadoBusqueda.appendChild(titulo);
        resultadoBusqueda.appendChild(detalle);

    } else {

        resultadoBusqueda.textContent =
            "No encontramos esa película.";

    }
}

botonBuscar.addEventListener("click", consultar);

// FUNCION DE BOTON VISUALIZACIONES

function calcularTotalVisualizaciones() {

    const total = peliculas.reduce(
        (acumulado, pelicula) =>
            acumulado + pelicula.vecesVista,
        0
    );

    resultadoVisualizaciones.textContent =
        "Total de visualizaciones: " + total;
}

botonVisualizaciones.addEventListener(
    "click",
    calcularTotalVisualizaciones
);

// RECOMENDAR POR ESTADO DE ÁNIMO

function recomendarPorEstadoDeAnimo() {

    const genero = selectAnimo.value;

    const recomendadas = peliculas.filter(
        ({ genero: generoPelicula }) => generoPelicula === genero
    );

    const titulos = [];

    recomendadas.forEach(pelicula => {
        titulos.push(pelicula.titulo);
    });

    resultadoRecomendacion.textContent =
        recomendadas.length > 0
            ? "Te recomendamos: " + titulos.join(", ")
            : "No tenemos películas de ese género.";

}

botonRecomendar.addEventListener(
    "click",
    recomendarPorEstadoDeAnimo
);

// MOSTRAR, EDITAR Y ELIMINAR ACTORES

function renderizarActores() {

    listaActores.innerHTML = "";

    actores.forEach((actor, indice) => {

        const li = document.createElement("li");

        const nombreActor = document.createElement("span");
        nombreActor.textContent = actor;

        const botonEditar = document.createElement("button");
        botonEditar.id = "editar-actor-" + indice;
        botonEditar.textContent = "Editar";

        const botonEliminar = document.createElement("button");
        botonEliminar.id = "eliminar-actor-" + indice;
        botonEliminar.textContent = "Eliminar";

        // ELIMINAR ACTOR

        botonEliminar.addEventListener("click", function () {

            actores.splice(indice, 1);

            guardarDato("actores", actores);

            renderizarActores();

        });

        // EDITAR ACTOR

        botonEditar.addEventListener("click", function () {

            const inputEditar = document.createElement("input");
            inputEditar.type = "text";
            inputEditar.value = actor;

            const botonGuardar = document.createElement("button");
            botonGuardar.textContent = "Guardar";

            li.innerHTML = "";

            li.appendChild(inputEditar);
            li.appendChild(botonGuardar);

            botonGuardar.addEventListener("click", function () {

                const nuevoNombre = inputEditar.value.trim();

                if (
                    nuevoNombre === "" ||
                    !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]+$/.test(nuevoNombre)
                ) {
                    inputEditar.value = "";
                    inputEditar.placeholder = "Ingresá un nombre válido";
                    return;
                }

                actores[indice] = nuevoNombre;

                guardarDato("actores", actores);

                renderizarActores();

            });

        });

        li.appendChild(nombreActor);
        li.appendChild(botonEditar);
        li.appendChild(botonEliminar);

        listaActores.appendChild(li);

    });

}

// AGREGAR ACTOR FAVORITO

function actorFavorito() {

    const actor = inputActor.value.trim();

    if (
        actor === "" ||
        !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]+$/.test(actor)
    ) {
        inputActor.value = "";
        inputActor.placeholder = "Ingresá un nombre válido";
        return;
    }

    actores.push(actor);

    guardarDato("actores", actores);

    renderizarActores();

    inputActor.value = "";

}

botonActor.addEventListener("click", actorFavorito);

// FORMULARIO DE USUARIO

formularioUsuario.addEventListener("submit", function (event) {

    event.preventDefault();

    const nombre = inputNombre.value.trim();
    const añoTexto = inputAño.value.trim();
    const añoNacimiento = Number(añoTexto);

    if (
        nombre === "" ||
        !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(nombre)
    ) {
        mensajeBienvenida.textContent =
            "Ingresá un nombre válido, sin números.";
        return;
    }

    if (
        añoTexto.length !== 4 ||
        isNaN(añoNacimiento) ||
        añoNacimiento < 1900 ||
        añoNacimiento > new Date().getFullYear()
    ) {
        mensajeBienvenida.textContent =
            "Ingresá un año de nacimiento válido.";
        return;
    }

    mensajeBienvenida.textContent =
        "¡Bienvenido a Film Journal, " + nombre + "!";

    localStorage.setItem("nombre", nombre);
    localStorage.setItem("añoNacimiento", añoNacimiento);

});

const nombreGuardado = localStorage.getItem("nombre");

if (nombreGuardado !== null) {
    mensajeBienvenida.textContent =
        "¡Bienvenido nuevamente, " + nombreGuardado + "!";
}

// TEMPORIZADOR 

setTimeout(() => {

    document.getElementById("recordatorio").textContent =
        "¡No olvides registrar las películas que viste!";

}, 3000);

// INICIAR SIMULADOR

renderizarActores();
renderizarPeliculas();
cargarPeliculas();