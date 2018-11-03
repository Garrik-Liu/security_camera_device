const express = require('express');
const exec = require('child_process').exec;
const five = require('johnny-five');
const Raspi = require('raspi-io');
const request = require('request');
const fs = require('fs');

const serverUrl = "https://home-security-220818.appspot.com";

const app = express();
const board = new five.Board({
    io: new Raspi()
});

board.on("ready", function() {
    let dateStr = new Date().toISOString();
    takePicture(dateStr);
});

app.listen('3000', () => {
    console.log('Device is running on port:3000');
});


function takePicture(name) {
    exec("fswebcam " + __dirname + "/snapshots/" + name + ".png", (err, stdout, stderr) => {
        if (err) {
            return console.error(err);
        }

        console.log('Taking Picture Successful!');

        postPicture(name);
    })

}

function postPicture(name) {
    var formData = {
        // Pass a simple key-value pair
        my_field: name,
        // Pass data via Buffers
        my_buffer: Buffer.from([1, 2, 3]),
        // Pass data via Streams
        my_file: fs.createReadStream(__dirname + '/snapshots/' + name + '.png'),
        // Pass multiple values /w an Array
    };

    request.post({ url: serverUrl + '/images/add', formData: formData }, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error(err);
        }

        console.log('Upload successful!  Server responded with:', body);
    });
}