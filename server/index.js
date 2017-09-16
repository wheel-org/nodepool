var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);

app.use(express.static(__dirname + '/../client'));
var port = process.env.PORT || 5000;
http.listen(port, function() {
    console.log('listening on port ' + port);
});
