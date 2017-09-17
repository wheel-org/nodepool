var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);

app.use(express.static(__dirname + '/../client'));
var port = process.env.PORT || 5000;
http.listen(port, function() {
	console.log('listening on port ' + port);
});

var MAX_PLAYERS = 2;

var sockets = {};
var rooms = [{
	id: 0,
	players: [1, 2],
	spectators: [1, 2, 3, 4, 5]
}];
/*
room object: {
	id: room id (number)
	players: list of players (max length MAX_PLAYERS)
	spectators: list of spectators (unlimited)
}
*/

io.on('connection', function(socket) {
	var currPlayer = {
		id: socket.id,
		name: "",
		room: -1,
		state: -1 // -1: N/A, 0: lobby, 1: room, 2: game player 1, 3: game player 2, 4: game spectator
	};

	socket.on('start', function(name) {
		console.log("New player: " + name);
		currPlayer.name = name;
		currPlayer.state = 0;
		sockets[currPlayer.id] = socket;


		socket.emit('lobby', getAvailableRooms());
	});

	socket.on('createRoom', function() {
		var roomId = generateRoomId();
		rooms[roomId] = {
			players: [currPlayer.id],
			spectators: []
		};

		currPlayer.state = 1;
		socket.join('room-' + roomId);
		socket.emit('room-created', roomId);
	});

	socket.on('joinRoom', function(roomId) {
		if (rooms[roomId]) {
			if (rooms[roomId].players < MAX_PLAYERS) {
				rooms[roomId].players.push(currPlayer.id);
				socket.emit('joined-player', rooms[roomId]);
			}
			else {
				rooms[roomId].spectators.push(currPlayer.id);
				socket.emit('joined-spec', rooms[roomId]);
			}
		}
		else {
			socket.emit('error', 'Room does not exist');
		}
	});

	socket.on('leaveRoom', function() {
		if (currPlayer.room > -1) {
			socket.leave('room-' + currPlayer.room);
			var index = rooms[currPlayer.room].players.indexOf(currPlayer.id);
			if (index > -1) {
				rooms[currPlayer.room].players.splice(index, 1);
			}
			currPlayer.room = -1;
			socket.emit('lobby', getAvailableRooms());
		}
		else {
			socket.emit('error', 'Player is not in room');
		}
	});

	socket.on('disconnect', function() {
		if (currPlayer.room > -1) {
			socket.leave('room-' + currPlayer.room);
			var index = rooms[currPlayer.room].players.indexOf(currPlayer.id);
			if (index > -1) {
				rooms[currPlayer.room].players.splice(index, 1);
			}
			currPlayer.room = -1;
		}
		delete sockets[currPlayer.id];
	});
});

function generateRoomId() {
	var newId = Math.random() % 1000;
	while (rooms[newId]) newId = Math.random() % 1000;
	return newId;
}

function getAvailableRooms() {
	return rooms.map(function(r) {
		return {
			id: r.id,
			numPlayers: r.players.length,
			numSpecs: r.spectators.length
		}
	});
}