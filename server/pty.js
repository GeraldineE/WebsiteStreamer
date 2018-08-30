const child_process = require('child_process');
var pty = require('node-pty');

var Container = function (hashcode, language) {
    this.hashcode = hashcode; 
    this.language = language; 
};

Container.prototype.isRunning = function() {
    var bash_if = "if [ $(docker inspect -f '{{.State.Running}}' '3sPSaZq6-language') = 'true' ]; then echo yup; else echo nope; fi";
    const child_process = require('child_process');
    var response = child_process.execSync(bash_if);

    console.log("status: " + response.toString());
    return response.toString() == 'yup';
};

Container.prototype.run = function(on_data) {

    if (this.isRunning()) {
        command = "docker run --rm --name " + hashcode + "-" + language + " -v $(pwd)/snippets/" +  hashcode + ":/home/" + hashcode + " -it " + language +  " /bin/bash \n";
    } else {
        command = "docker attach " + hashcode + "-" + language + " \n"
    }

    console.log(command);
    const bash = pty.spawn("/bin/bash");

    bash.write(command)
    bash.write("cd /home/" + hashcode + "\n")
    bash.write("clear \n")
    

    bash.on('data', (data) => {
        on_data(data);
    });

    this.current = bash;
};

module.exports.Container = Container;