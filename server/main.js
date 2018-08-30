var express = require('express'); 
var app = express();
var cors = require('cors');

var server = require('http').Server(app);
var io = require('socket.io')(server, { origins: '*:*'});

app.use(cors());

var child_process_collection = {};
var containers_collection = {};

const fs = require('fs');
const ffmepg_process = require('./ffmepg_process.js');

const pty = require('./pty.js');

server.listen(4000, function() {
	console.log('Servidor corriendo en http://localhost:4000');
});

io.sockets.on('connection', function(socket) {

    socket.on('subscribe', function(data) {

        var hashcode = data["hashcode"]
        var token = data["fb_token"]
        var user_id = data["fb_user_id"]

        this.socket_hashcode = hashcode;
        socket.join(hashcode);
        const child_process = new ffmepg_process.FFMEPG_Process(hashcode, token, user_id);
        child_process_collection[hashcode] = child_process;
        child_process.goLive(function(data){
            console.log("Getting comments for :" + data);
            io.sockets.emit("start_comments_buffering_" + hashcode, data);
        });

    });

    socket.on('stop', function(hashcode) {
        console.log("Stopping : " + hashcode)
        child_process_collection[hashcode].current.kill('SIGINT');
        child_process_collection[hashcode] = null;
    });

    socket.on('update_file', function(data){

        var dir = './snippets/' + hashcode;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 0744);
        }

        hashcode = data["hashcode"];
        title = data["title"];
        content = data["content"];

        var path = "snippets/" + hashcode + "/" + title;
        
        fs.writeFile(path, content, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });

    })
    
    socket.on('broadcast', function(data){
       var hashcode = data["hashcode"]; 
       console.log(data);
       child_process_collection[hashcode].current.stdin.write(data['frame']);
    });

    socket.on('init_pty', function(data) {
        hashcode = data["hashcode"]
        language = data["language"]

        socket.join("container_" + hashcode);

        if (containers_collection[hashcode] == null || containers_collection[hashcode] == undefined) {
            const container = new pty.Container(hashcode, language);
            container.run(function(data){
                io.sockets.emit("container_" + hashcode, data);
            });
            containers_collection[hashcode] = container; 
        }
        
    });

    socket.on('send_data', function(data){
        var hashcode = data["hashcode"]; 
        containers_collection[hashcode].current.write(data['char']);
    });

    socket.on('close', function(hashcode){ 
        console.log("Closing : " + hashcode)

        if (containers_collection[hashcode] != undefined) {
            containers_collection[hashcode].current.write("exit \n");
            containers_collection[hashcode].current.write("exit \n");
            containers_collection[hashcode] = null;
        }
        
    });

    socket.on('rename_file', function(data){
        var hashcode = data["hashcode"];
        var path = "snippets/" + hashcode + "/";

        var previous_path = path + data["previous_name"];
        var new_path = path + data["new_name"];

        fs.rename(previous_path, new_path, (err) => {
            if (err) throw err;
            console.log('Rename complete!');
        });
    });


});

