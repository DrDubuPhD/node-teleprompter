// Start using npm run devStart

const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const secret = 'kittens';

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when a client connects
io.on('connection', function (socket) {
    // Event off user submitting the script
    socket.on('remote-pp', function (client_secret) {
        if (client_secret == secret) {
            console.log('Request received');
            socket.broadcast.emit('server-remote-pp');
        }
    });

    socket.on('handshake', function (client_secret) {
        if (client_secret == secret) { // if the secret matches
            socket.emit('access', true);
        } else {
            socket.emit('access', false);
        }
    });

    socket.on('server-change-speed', function (auth_pack) {
        if (auth_pack.client_secret == secret) {
            console.log(auth_pack);
            socket.broadcast.emit('ack-change-speed', auth_pack.newspeed);
        }
    });
});

const PORT = 5500 || process.env.PORT;

server.listen(PORT, function () {
    console.log(`Server listening on port ${PORT}`);
});

// Sean's local ip = 192.168.68.107

