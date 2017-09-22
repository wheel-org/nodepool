var socket;

var playerStatus = -1; // -1 is NA, 0 is P1, 1 is P2, 2 is spec
var inGame = false;
var currentTurn = -1;

showWelcome();

$("#startBtn").click(function() {
	var name = $("#nameInput").val();
	socket = io();
	setupSocket();
	socket.emit("server.start", name);
});

$("#createRoom").onclick = function() {
	socket.emit("server.createRoom");
};

$(".startGame").click(function () {
	socket.emit("server.startGame");
});

$(".leaveRoom").click(function () {
	socket.emit("server.leaveRoom");
});

function showOverlay() { 
	inGame = false;
	$(".overlay").show();
}
function hideAll() { 
	$(".lobby").hide();
	$(".room").hide();
	$(".overlay").hide();
	$(".welcome").hide();
}
function showWelcome() { 
	hideAll();
	showOverlay();
	$(".welcome").show();
}
function showLobby() {
	hideAll();
	showOverlay();
	$(".lobby").show();
}
function showRoom() {
	hideAll();
	showOverlay();
	$(".room").show();
}

function shootBall(cueDx, cueDy) { 
	socket.emit("server.sendShot", cueDx, cueDy);
}

function setupSocket() {
	log("Setting up Connection...");
	socket.on("client.lobby", function (rooms) {
		showLobby();
		// Enter lobby, load rooms

		$("#lobbyRoomList").html(`<tr>
			<th>ID</th>
			<th>Players</th>
			<th>Spectators</th>
		</tr>`);
		for(var i = 0; i < rooms.length; i++) {
			var room = rooms[i];

			var roomBtn = $(`
				<tr class="roomBtn" id="${room.id}">
					<td>${room.id}</td>
					<td>${room.numPlayers}</td>
					<td>${room.numSpecs}</td>
				</tr>
			`);

			roomBtn.click(function () {
				socket.emit("server.joinRoom", $(this).attr("id"));
			});

			$("#lobbyRoomList").append(roomBtn);
		}
	});

	socket.on("client.joinedPlayer", function(room, newPlayerStatus) {
		loadRoom(room);
		log("Joined as Player " + (newPlayerStatus + 1));
		playerStatus = newPlayerStatus;
		updateState();
	});

	socket.on("client.joinedSpec", function(room, newPlayerStatus) {
		$(".overlay").hide();
		// Start rendering
		log("Joined as Spectator");
		inGame = true;
		playerStatus = newPlayerStatus;
		updateState();
	});

	// set showingGame to true when starting
	
	socket.on("client.roomCreated", function(room) {
		loadRoom(room);
	});

	socket.on("client.newPlayer", function(name) {
		log("Player joined: " + name);
		loadRoom(room);
	});

	socket.on('client.receiveShot', function (cueDx, cueDy) {
		ballHasBeenShot(cueDx, cueDy);		
	});

	socket.on('client.errorMsg', function (message) {
		alert(message);
	});

	socket.on('client.gameStart', function () {

	});
}

function loadRoom(room) {
	showRoom();
	var playerList = room.players.reduce(function(acc, curr) {
		return "<li>" + curr + "</li>";
	}, "");

	var spectatorList = room.spectators.reduce(function(acc, curr) {
		return "<li>" + curr + "</li>";
	}, "");

	$(".roomInfo").html(`
		<p>Id: ${room.id}</p>
		<p>Players</p>
		<ul>${playerList}</ul>
		<p>Spectators</p>
		<ul>${spectatorList}</ul>
	`);
	
}

function log(message) { 
	$(".log").append(message + "\n");
}

function updateState() {
	$(".playerStatus h4").html(["You are Player 1", "You are Player 2", "You are Spectating"][playerStatus]);
}

function isPlayer() { 
	return playerStatus === 0 || playerStatus === 1;
}

function isSpectator() { 
	return playerStatus === 2;
}