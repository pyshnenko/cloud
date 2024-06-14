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
require('dotenv').config();
var fs = require("fs");
var CryptoJS = require("crypto-js");
var nodemailer = require('nodemailer');
var testEmailAccount = nodemailer.createTestAccount();
var myURL = 'https://cloud.spamigor.ru/api';
var options = {
    key: fs.readFileSync("/etc/letsencrypt/live/cloud.spamigor.ru/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/cloud.spamigor.ru/fullchain.pem"),
    ca: fs.readFileSync("/etc/letsencrypt/live/cloud.spamigor.ru/chain.pem")
};
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', //'smtp.mail.ru',
    port: 465,
    secure: true,
    key: options.key,
    cert: options.cert,
    ca: options.ca,
    auth: {
        user: process.env.MAILUSER,
        pass: process.env.MAILPASS
    },
});
var sKey = process.env.SKEY;
var mailFunction = /** @class */ (function () {
    function mailFunction(url, salt) {
        if (url)
            myURL = url;
        if (salt)
            sKey = salt;
    }
    mailFunction.prototype.urlAsk = function () {
        return myURL;
    };
    mailFunction.prototype.cryptHash = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var buf, ciphertext, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log(hash);
                        buf = hash.toString();
                        _a = encodeURIComponent;
                        return [4 /*yield*/, CryptoJS.AES.encrypt(buf, sKey).toString()];
                    case 1:
                        ciphertext = _a.apply(void 0, [_b.sent()]);
                        console.log(ciphertext);
                        return [2 /*return*/, ciphertext];
                }
            });
        });
    };
    mailFunction.prototype.decryptHash = function (ciphertext) {
        return __awaiter(this, void 0, void 0, function () {
            var bytes, originalText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('decr');
                        console.log(ciphertext);
                        console.log(decodeURIComponent(ciphertext));
                        return [4 /*yield*/, CryptoJS.AES.decrypt(decodeURIComponent(ciphertext), sKey)];
                    case 1:
                        bytes = _a.sent();
                        console.log('bytes');
                        console.log(bytes);
                        return [4 /*yield*/, bytes.toString(CryptoJS.enc.Utf8)];
                    case 2:
                        originalText = _a.sent();
                        console.log('original');
                        console.log(originalText);
                        console.log('exit');
                        return [2 /*return*/, originalText];
                }
            });
        });
    };
    mailFunction.prototype.sendMail = function (addr, hash) {
        return __awaiter(this, void 0, void 0, function () {
            var hashS, hashA;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('addr', addr);
                        return [4 /*yield*/, this.cryptHash(hash)];
                    case 1:
                        hashS = _a.sent();
                        return [4 /*yield*/, this.cryptHash(addr)];
                    case 2:
                        hashA = _a.sent();
                        transporter.sendMail({
                            from: "<".concat(String(process.env.MAILUSER), ">"),
                            to: addr,
                            subject: 'Подтверждение почты',
                            text: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u043F\u043E\u0447\u0442\u0443 ".concat(addr, " \u043F\u0440\u043E\u0439\u0434\u044F \u043F\u043E \u0441\u0441\u044B\u043B\u043A\u0435 ").concat(myURL, "?name=").concat(hashS, "&addr=").concat(hashA),
                            html: "<h1>\u041F\u0440\u0438\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u043C \u0432 \u0437\u043E\u043B\u043E\u0442\u043E\u043B\u0435\u0441\u044C\u0435!</h1>\n            \u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u043F\u043E\u0447\u0442\u0443 ".concat(addr, " \u043F\u0440\u043E\u0439\u0434\u044F \u043F\u043E \u0441\u0441\u044B\u043B\u043A\u0435 <a href=\"").concat(myURL, "?name=").concat(hashS, "&addr=").concat(hashA, "\">\u0442\u044B\u043A\u043D\u0438 \u0441\u044E\u0434\u0430</a>"),
                        }).catch(function (e) { console.log('error', e); });
                        return [2 /*return*/];
                }
            });
        });
    };
    return mailFunction;
}());
module.exports = mailFunction;
