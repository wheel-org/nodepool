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
	spectators: [1, 2, 3, 4, 5],
	turn: -1
},{
	id: 1,
	players: [1],
	spectators: [],
	turn: -1
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
		console.log("Creating room " + roomId + ": " + currPlayer.name);
		rooms[roomId] = {
			id: roomId,
			players: [currPlayer.id],
			spectators: []
		};

		currPlayer.room = roomId;
		currPlayer.state = 1;
		socket.join('room-' + roomId);
		socket.emit('room-created', rooms[roomId]);
	});

	socket.on('joinRoom', function(roomId) {
		console.log("Joining room " + roomId + ": " + currPlayer.name);
		if (rooms[roomId]) {
			currPlayer.room = roomId;
			currPlayer.state = 1;
			if (rooms[roomId].players < MAX_PLAYERS) {
				rooms[roomId].players.push(currPlayer.id);
				var playerStatus = 0; // Player 1
				if (rooms[roomId].players == MAX_PLAYERS) { 
					playerStatus++; // Player 2
				}
				socket.emit('joined-player', rooms[roomId], playerStatus);
			}
			else {
				rooms[roomId].spectators.push(currPlayer.id);
				socket.emit('joined-spec', rooms[roomId], 2);
			}
		}
		else {
			socket.emit('errorMsg', 'Room does not exist');
		}
	});

	socket.on('startGame', function() {
		if (rooms[currPlayer.room].players.length === 2) {
			
		}
		else {
			socket.emit('errorMsg', 'Not enough players in room');
		}
	});

	socket.on('sendShot', function (cueDx, cueDy) {
		for (var i = 0; i < rooms[currPlayer.room].players.length; i++) { 
			// Handle Turn Changing etc
			sockets[rooms[currPlayer.room].players[i]].emit("sendShot", cueDx, cueDy);
		}
		for (var i = 0; i < rooms[currPlayer.room].spectators.length; i++) { 
			sockets[rooms[currPlayer.room].spectators[i]].emit("sendShot", cueDx, cueDy);
		}
	});

	socket.on('leaveRoom', function() {
		console.log("Leaving room " + currPlayer.room + ": " + currPlayer.name);
		if (currPlayer.room > -1) {
			socket.leave('room-' + currPlayer.room);
			var index = rooms[currPlayer.room].players.indexOf(currPlayer.id);
			if (index > -1) {
				rooms[currPlayer.room].players.splice(index, 1);
				if (rooms[currPlayer.room].players.length <= 0) {
					delete rooms[currPlayer.room];
				}
			}
			currPlayer.room = -1;
			socket.emit('lobby', getAvailableRooms());
		}
		else {
			socket.emit('errorMsg', 'Player is not in room');
		}
	});

	socket.on('disconnect', function() {
		console.log("Player disconnect: " + currPlayer.name);
		if (currPlayer.room > -1) {
			socket.leave('room-' + currPlayer.room);
			var index = rooms[currPlayer.room].players.indexOf(currPlayer.id);
			if (index > -1) {
				rooms[currPlayer.room].players.splice(index, 1);
				if (rooms[currPlayer.room].players.length <= 0) {
					delete rooms[currPlayer.room];
				}
			}
			currPlayer.room = -1;
		}
		delete sockets[currPlayer.id];
	});
});

function generateRoomId() {
	var newId = (Math.random() * 1000) | 0;
	while (rooms[newId]) newId = (Math.random() * 1000) | 0;
	return newId;
}

function getAvailableRooms() {
	return rooms.reduce(function(acc, r) {
		acc.push({
			id: r.id,
			numPlayers: r.players.length,
			numSpecs: r.spectators.length
		});
		return acc;
	}, []);
}