const child_process = require('child_process');

var FFMEPG_Process = function (hashcode) {
    this.hashcode = hashcode; 
};

FFMEPG_Process.prototype.run = function() {

    rtmpUrl = "rtmp://localhost:4000/" + this.hashcode;

    const ffmpeg = child_process.spawn('ffmpeg', [
        '-f', 'lavfi', '-i', 'anullsrc', 
        '-i', '-', 
        '-shortest', 
        '-vcodec', 'copy', 
        '-acodec', 'aac', 
        '-f', 'flv', 
        rtmpUrl
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