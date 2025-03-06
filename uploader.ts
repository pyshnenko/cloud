require('dotenv').config();
const express = require("express");
const multer  = require("multer");
const cors = require('cors');
const fs = require('fs');
process.title='APIServerCloud';
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const mongo = require('./src/mech/mongo');
const mongoS = new mongo();
const jwt = require('jsonwebtoken');
const {access_check} = require('./src/mech/requested_feature');
const WebSocketClient = require('websocket').client;
const socketPort = '8080/';
const IO = require ('socket.io-client');
var bodyParser = require('body-parser');

let socketConnect: boolean = false;
const URL ='https://io.spamigor.ru';  
let socket: any = IO(URL, {
    autoConnect: true
});
 

export {};
const dir = process.cwd();

app.use(cors());

app.use(cookieParser('secret key'));
app.use(express.static(__dirname));

app.get("/openLinc*", async function (req: any, res: any) {
    console.log('\n\n\n\n\nyep\n\n\n');
    var filePath = '';
    var folderPath = '';
    if (req?.query && req.query?.tok && req.query?.tok !== '') {
        const subPath = await jwt.verify(decodeURI(req.query.tok), String(process.env.SIMPLETOK));
        filePath = path.normalize(path.join(dir, 'data', subPath.addr, subPath.name));
        folderPath = path.join(dir, path.normalize('data/' + subPath.addr));
        if (access_check(subPath.addr, subPath.name)) {
            if (subPath.type) res.send(`<h4>Адрес: ${filePath}</h4><h4>Тип: 'Папка'</h4><h4>Имя файла или папки: ${subPath.name}</h4><h4>Доступ Разрешен</h4>`);
            else {    
                fs.readFile(filePath, function(error: any, data: any){              
                    if(error){                  
                        res.statusCode = 404;
                        res.end("Resourse not found!");
                    }   
                    else{
                        console.log('выдаем файл')
                        res.end(data);
                    }
                });
            }
        }
        else {
            res.statusCode=401;
            res.end('go out')
        }
    }
    else console.log('smth wrong');
})

app.get("/oneTime*", async function (req: any, res: any) {
    console.log('oneTime');
    let filePath: string = '', login: string='', access: boolean = false;
    const urlPath = decodeURI(req.url.split('?')[0].substr(9)) || '/';
    const token: string = req?.cookies?.token || req?.query?.t || null;
    if (token) {
        let dat: {login: string}[] = await mongoS.find({ token: token }, true) as {login: string}[];
        if (dat.length) {access = true; login = dat[0].login}
        console.log(login);
        console.log(dat);
    }
    else {
        console.log(login + '/' + urlPath)
        access=access_check(login + '/' + urlPath)
        console.log(access)
    }
    if (access) {
        filePath = path.normalize(dir+'/data/' + login + '/' + urlPath);
        console.log(filePath);
        fs.readFile(filePath, function(error: any, data: any){              
            if(error){                  
                res.statusCode = 404;
                res.end("Resourse not found!");
            }   
            else{
                res.end(data);
                console.log('delete')
                fs.unlinkSync(filePath);
            }
        });
    }
    else {
        console.log('not found')
        res.statusCode = 404;
        res.end("Resourse not found!");
    }
})

app.get("/data*", async function (req: any, res: any) {
    console.log('data');
    let filePath = '';
    console.log(req.url.split('?')[0])
    let urlPath = decodeURI(req.url.split('?')[0].substr(5)) || '/';// decodeURI(req.url.substr(9)) || '/';
    let access: boolean = false, login: string = '';
    const token: string = req?.cookies?.token || req?.query?.t || null;
    console.log(token)
    console.log(urlPath)
    if (token) {
        let dat: {login: string}[] = (await mongoS.find({ token }, true)) as {login: string}[];
        if (dat.length) {access = true; login = dat[0].login}
        console.log(dat);
    }
    else access=access_check(login + '/' + urlPath)
    console.log(access);
    if (access) {
        filePath = path.normalize(dir+'/data/' + login + '/' + urlPath);
        console.log(filePath);
        fs.readFile(filePath, function (error: any, data: any) {
        if (error) {
            console.log(error)
            res.statusCode = 401;
            res.end("Resourse error!");
        }
        else {
            //response.sendFile(filePath)
            res.end(data);
        }
    })}
    else {        
        res.statusCode = 404;
        res.end("Resourse not found!");
    }
});
  

const storage = multer.diskStorage({
  destination: function (req: Request, file: Response, cb: any) {
    cb(null, 'uploads')
  },
  filename: function (req: any, file: any, cb: any) {
    cb(null, `${decodeURI(req.headers.user)}-${decodeURI(req.headers.fname)}`);
    //global.name = file.fieldname + '-' + uniqueSuffix;
  }
})

const upload = multer({ storage: storage })

app.use(upload.single("file"));
app.post("/upload", function (req: any, res: any, next: any) {
    console.log('im here');
    const folder = decodeURI(req.headers.folder);
    let filedata = req.body;
    console.log(req.body);
    console.log(req.headers);
    if(!filedata)
        res.send({res: 'error'});
    else
    {
        let ddir: string[] = [];
        checkPathCorrect(folder);
        fs.rename(path.normalize(`uploads/${decodeURI(req.headers.user)}-${decodeURI(req.headers.fname)}`), path.normalize(`data/${folder}/${decodeURI(req.headers.fname)}`), (err: any) => {
          if(err) throw err; // не удалось переместить файл
            console.log('Файл успешно перемещён');
        });
        res.send({res: 'ok', addr: `data/${decodeURI(req.headers.fname)}`});
    }
});

//const urlencodedParser = express.urlencoded({extended: true});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.post("/socket", function (req: any, res: any, next: any) {
    console.log('\n\nBODY\n\n\n');
    console.log(req.body);
    console.log('\n\n\n\n\n');
    if (socketConnect) socketSend(req.body.login||'', req.body.text);
})

app.listen(8801, ()=>console.log('start'));

function checkPathCorrect(filePath: string) {

    let splitPath: string[] = path.normalize(filePath).replace(/\\/g,'/').split('/');
    let folder = ''
    for (let i = 0; i<splitPath.length; i++) {
        folder += ('/'+splitPath[i]);
        try {
            fs.readdirSync(path.normalize(`data/${folder}`), { withFileTypes: true });
            console.log('Папка найдена');
        } catch (e: any) {
            fs.mkdirSync(path.normalize(`data/${folder}`));
            console.log('Папка успешно создана');
        }
    }
}    

function onConnect() {
    console.log('connect');
    socketConnect = true;
    socket.emit('otherProject', JSON.stringify({from: '', text: 'Облако подключено'}));
}

socket.on('connect', onConnect);

function socketSend(user: string, text: string) {
    console.log('connect');
    socket.emit('otherProject', JSON.stringify({from: user||'Некто', text: text}));
}
/*
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
            else console.log("Received: '" + message.utf8Data + "'");
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

function socketSend (message: string) {
	if (socketConnect&&socket) socket.sendUTF('TM: cl:  ' + message);
}

client.connect('wss://spamigor.ru:' + socketPort, 'echo-protocol');
socketSend('started');*/