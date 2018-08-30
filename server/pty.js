const child_process = require('child_process');
var pty = require('node-pty');

var Container = function (hashcode, language) {
    this.hashcode = hashcode; 
    this.language = language; 
};

Container.prototype.run = function(on_data) {
    command = "docker run --rm --name " + hashcode + " -v ./snippets/" +  hashcode + ":/" + hashcode + " -it " + language +  " /bin/bash \n";
    console.log(command);
    const bash = pty.spawn("/bin/bash");

    bash.write(command)
    bash.write("cd " + hashcode + "\n")
    bash.write("clear \n")

    bash.on('data', (data) => {
        on_data(data);
    });

    this.current = bash;
};

module.exports.Container = Container;