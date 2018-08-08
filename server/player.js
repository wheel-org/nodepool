module.exports = class Player {
	/* Player 1 is always the "admin" and controls when the game starts */
	constructor(socket, name, room) {
		this.socket = socket;
		this.name = name;
		this.room = room;
	}
}