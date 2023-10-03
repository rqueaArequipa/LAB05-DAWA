document.addEventListener('DOMContentLoaded', function() {
    var socket = io();
    var mensajes = document.getElementById('mensajes');
    var mensajeInput = document.getElementById('mensaje');
    var enviarButton = document.getElementById('enviar');
    var nombreInput = document.getElementById('nombre');
    var imagenPerfilInput = document.getElementById('imagenPerfil');
    var imagenPerfilMostrada = document.getElementById('imagenPerfilMostrada');

    enviarButton.addEventListener('click', function() {
        var mensaje = mensajeInput.value;
        var nombre = nombreInput.value;
        var imagenPerfil = imagenPerfilInput.files[0];

        if (mensaje.trim() !== '' && nombre.trim() !== '') {
            socket.emit('chat message', { mensaje, nombre, imagenPerfil });
            mensajeInput.value = '';
        }
    });

    socket.on('chat message', function(data) {
        var mensajeElemento = document.createElement('div');
        mensajeElemento.classList.add('mensaje', data.nombre === nombreInput.value ? 'enviado' : 'recibido');
        mensajeElemento.innerHTML = `
            <div class="avatar">
                <img src="${data.imagenPerfil}" alt="Avatar">
            </div>
            <div class="contenido-mensaje">
                <div class="nombre">${data.nombre}</div>
                <div class="contenido">${data.mensaje}</div>
                <div class="hora">${data.hora}</div>
            </div>
        `;
        mensajes.appendChild(mensajeElemento);
        mensajes.scrollTop = mensajes.scrollHeight;

        if (data.nombre === nombreInput.value && data.imagenPerfil) {
            imagenPerfilMostrada.src = data.imagenPerfil;
        }
    });

    socket.on('mensajes anteriores', function(mensajesAnteriores) {
        mensajesAnteriores.forEach(function(mensaje) {
            var mensajeElemento = document.createElement('div');
            mensajeElemento.classList.add('mensaje', mensaje.nombre === nombreInput.value ? 'enviado' : 'recibido');
            mensajeElemento.innerHTML = `
                <div class="avatar">
                    <img src="${mensaje.imagenPerfil}" alt="Avatar">
                </div>
                <div class="contenido-mensaje">
                    <div class="nombre">${mensaje.nombre}</div>
                    <div class="contenido">${mensaje.mensaje}</div>
                    <div class="hora">${mensaje.hora}</div>
                </div>
            `;
            mensajes.appendChild(mensajeElemento);
        });
        mensajes.scrollTop = mensajes.scrollHeight;
    });

    socket.on('actualizar chat', function() {
        location.reload();
    });

    function obtenerHoraActual() {
        var ahora = new Date();
        var hora = ahora.getHours().toString().padStart(2, '0');
        var minutos = ahora.getMinutes().toString().padStart(2, '0');
        return `${hora}:${minutos}`;
    }
});
