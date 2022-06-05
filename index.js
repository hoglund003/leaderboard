const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');

const players_path = './players.json';

const { fstat } = require('fs');
var players = fs.readFileSync(players_path);

app.use(express.static(path.join(__dirname, 'public')));

function sendData(data) {
    try {
        data = JSON.parse(data);
        data.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        console.log(data);
        io.emit('update', data);
    } catch {
        console.log('no go');
    }
}

app.get('/', (req, res) => {
    players.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', (socket) => {

    fs.readFile(players_path, (err, data) => {
        if (err) throw err;
        sendData(data);
    });

    fs.watch(players_path, (event, filename) => {
        if (event == 'change') {
            // On change
            fs.readFile(players_path, (err, data) => {
                sendData(data)
            });
        }
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
