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
		player: -1, // -1: N/A, 0: player 1, 1: player 2, 2: spectator
		state: -1 // -1: N/A, 0: lobby, 1: room, 2: in game
	};

	socket.on('server.start', function(name) {
		console.log("New player: " + name);
		currPlayer.name = name;
		currPlayer.state = 0;
		sockets[currPlayer.id] = socket;

		socket.emit('client.lobby', getAvailableRooms());
	});

	socket.on('server.createRoom', function() {
		var roomId = generateRoomId();
		console.log("Creating room " + roomId + ": " + currPlayer.name);
		rooms[roomId] = {
			id: roomId,
			players: [currPlayer.id],
			spectators: []
		};

		currPlayer.room = roomId;
		currPlayer.state = 1;
		currPlayer.player = 0;
		socket.join('room-' + roomId);
		socket.emit('client.roomCreated', rooms[roomId]);
	});

	socket.on('server.joinRoom', function(roomId) {
		console.log("Joining room " + roomId + ": " + currPlayer.name, rooms[roomId]);
		if (rooms[roomId]) {
			currPlayer.room = roomId;
			currPlayer.state = 1;

			io.to('room-' + roomId).emit('client.newPlayer', currPlayer.name);

			if (rooms[roomId].players < MAX_PLAYERS) {
				currPlayer.player = rooms[roomId].players.length;

				rooms[roomId].players.push(currPlayer.id);
				socket.join('room-' + roomId);
				socket.emit('client.joinedPlayer', rooms[roomId], currPlayer.player);
			}
			else {
				currPlayer.player = 2;
				rooms[roomId].spectators.push(currPlayer.id);
				socket.join('room-' + roomId);
				socket.emit('client.joinedSpec', rooms[roomId], 2);
			}
		}
		else {
			socket.emit('client.errorMsg', 'Room does not exist');
		}
	});

	socket.on('server.startGame', function() {
		if (rooms[currPlayer.room].players.length === MAX_PLAYERS) {
			rooms[currPlayer.room].turn = 0;
			for (var i = 0; i < rooms[currPlayer.room].players.length; i++) {
				rooms[currPlayer.room].players[i].state = 2;
			}
			io.to('room-' + currPlayer.room).emit('client.gameStart');
			io.to('room-' + currPlayer.room).emit('client.newTurn', 0);
		}
		else {
			socket.emit('client.errorMsg', 'Not enough players in room');
		}
	});

	socket.on('sendShot', function (cueDx, cueDy) {
		if (currPlayer.state === 2 && currPlayer.player === rooms[currPlayer.room].turn) {
			runMagicSimulation(function(board) {
				if (rooms[currPlayer.room].turn === 0) {
					rooms[currPlayer.room].turn = 1;
				}
				else {
					rooms[currPlayer.room].turn = 0;
				}
				io.to('room-' + currPlayer.room).emit('client.newTurn', rooms[currPlayer.room].turn);
			});
		}
		else {
			socket.emit('client.errorMsg', 'It is not your turn');
		}
	});

	socket.on('server.leaveRoom', function() {
		console.log("Leaving room " + currPlayer.room + ": " + currPlayer.name);
		if (currPlayer.room > -1) {
			socket.leave('room-' + currPlayer.room);
			playerLeaveRoom(currPlayer);
			socket.emit('client.lobby', getAvailableRooms());
		}
		else {
			socket.emit('client.errorMsg', 'Player is not in room');
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

function playerLeaveRoom(currPlayer) { 
	var playerIndex = rooms[currPlayer.room].players.indexOf(currPlayer.id);
	var spectatorIndex = rooms[currPlayer.room].spectators.indexOf(currPlayer.id);
	if (playerIndex > -1) {
		rooms[currPlayer.room].players.splice(playerIndex, 1);
	}
	else { 
		rooms[currPlayer.room].spectators.splice(spectatorIndex, 1);
	}
	if (rooms[currPlayer.room].players.length +
		rooms[currPlayer.room].spectators.length <= 0) { 
		delete rooms[currPlayer.room];
	}
	currPlayer.room = -1;
}