"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var express = require("express");
var multer = require("multer");
var cors = require('cors');
var fs = require('fs');
process.title = 'APIServerCloud';
var app = express();
var cookieParser = require('cookie-parser');
var path = require('path');
var mongo = require('./src/mech/mongo');
var mongoS = new mongo();
var jwt = require('jsonwebtoken');
var access_check = require('./src/mech/requested_feature').access_check;
var WebSocketClient = require('websocket').client;
var socketPort = '8080/';
var IO = require('socket.io-client');
var bodyParser = require('body-parser');
var socketConnect = false;
var URL = 'https://io.spamigor.ru';
var socket = IO(URL, {
    autoConnect: true
});
var dir = process.cwd();
app.use(cors());
app.use(cookieParser('secret key'));
app.use(express.static(__dirname));
app.get("/openLinc*", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, folderPath, subPath;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('\n\n\n\n\nyep\n\n\n');
                    filePath = '';
                    folderPath = '';
                    if (!((req === null || req === void 0 ? void 0 : req.query) && ((_a = req.query) === null || _a === void 0 ? void 0 : _a.tok) && ((_b = req.query) === null || _b === void 0 ? void 0 : _b.tok) !== '')) return [3 /*break*/, 2];
                    return [4 /*yield*/, jwt.verify(decodeURI(req.query.tok), String(process.env.SIMPLETOK))];
                case 1:
                    subPath = _c.sent();
                    filePath = path.normalize(path.join(dir, 'data', subPath.addr, subPath.name));
                    folderPath = path.join(dir, path.normalize('data/' + subPath.addr));
                    if (access_check(subPath.addr, subPath.name)) {
                        if (subPath.type)
                            res.send("<h4>\u0410\u0434\u0440\u0435\u0441: ".concat(filePath, "</h4><h4>\u0422\u0438\u043F: '\u041F\u0430\u043F\u043A\u0430'</h4><h4>\u0418\u043C\u044F \u0444\u0430\u0439\u043B\u0430 \u0438\u043B\u0438 \u043F\u0430\u043F\u043A\u0438: ").concat(subPath.name, "</h4><h4>\u0414\u043E\u0441\u0442\u0443\u043F \u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043D</h4>"));
                        else {
                            fs.readFile(filePath, function (error, data) {
                                if (error) {
                                    res.statusCode = 404;
                                    res.end("Resourse not found!");
                                }
                                else {
                                    console.log('выдаем файл');
                                    res.end(data);
                                }
                            });
                        }
                    }
                    else {
                        res.statusCode = 401;
                        res.end('go out');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    console.log('smth wrong');
                    _c.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
});
app.get("/oneTime*", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, login, access, urlPath, token, dat;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('oneTime');
                    filePath = '', login = '', access = false;
                    urlPath = decodeURI(req.url.split('?')[0].substr(9)) || '/';
                    token = ((_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.token) || ((_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.t) || null;
                    if (!token) return [3 /*break*/, 2];
                    return [4 /*yield*/, mongoS.find({ token: token }, true)];
                case 1:
                    dat = _c.sent();
                    if (dat.length) {
                        access = true;
                        login = dat[0].login;
                    }
                    console.log(login);
                    console.log(dat);
                    return [3 /*break*/, 3];
                case 2:
                    console.log(login + '/' + urlPath);
                    access = access_check(login + '/' + urlPath);
                    console.log(access);
                    _c.label = 3;
                case 3:
                    if (access) {
                        filePath = path.normalize(dir + '/data/' + login + '/' + urlPath);
                        console.log(filePath);
                        fs.readFile(filePath, function (error, data) {
                            if (error) {
                                res.statusCode = 404;
                                res.end("Resourse not found!");
                            }
                            else {
                                res.end(data);
                                console.log('delete');
                                fs.unlinkSync(filePath);
                            }
                        });
                    }
                    else {
                        console.log('not found');
                        res.statusCode = 404;
                        res.end("Resourse not found!");
                    }
                    return [2 /*return*/];
            }
        });
    });
});
app.get("/data*", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, urlPath, access, login, token, dat;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('data');
                    filePath = '';
                    console.log(req.url.split('?')[0]);
                    urlPath = decodeURI(req.url.split('?')[0].substr(5)) || '/';
                    access = false, login = '';
                    token = ((_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.token) || ((_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.t) || null;
                    console.log(token);
                    console.log(urlPath);
                    if (!token) return [3 /*break*/, 2];
                    return [4 /*yield*/, mongoS.find({ token: token }, true)];
                case 1:
                    dat = (_c.sent());
                    if (dat.length) {
                        access = true;
                        login = dat[0].login;
                    }
                    console.log(dat);
                    return [3 /*break*/, 3];
                case 2:
                    access = access_check(login + '/' + urlPath);
                    _c.label = 3;
                case 3:
                    console.log(access);
                    if (access) {
                        filePath = path.normalize(dir + '/data/' + login + '/' + urlPath);
                        console.log(filePath);
                        fs.readFile(filePath, function (error, data) {
                            if (error) {
                                console.log(error);
                                res.statusCode = 401;
                                res.end("Resourse error!");
                            }
                            else {
                                //response.sendFile(filePath)
                                res.end(data);
                            }
                        });
                    }
                    else {
                        res.statusCode = 404;
                        res.end("Resourse not found!");
                    }
                    return [2 /*return*/];
            }
        });
    });
});
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, "".concat(decodeURI(req.headers.user), "-").concat(decodeURI(req.headers.fname)));
        //global.name = file.fieldname + '-' + uniqueSuffix;
    }
});
var upload = multer({ storage: storage });
app.use(upload.single("file"));
app.post("/upload", function (req, res, next) {
    console.log('im here');
    var folder = decodeURI(req.headers.folder);
    var filedata = req.body;
    console.log(req.body);
    console.log(req.headers);
    if (!filedata)
        res.send({ res: 'error' });
    else {
        var ddir = [];
        checkPathCorrect(folder);
        fs.rename(path.normalize("uploads/".concat(decodeURI(req.headers.user), "-").concat(decodeURI(req.headers.fname))), path.normalize("data/".concat(folder, "/").concat(decodeURI(req.headers.fname))), function (err) {
            if (err)
                throw err; // не удалось переместить файл
            console.log('Файл успешно перемещён');
        });
        res.send({ res: 'ok', addr: "data/".concat(decodeURI(req.headers.fname)) });
    }
});
//const urlencodedParser = express.urlencoded({extended: true});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post("/socket", function (req, res, next) {
    console.log('\n\nBODY\n\n\n');
    console.log(req.body);
    console.log('\n\n\n\n\n');
    if (socketConnect)
        socketSend(req.body.login || '', req.body.text);
});
app.listen(8801, function () { return console.log('start'); });
function checkPathCorrect(filePath) {
    var splitPath = path.normalize(filePath).replace(/\\/g, '/').split('/');
    var folder = '';
    for (var i = 0; i < splitPath.length; i++) {
        folder += ('/' + splitPath[i]);
        try {
            fs.readdirSync(path.normalize("data/".concat(folder)), { withFileTypes: true });
            console.log('Папка найдена');
        }
        catch (e) {
            fs.mkdirSync(path.normalize("data/".concat(folder)));
            console.log('Папка успешно создана');
        }
    }
}
function onConnect() {
    console.log('connect');
    socketConnect = true;
    socket.emit('otherProject', JSON.stringify({ from: '', text: 'Облако подключено' }));
}
socket.on('connect', onConnect);
function socketSend(user, text) {
    console.log('connect');
    socket.emit('otherProject', JSON.stringify({ from: user || 'Некто', text: text }));
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
