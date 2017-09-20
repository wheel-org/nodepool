var socket;

var enterBtn = document.getElementById("start-btn");
var nameInput = document.getElementById("name-input");
var createBtn = document.getElementById("create-room");
var consoleTextarea = document.getElementById("log");

var playerStatus = -1; // -1 is NA, 0 is P1, 1 is P2, 2 is spec
var showingGame = false;

enterBtn.onclick = function() {
	var name = nameInput.value;

	socket = io();
	setupSocket();
	socket.emit("start", name);
};

createBtn.onclick = function() {
	socket.emit("createRoom");
};

function shootBall(cueDx, cueDy) { 
	socket.emit("sendShot", cueDx, cueDy);
}

function setupSocket() {
	log("Setting up Connection...");
	socket.on("lobby", function(rooms) {
		$(".lobby").show();
		$(".room").hide();

		// Enter lobby, load rooms
		var startMenu = $(".content");
		startMenu.hide();

		var roomlist = $(".lobby");
		roomlist.show();
		roomlist.html($(createBtn));
		for(var i = 0; i < rooms.length; i++) {
			var room = rooms[i];

			var roomBtn = $(`
				<div class="room-btn">
					<p>ID: ${room.id}</p>
					<p>Players: ${room.numPlayers}</p>
					<p>Spectators: ${room.numSpecs}</p>
				</div>
			`);

			roomBtn.click(function() {
				var id = this.children[0].innerHTML.slice(4);
				socket.emit("joinRoom", id);
			});

			roomlist.append(roomBtn);
		}
	});

	socket.on("joined-player", function(room, newPlayerStatus) {
		loadRoom(room);
		log("Joined as Player " + (newPlayerStatus + 1));
		playerStatus = newPlayerStatus;
		updateState();
	});

	socket.on("joined-spec", function(room, newPlayerStatus) {
		$(".overlay").hide();
		// Start rendering
		log("Joined as Spectator");
		showingGame = true;
		playerStatus = newPlayerStatus;
		updateState();
	});

	// set showingGame to true when starting
	
	socket.on("room-created", function(room) {
		loadRoom(room);
	});

	socket.on("new-player", function(name) {
		loadRoom(room)
	});

	socket.on('sendShot', function (cueDx, cueDy) {
		ballHasBeenShot(cueDx, cueDy);		
	});
}

function loadRoom(room) {
	$(".lobby").hide();
	$(".room").show();

	var playerList = room.players.reduce(function(acc, curr) {
		return "<li>" + curr + "</li>";
	}, "");

	var spectatorList = room.players.reduce(function(acc, curr) {
		return "<li>" + curr + "</li>";
	}, "");

	var startGameBtn = $('<button id="start-game">Start Game</button>');
	var leaveBtn = $('<button id="leave-room">Leave Room</button>');
	startGameBtn.click(function() {
		socket.emit("startGame");
	});

	leaveBtn.click(function() {
		socket.emit("leaveRoom");
	});

	$(".room").html(`
		<p>Id: ${room.id}</p>
		<p>Players</p>
		<ul>${playerList}</ul>
		<p>Spectators</p>
		<ul>${spectatorList}</ul>
	`).append(startGameBtn).append(leaveBtn);
	
}

function log(message) { 
	consoleTextarea.innerHTML += message + "\n";
}

function updateState() {
	$(".playerStatus").html(["You are Player 1", "You are Player 2", "You are Spectating"][playerStatus]);
}