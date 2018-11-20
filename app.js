const five = require("johnny-five");
const Raspi = require("raspi-io");
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const request = require('request');
const fs = require('fs');

const CONFIG = require('./config');

const MICROSECDONDS_PER_CM = 1e6 / 34321;

const board = new five.Board({
    io: new Raspi()
});

board.on("ready", function() {
    const led = new five.Led("GPIO20");
    const motionSensor = new five.Motion("GPIO21");

    // "calibrated" occurs once, at the beginning of a session,
    motionSensor.on("calibrated", function() {
        console.log("calibrated", Date.now());
    });

    // "motionstart" events are fired when the "calibrated"
    // proximal area is disrupted, generally by some form of movement
    motionSensor.on("motionstart", function() {
        console.log("motionstart", Date.now());
    });

    // "motionend" events are fired following a "motionstart" event
    // when no movement has occurred in X ms
    motionSensor.on("motionend", function() {
        console.log("motionend", Date.now());
    });

    motionSensor.on("data", function(data) {
        console.log("data: ", data);
    });
});

// const detectObj = {
//     motion: false,
//     prevTime: null,
//     curTime: null
// }

// streamToCloudServer()
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

//                 if (!detectObj.curTime || (detectObj.curTime - detectObj.prevTime) >= 2000) {
//                     postPicture(filename.trim());
//                     detectObj.prevTime = detectObj.curTime;
//                 }

//                 detectObj.motion = false;
//             })
//         }

//         if (count > 5 && !detectObj.motion) {
//             exec('sudo rm ' + __dirname + '/snapshots/*.png', (err, stdout, stderr) => {
//                 if (err) {
//                     return console.error(err);
//                 }
//             })
//         }


//     });
// }, 200);

// function streamToCloudServer() {
//     exec(
//         "ffmpeg -f v4l2 -framerate 30 -video_size 640x360 " +
//         "-i /dev/video0 -f mpegts -codec:v mpeg1video -b:v 1800k -r 30 " +
//         CONFIG.StreamServerUrl +
//         " -vf fps=1 ./snapshots/snapshot%d.png",
//         (err, stdout, stderr) => {
//             if (err) {
//                 return console.error(err);
//             }
//         }
//     );
// }


// function postPicture(name) {
//     var formData = {
//         image: fs.createReadStream(__dirname + '/snapshots/' + name),
//     };

//     request.post({ url: serverUrl + 'images/add', formData: formData }, function optionalCallback(err, response, body) {

//         if (err) {
//             return console.error(err);
//         }
//         console.log('error:', err); // Print the error if one occurred
//         console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//         console.log(body);

//     });
// }


// detectObj.motion = true;
//                         if (!detectObj.prevTime) {
//                             detectObj.prevTime = new Date();
//                         } else {
//                             detectObj.curTime = new Date();
//                         }