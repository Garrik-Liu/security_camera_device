const five = require("johnny-five");
const Raspi = require("raspi-io");
const exec = require('child_process').exec;
const execFile = require('child_process').execFile;
const spawn = require('child_process').spawn;
const request = require('request');
const fs = require('fs');
const io = require('socket.io-client');

const CONFIG = require('./config');
const socket = io(CONFIG.ServerUrl);

let cameraInfo = {
    id: undefined,
    name: undefined,
    status: 'off'
}

const board = new five.Board({
    io: new Raspi()
});

board.on("ready", function() {
    const led = new five.Led("GPIO20");
    const motionSensor = new five.Motion("GPIO21");

    const detectObj = {
        motion: false,
        prevTime: null
    }

    let streamProcess = null;

    motionSensor.on("data", function(data) {
        if (data.detectedMotion && !detectObj.motion) {
            console.log('A motion is detected')
            detectObj.motion = true;
            detectObj.prevTime = new Date();
        }
    });

    // setInterval(() => {
    //     exec('ls ' + __dirname + '/snapshots -l | grep "^-" | wc -l', (err, stdout, stderr) => {
    //         if (err) {
    //             return console.error(err);
    //         }

    //         let count = Number(stdout);

    //         if (detectObj.motion) {

    //             exec('ls -Art ' + __dirname + '/snapshots | tail -n 1', (err, stdout, stderr) => {
    //                 if (err) {
    //                     return console.error(err);
    //                 }

    //                 let filename = stdout;

    //                 if ((new Date() - detectObj.prevTime) >= CONFIG.Interval) {
    //                     postPicture(filename.trim());
    //                     detectObj.motion = false;
    //                 }
    //             })
    //         }

    //         if ((count > 5 && !detectObj.motion) || count > 10) {
    //             console.log('delete snapshots')
    //             exec('sudo rm ' + __dirname + '/snapshots/*.png', (err, stdout, stderr) => {
    //                 if (err) {
    //                     return console.error(err);
    //                 }
    //             })
    //         }
    //     });
    // }, 200);

    this.on("exit", function() {
        streamProcess.kill();
    });
});

socket.on('turnOn camera', function() {
    console.log('turn on');
    if (cameraInfo.status === 'off') {
        streamProcess = exec(
            "ffmpeg -f v4l2 -framerate 30 -video_size 640x360 " +
            "-i /dev/video0 -f mpegts -codec:v mpeg1video -b:v 1800k -r 30 " +
            CONFIG.StreamServerUrl,

            // +
            // " -vf fps=1 ./snapshots/snapshot%d.png",
            (err, stdout, stderr) => {
                if (err) {
                    return console.error(err);
                }
            }
        );

        cameraInfo.status = 'on';
        socket.emit('device status change', 'on')
    }
});

socket.on('turnOff camera', function() {
    console.log('turn off');
    if (cameraInfo.status === 'on') {
        streamProcess.kill();

        cameraInfo.status = 'off';
        socket.emit('change device status', 'off')
    }
});

function postPicture(name) {
    var formData = {
        image: fs.createReadStream(__dirname + '/snapshots/' + name),
    };

    request.post({ url: CONFIG.ServerUrl + 'images/add', formData: formData }, function optionalCallback(err, response, body) {

        if (err) {
            return console.error(err);
        }
        console.log('error:', err); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log(body);

    });
}