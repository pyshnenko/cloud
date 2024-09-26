"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketSendResult = exports.socketSend = void 0;
var WebSocketClient = require('websocket').client;
var socketPort = '8080/';
var socketConnect = false;
var socket;
var started = false;
var client = new WebSocketClient();
client.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
    socketConnect = false;
    setTimeout(function () {
        console.log('reconnect');
        client.connect('wss://spamigor.ru:' + socketPort, 'echo-protocol');
    }, 10 * 1000);
});
client.on('connect', function (connection) {
    socketConnect = true;
    started = true;
    console.log('WebSocket Client Connected');
    connection.on('error', function (error) {
        socketConnect = false;
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function () {
        socketConnect = false;
        console.log('echo-protocol Connection Closed');
        setTimeout(function () {
            console.log('reconnect');
            client.connect('wss://spamigor.ru:' + socketPort, 'echo-protocol');
        }, 10 * 1000);
    });
    connection.on('message', function (message) {
        socketConnect = true;
        if (message.type === 'utf8') {
            /*if (message.utf8Data === 'reboot') {
                console.log('\x1b[31mREBOOT\x1b[0m');
                needReb = true;
                bot.telegram.sendMessage(admin[0], 'REBOOT');
            }
            if (message.utf8Data === 'restart') {
                console.log('restart');
                connection.sendUTF('TM: pi: restart');
                needRest = true;
                bot.telegram.sendMessage(admin[0], 'Restart');
            }
            if (message.utf8Data === 'gitPull') {
                console.log('git pull');
                connection.sendUTF('TM: pi: pull');
                bot.telegram.sendMessage(admin[0], 'pull');
                needPull = true;
            }
            if (message.utf8Data === 'gitPush') {
                console.log('git push');
                connection.sendUTF('TM: pi: push');
                bot.telegram.sendMessage(admin[0], 'push');
                needPush = true;
            }
            if (message.utf8Data === 'botReconnect') {
                console.log('reconnect');
                connection.sendUTF('TM: pi: reconnect');
                bot.launch();
            }
            else*/ console.log("Received: '" + message.utf8Data + "'");
        }
    });
    socket = connection;
    function sendNumber() {
        if (connection.connected) {
            var number = new Date();
            connection.sendUTF('cl: ' + (Number(number)).toString());
            setTimeout(sendNumber, 60 * 1000);
        }
    }
    sendNumber();
});
function socketSend(message) {
    if (!started && !socket) {
        client.connect('wss://spamigor.ru:' + socketPort, 'echo-protocol');
        socketSend('started');
        started = true;
    }
    if (socketConnect && socket)
        socket.sendUTF('TM: cl: ' + message);
}
exports.socketSend = socketSend;
function socketSendResult(message) {
    if (!started && !socket) {
        client.connect('wss://spamigor.ru:' + socketPort, 'echo-protocol');
        socketSend('started');
        started = true;
    }
    if (socketConnect && socket)
        socket.sendUTF('TM: cl: ' + message);
}
exports.socketSendResult = socketSendResult;
client.connect('wss://spamigor.ru:' + socketPort, 'echo-protocol');
socketSend('started');
