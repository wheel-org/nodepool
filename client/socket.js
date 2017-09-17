var socket;

var enterBtn = document.getElementById("start-btn");
var nameInput = document.getElementById("name-input");
enterBtn.onclick = function() {
	var name = nameInput.value;

	socket = io();
	setupSocket();
	socket.emit("start", name);
};

function setupSocket() {
	socket.on("lobby", function(rooms) {
		// Enter lobby, load rooms
		var startMenu = $(".content");
		startMenu.hide();

		var roomlist = $(".lobby");
		roomlist.show();
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
		$(".lobby").hide();

		var playerList = room.players.reduce(function(acc, curr) {
			return "<li>" + curr + "</li>";
		}, "");

		var spectatorList = room.players.reduce(function(acc, curr) {
			return "<li>" + curr + "</li>";
		}, "");

		$(".room").html(`
			<p>Id: ${room.id}</p>
			<p>Players</p>
			<ul>${playerList}</ul>
			<p>Spectators</p>
			<ul>${spectatorList}</ul>
		`);
		console.log(room);
	});

	socket.on("joined-spec", function(room) {
		$(".overlay").hide();
		// Start rendering
	});
}