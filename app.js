const five = require("johnny-five");
const Raspi = require("raspi-io");
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const request = require('request');
const fs = require('fs');
var io = require('socket.io-client');

const CONFIG = require('./config');

const MICROSECDONDS_PER_CM = 1e6 / 34321;


const socket = io(CONFIG.ServerUrl);

socket.emit('test', 'Hello')

const board = new five.Board({
    io: new Raspi()
});




board.on("ready", function() {
    // const led = new five.Led("GPIO20");
    // const motionSensor = new five.Motion("GPIO21");

    // const detectObj = {
    //     motion: false,
    //     prevTime: null
    // }

    // motionSensor.on("data", function(data) {
    //     if (data.detectedMotion && !detectObj.motion) {
    //         console.log('A motion is detected')
    //         detectObj.motion = true;
    //         detectObj.prevTime = new Date();
    //     }
    // });

    // let streamProcess = exec(
    //     "ffmpeg -f v4l2 -framerate 30 -video_size 640x360 " +
    //     "-i /dev/video0 -f mpegts -codec:v mpeg1video -b:v 1800k -r 30 " +
    //     CONFIG.StreamServerUrl +
    //     " -vf fps=1 ./snapshots/snapshot%d.png",
    //     (err, stdout, stderr) => {
    //         if (err) {
    //             return console.error(err);
    //         }
    //     }
    // );

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

    // this.on("exit", function() {
    //     streamProcess.kill();
    // });
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