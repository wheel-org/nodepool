var socket;

var enterBtn = document.getElementById("start-btn");
var nameInput = document.getElementById("name-input");
var createBtn = document.getElementById("create-room");

enterBtn.onclick = function() {
	var name = nameInput.value;

	socket = io();
	setupSocket();
	socket.emit("start", name);
};

createBtn.onclick = function() {
	socket.emit("createRoom");
};

function setupSocket() {
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

	socket.on("joined-player", function(room) {
		loadRoom(room);
	});

	socket.on("joined-spec", function(room) {
		$(".overlay").hide();
		// Start rendering
	});

	socket.on("room-created", function(room) {
		loadRoom(room);
	});

	socket.on("new-player", function(name) {
		loadRoom(room)
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