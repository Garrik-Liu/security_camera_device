const exec = require('child_process').exec;
const five = require('johnny-five');
const Raspi = require('raspi-io');
const request = require('request');
const fs = require('fs');


const serverUrl = "https://home-security-220818.appspot.com/";



const board = new five.Board({
    io: new Raspi()
});

board.on("ready", function() {
    let proximity = new five.Proximity({
        controller: "HCSR04",
        pin: 'P1-29'
    });

    proximity.on("data", function() {
        console.log("Proximity: ");
        console.log("  cm  : ", this.cm);
        console.log("  in  : ", this.in);
        console.log("-----------------");
    });

    proximity.on("change", function() {
        console.log("The obstruction has moved.");
    });

    let dateStr = new Date().toISOString();

    //takePicture(dateStr);
});

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
        console.log(body)
    });
}

function test() {
    request(serverUrl + 'test', function(error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
    });
}