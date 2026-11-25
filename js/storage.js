// Guardar información
function guardarDato(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

// Recuperar información
function recuperarDato(clave) {
    const dato = localStorage.getItem(clave);
    return dato ? JSON.parse(dato) : null;
}

// Eliminar información
function eliminarDato(clave) {
    localStorage.removeItem(clave);
}