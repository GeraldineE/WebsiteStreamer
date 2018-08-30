const child_process = require('child_process');
var pty = require('node-pty');

var Container = function (hashcode, language) {
    this.hashcode = hashcode; 
    this.language = language; 
};

Container.prototype.isRunning = function() {
    var bash_if = "if [ $(docker inspect -f '{{.State.Running}}' '" + this.hashcode + "-" + this.language +  "') = 'true' ]; then echo yup; else echo nope; fi";
    var response = child_process.execSync(bash_if);

    console.log("response: " + response + (response == "yup"));
    
    return (response == "yup");

};

Container.prototype.run = function(on_data) {

    console.log(this.isRunning());

    if (this.isRunning()) {
        command = "docker attach " + this.hashcode + "-" + this.language + " \n"
    } else {
        command = "docker run --rm --name " + this.hashcode + "-" + this.language + " -v $(pwd)/snippets/" +  hashcode + ":/home/" + hashcode + " -it " + language +  " /bin/bash \n";
    }



    console.log(command);
    const bash = pty.spawn("/bin/bash");

    bash.write(command)
    bash.write("cd /home/" + hashcode + "\n")  
    
    bash.on('data', (data) => {
        on_data(data);
    });

    this.current = bash;
};

module.exports.Container = Container;