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
		console.log(rooms);
	});
}