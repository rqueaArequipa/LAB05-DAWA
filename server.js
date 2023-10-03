const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const path = require('path');
const AWS = require('aws-sdk');

mongoose.connect('TU_URL_DE_MONGODB_ATLAS', {useNewUrlParser: true, useUnifiedTopology: true});

const mensajeSchema = new mongoose.Schema({
    nombre: String,
    mensaje: String,
    imagenPerfil: String,
    hora: String
});

const Mensaje = mongoose.model('Mensaje', mensajeSchema);

const s3 = new AWS.S3({
    accessKeyId: 'TU_ACCESS_KEY_ID',  // Reemplaza con tu Access Key ID
    secretAccessKey: 'TU_SECRET_ACCESS_KEY',  // Reemplaza con tu Secret Access Key
    region: 'TU_REGION'  // Reemplaza con la región de tu bucket
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname,'index.html'));
});

io.on('connection', async function(socket) {
    console.log('Usuario conectado');

    try {
        const mensajes = await Mensaje.find({});
        socket.emit('mensajes anteriores', mensajes);
    } catch (error) {
        console.error(error);
    }

    socket.on('chat message', async function(data) {
        data.hora = obtenerHoraActual();

        // Sube la imagen a S3
        if (data.imagenPerfil) {
            const params = {
                Bucket: 'NOMBRE_DE_TU_BUCKET',  // Reemplaza con el nombre de tu bucket
                Key: `perfil_${Date.now()}_${data.imagenPerfil.name}`,
                Body: data.imagenPerfil,
                //ACL: 'public-read'  // Esto hace que la imagen sea pública
            };

            try {
                const response = await s3.upload(params).promise();
                data.imagenPerfil = response.Location;
            } catch (error) {
                console.error(error);
                // En caso de error al subir la imagen, puedes manejarlo aquí
            }
        }

        const mensaje = new Mensaje(data);
        await mensaje.save();

        io.emit('chat message', data);
    });

    socket.on('disconnect', function() {
        console.log('Usuario desconectado');
    });
});

http.listen(3000, function(){
    console.log('Servidor escuchando en http://localhost:3000');
});

function obtenerHoraActual() {
    var ahora = new Date();
    var hora = ahora.getHours().toString().padStart(2, '0');
    var minutos = ahora.getMinutes().toString().padStart(2, '0');
    return `${hora}:${minutos}`;
}
