const Player = require('./player.js');
const initialGame = require('./game.js');

module.exports = class Room {
	static get State() {
		return {
			LOBBY: 'lobby',
			IN_GAME: 'in-game'
		};
	}

	constructor(id) {
		this.id = id;
		this.player_one = undefined;
		this.player_two = undefined;
		this.state = Room.State.LOBBY;
		this.game = initialGame;
	}

	addPlayer(player) {
		if (this.player_one === undefined) {
			this.player_one = player;
			this.game.currentTurn = player_one.name;
			return true;
		}
		else if (this.player_two === undefined) {
			this.player_two = player;
			return true;
		}
		else {
			return false;
		}
	}

	removePlayer(player) {
		if (player.name === this.player_one.name) {
			this.player_one = this.player_two;
			this.player_two = undefined;
		}
		else if (player.name === this.player_two.name) {
			this.player_two = undefined;
		}
		else {
			console.log("This should have never happened!");
		}
	}

	startGame() {
		this.state = Room.State.IN_GAME;
		this.game = initialGame;
		this.game.currentTurn = player_one.name;
		this.emitToAll('client.startGame', this.game);
		this.pushSpectatorState();
	}

	emitToAll(name, message) {
		if (this.player_one !== undefined) {
			this.player_one.socket.emit(name, message);
		}
		if (this.player_two !== undefined) {
			this.player_two.socket.emit(name, message);
		}
	}

	isNameTaken(name) {
		return (this.player_one && this.player_one.name === name) ||
			(this.player_two && this.player_two.name === name);
	}

	isFull() {
		return this.player_one !== undefined &&
			this.player_two !== undefined;
	}
	
	pushSpectatorState() {
		this.emitToAll('client.spectator', this.game);
	}
}