var express = require('express'); 
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var child_process_collection = {};
var containers_collection = {};

const ffmepg_process = require('./ffmepg_process.js');

const pty = require('./pty.js');

server.listen(8080, function() {
	console.log('Servidor corriendo en http://localhost:8080');
});

io.sockets.on('connection', function(socket) {

    socket.on('subscribe', function(hashcode) {
        this.socket_hashcode = hashcode;
        socket.join(hashcode);
        const child_process = new ffmepg_process.FFMEPG_Process(hashcode);
        child_process.run();
        child_process_collection[hashcode] = child_process;
    });

    socket.on('stop', function(hashcode) {
        console.log("Stopping : " + hashcode)
        child_process_collection[hashcode].current.kill('SIGINT');
        child_process_collection[hashcode] = null;
    });
    
    socket.on('broadcast', function(data){
       var hashcode = data["hashcode"]; 
       child_process_collection[hashcode].current.stdin.write(data['frame']);
    });

    socket.on('init_pty', function(data) {
        hashcode = data["hashcode"]
        language = data["language"]

        socket.join("container_" + hashcode);
        const container = new pty.Container(hashcode, language);
        container.run(function(data){
            socket.emit("container_" + hashcode, data);
        });
        containers_collection[hashcode] = container;
    });

    socket.on('send_data', function(data){
        var hashcode = data["hashcode"]; 
        containers_collection[hashcode].current.write(data['char']);
    });

    socket.on('close', function(hashcode){ 
        console.log("Closing : " + hashcode)
        containers_collection[hashcode].current.write("exit \n");
        containers_collection[hashcode].current.write("exit \n");
        containers_collection[hashcode] = null;
    });


});

