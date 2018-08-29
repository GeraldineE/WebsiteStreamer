var express = require('express'); 
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var child_process_collection = {};

const ffmepg_process = require('./ffmepg_process.js');

server.listen(8080, function() {
	console.log('Servidor corriendo en http://localhost:8080');
});

io.sockets.on('connection', function(socket) {

    socket.on('subscribe', function(hashcode) {
        socket.join(hashcode);
        const child_process = new ffmepg_process.FFMEPG_Process(hashcode);
        child_process.run();
        child_process_collection[hashcode] = child_process;
    });
    
    socket.on('broadcast', function(data){
       var hashcode = data["hashcode"]; 
       child_process_collection[hashcode].current.stdin.write(data['frame']);
    });

});

