
const WebSocketClient = require('websocket').client;
const socketPort = '8080/';

let socketConnect: boolean = false;
let socket: any;
let started: boolean = false;

let client = new WebSocketClient();

client.on('connectFailed', function(error: any) {
    console.log('Connect Error: ' + error.toString());
	socketConnect = false;
	setTimeout(() => {
		console.log('reconnect');
		client.connect('wss://spamigor.ru:' + socketPort, 'echo-protocol');
	}, 10*1000)
});

client.on('connect', function(connection: any) {
	socketConnect = true;
    started = true;
    console.log('WebSocket Client Connected');
    connection.on('error', function(error: any) {
		socketConnect = false;
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
		socketConnect = false;
        console.log('echo-protocol Connection Closed');
		setTimeout(() => {
			console.log('reconnect');
			client.connect('wss://spamigor.ru:' + socketPort, 'echo-protocol');
		}, 10*1000)
    });
    connection.on('message', function(message: any) {
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
            setTimeout(sendNumber, 60*1000);
        }
    }
    sendNumber();
});

export function socketSend (message: string) {
    if (!started&&!socket) {
        client.connect('wss://spamigor.ru:' + socketPort, 'echo-protocol');
        socketSend('started');
        started = true;
    }
	if (socketConnect&&socket) socket.sendUTF('TM: cl: ' + message);
}

export function socketSendResult (message: string) {
    if (!started&&!socket) {
        client.connect('wss://spamigor.ru:' + socketPort, 'echo-protocol');
        socketSend('started');
        started = true;
    }
	if (socketConnect&&socket) socket.sendUTF('TM: cl: ' + message);
}

client.connect('wss://spamigor.ru:' + socketPort, 'echo-protocol');
socketSend('started');