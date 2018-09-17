var socket;
var inGame = false;

showWelcome();

function emit(endpoint, data) {
    if (!data) data = {};
    console.log('Emitting ' + endpoint);
    data.room = roomId;
    socket.emit(endpoint, data);
}

$('#startBtn').click(function() {
    var name = $('#nameInput').val();
    socket = io();
    setupSocket();
    emit('server.join', { name: name });
});

$('.startGame').click(function() {
    socket.emit('server.startGame');
});

$('.leaveRoom').click(function() {
    socket.emit('server.leaveRoom');
});

function hideAll() {
    $('.overlay').hide();
    $('.welcome').hide();
}

function showWelcome() {
    $('.overlay').show();
    $('.welcome').show();
}

function shootBall(cueDx, cueDy) {
    emit('server.sendShot', { cueDx: cueDx, cueDy: cueDy });
}

function setupSocket() {
    log('Setting up Connection...');

    socket.on('client.joinSuccess', function() {
        hideAll();
        inGame = true;
    });

    // set showingGame to true when starting

    socket.on('client.roomCreated', function(room) {
        loadRoom(room);
    });

    socket.on('client.newPlayer', function(name) {
        log('Player joined: ' + name);
        loadRoom(room);
    });

    socket.on('client.receiveShot', function(data) {
        ballHasBeenShot(data.cueDx, data.cueDy);
    });

    socket.on('client.error', function(data) {
        alert(data.error);
    });

    socket.on('client.gameStart', function() {});

    socket.on('client.spectator', function(_game) {
        game = _game;
    });
}

function log(message) {
    $('.log').append(message + '\n');
}

function isPlayer() {
    return true;
}
