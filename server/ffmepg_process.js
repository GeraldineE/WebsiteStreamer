const child_process = require('child_process');
var request = require('request');
var EventSource = require('eventsource');

var FFMEPG_Process = function (hashcode, token, user_id) {
    this.hashcode = hashcode; 
    this.token = token;
    this.user_id = user_id;
}; 

FFMEPG_Process.prototype.goLive = function(onlive) {
    var app_id = "432596000483437";
    var go_live_uri = "https://graph.facebook.com/" + this.user_id + "/live_videos?privacy={'value':'SELF'}";
    var self = this;

    console.log(go_live_uri);

    console.log("using token: " + this.token);

    request.post({
        url: go_live_uri,
        form: {
            access_token: this.token,
            status: 'LIVE_NOW'
        },
        json: true
    }, function optionalCallback(err, httpResponse, body){

        if (err) {
            return console.error('post failed:', err);
        }

        console.log("httpResponse " + httpResponse);
        console.log("body " + body);
        console.log("Stream ID " + body.id);

        self.stream_id = body.id;
        self.stream_url = body.stream_url;
        self.secure_stream_url = body.secure_stream_url;

        self.run(self.stream_url);     

        onlive(body.id);   

    });

    
         
    
};

FFMEPG_Process.prototype.run = function(uri) {

    console.log(uri);

    const ffmpeg = child_process.spawn('ffmpeg', [
        '-f', 'lavfi', '-i', 'anullsrc', 
        '-i', '-', 
        '-shortest', 
        '-vcodec', 'copy', 
        '-acodec', 'aac', 
        '-f', 'flv', 
        uri
    ]);

    ffmpeg.on('close', (code, signal) => {
        console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal); 
    });

    ffmpeg.stdin.on('error', (e) => {
        console.log('FFmpeg STDIN Error', e);
    });

    ffmpeg.stderr.on('data', (data) => {
        console.log('FFmpeg STDERR:', data.toString());
    });

    this.current = ffmpeg;
};


module.exports.FFMEPG_Process = FFMEPG_Process;