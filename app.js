const exec = require('child_process').exec;
const five = require('johnny-five');
const Raspi = require('raspi-io');
const request = require('request');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');

const serverUrl = "https://home-security-220818.appspot.com/";

// var projectId = 'home-security-220818';
// var cloudRegion = 'us-central1';
// var registryId = 'Pi3-Security_Camera';
// var deviceId = 'Pi3-Security_Camera';

// var mqttHost = 'mqtt.googleapis.com';
// var mqttPort = 8883;
// var privateKeyFile = './certs/rsa_private.pem';
// var algorithm = 'RS256';
// var messageType = 'state'; // or event 

// var mqttClientId = 'projects/' + projectId + '/locations/' + cloudRegion + '/registries/' + registryId + '/devices/' + deviceId;
// var mqttTopic = '/devices/' + deviceId + '/' + messageType;

// var connectionArgs = {
//     host: mqttHost,
//     port: mqttPort,
//     clientId: mqttClientId,
//     username: 'unused',
//     password: createJwt(projectId, privateKeyFile, algorithm),
//     protocol: 'mqtts',
//     secureProtocol: 'TLSv1_2_method'
// };

// console.log('connecting...');
// var client = mqtt.connect(connectionArgs);

// // Subscribe to the /devices/{device-id}/config topic to receive config updates. 
// client.subscribe('/devices/' + deviceId + '/config');

// client.on('connect', function(success) {
//     if (success) {
//         console.log('Client connected...');
//         client.publish(mqttTopic, { 'message': 'hello' }, { qos: 1 });
//     } else {
//         console.log('Client not connected...');
//     }
// });

// client.on('close', function() {
//     console.log('close');
// });

// client.on('error', function(err) {
//     console.log('error', err);
// });

// function createJwt(projectId, privateKeyFile, algorithm) {
//     var token = {
//         'iat': parseInt(Date.now() / 1000),
//         'exp': parseInt(Date.now() / 1000) + 86400 * 60, // 1 day 
//         'aud': projectId
//     };
//     var privateKey = fs.readFileSync(privateKeyFile);
//     return jwt.sign(token, privateKey, {
//         algorithm: algorithm
//     });
// }


const board = new five.Board({
    io: new Raspi()
});

board.on("ready", function() {
    let dateStr = new Date().toISOString();
    //takePicture(dateStr);
    test();
});

function takePicture(name) {
    exec("fswebcam " + __dirname + "/snapshots/" + name + ".png", (err, stdout, stderr) => {
        if (err) {
            return console.error(err);
        }
        postPicture(name)
        console.log('Taking Picture Successful!');

    })

}

function postPicture(name) {
    var formData = {
        // Pass a simple key-value pair
        my_field: 'image',
        // Pass data via Buffers
        my_buffer: Buffer.from([1, 2, 3]),
        // Pass data via Streams
        my_file: fs.createReadStream(__dirname + '/snapshots/' + name + '.png'),
        // Pass multiple values /w an Array
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