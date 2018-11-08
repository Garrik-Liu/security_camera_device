const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const Gpio = require('onoff').Gpio;
const request = require('request');
const fs = require('fs');

const pir = new Gpio(17, 'in', 'both');

const MICROSECDONDS_PER_CM = 1e6 / 34321;
const serverUrl = "http://35.237.140.171/";


const detectObj = {
    motion: false,
    prevTime: null,
    curTime: null
}

exec(
    "ffmpeg -f v4l2 -framerate 30 -video_size 640x360 " +
    "-i /dev/video0 -f mpegts -codec:v mpeg1video -b:v 1800k -r 30 " +
    "http://35.243.158.28:80/123456 " +
    "-vf fps=1 ./snapshots/snapshot%d.png",
    (err, stdout, stderr) => {
        if (err) {
            return console.error(err);
        }
    }
);

pir.watch(function(err, value) {
    if (err) {
        return console.error(err);
    }
    console.log('movement is detected');
    console.log(value);
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