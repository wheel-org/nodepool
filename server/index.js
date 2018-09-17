const express = require('express');
const app = express();
const uuidv4 = require('uuid/v4');
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io').listen(http);

const Room = require('./room');
const Player = require('./player');

const port = process.env.PORT || 5000;
http.listen(port, function() {
    console.log('listening on port ' + port);
});

var MAX_PLAYERS = 2;

const rooms = {};

app.get('/room/*', function(request, result) {
    // TODO(felixguo): This is super arbitrary, probably is a better way
    const id = request.path.split('/')[2];
    if (request.path.endsWith('id.js')) {
        result.type('application/javascript');
        result.send(`var roomId = '${id}';`);
    } else {
        result.sendFile(path.join(__dirname, '/../client/index.html'));
    }
});

app.get('/', function(request, result) {
    // Redirect to a random, non-taken room
    console.log('Redirecting...');
    var id;
    do {
        id = uuidv4();
    } while (id in rooms);
    result.redirect(307, '/room/' + id + '/');
});

app.use('/static', express.static(path.join(__dirname, '/../client')));

const players = {};

io.on('connection', function(socket) {
    console.log('Connected');
    socket.on('server.join', function(data) {
        // Check for Limits here if necessary
        if (!rooms[data.room]) {
            rooms[data.room] = new Room(data.room);
        }
        if (rooms[data.room].isFull()) {
            socket.emit('client.error', { error: 'This room is already full!' });
            return;
        }
        if (rooms[data.room].isNameTaken(data.name)) {
            socket.emit('client.error', { error: 'Name is already taken!' });
            return;
        }
        const player = new Player(socket, data.name, rooms[data.room]);
        rooms[data.room].addPlayer(player);
        socket.emit('client.joinSuccess');
        rooms[data.room].pushSpectatorState();
        players[socket.id] = player;
    });

    socket.on('server.board', function(data) {
        // Do validation!?
        players[socket.id].board = data.board;
        rooms[data.room].pushSpectatorState();
    });

    socket.on('server.sendShot', function(data) {
        rooms[data.room].emitToAll('client.receiveShot', data);
    });

    socket.on('server.start', function(data) {
        if (rooms[data.room].player_one.name == players[socket.id].name) {
            rooms[data.room].startGame();
        }
    });

    socket.on('disconnect', function() {
        if (players[socket.id] !== undefined) {
            removePlayerFromRoom(players[socket.id]);
        }
    });
});

function removePlayerFromRoom(player) {
    const room = player.room;
    room.removePlayer(player);
    if (room.isEmpty()) {
        // Remove room if it's empty
        delete rooms[room.id];
    } else {
        // Notify rest of players someone left (as if they lost)
        room.onPlayerLose();
        room.pushSpectatorState();
    }
}
