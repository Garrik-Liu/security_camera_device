const exec = require('child_process').exec;
const five = require('johnny-five');
const Raspi = require('raspi-io');
const Gpio = require('pigpio').Gpio;
const request = require('request');
const fs = require('fs');

const MICROSECDONDS_PER_CM = 1e6 / 34321;
const serverUrl = "https://home-security-220818.appspot.com/";

const trigger = new Gpio(23, { mode: Gpio.OUTPUT });
const echo = new Gpio(24, { mode: Gpio.INPUT, alert: true });

trigger.digitalWrite(0); // Make sure trigger is low

const watchHCSR04 = () => {
    let startTick;
    let initialDistance;

    echo.on('alert', (level, tick) => {
        if (level == 1) {
            startTick = tick;
        } else {
            const endTick = tick;
            const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
            const distance = diff / 2 / MICROSECDONDS_PER_CM;

            if (distance > 1) {
                console.log(distance + 'cm');

                if (!initialDistance) {
                    initialDistance = distance;
                } else {
                    let diff = Math.abs(distance - initialDistance);

                    if (diff > 5) {
                        let dateStr = new Date().toISOString();
                        takePicture(dateStr);
                    }
                }
            }
        }
    });
};

watchHCSR04();

setInterval(() => {
    trigger.trigger(10, 1); // Set trigger high for 10 microseconds
}, 200);

function takePicture(name) {
    exec("fswebcam " + __dirname + "/snapshots/" + name + ".png", (err, stdout, stderr) => {
        if (err) {
            return console.error(err);
        }
        console.log('Taking Picture Successful!');
        postPicture(name)
    })

}

function postPicture(name) {
    var formData = {
        image: fs.createReadStream(__dirname + '/snapshots/' + name + '.png'),
    };
    console.log(serverUrl + 'images/add');
    request.post({ url: serverUrl + 'images/add', formData: formData }, function optionalCallback(err, response, body) {
        if (err) {
            return console.error(err);
        }

        console.log('error:', err); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log(body);

        exec("rm -f " + __dirname + "/snapshots/" + name + ".png", (err, stdout, stderr) => {
            if (err) {
                return console.error(err);
            }
        })
    });
}