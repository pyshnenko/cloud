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
var MongoClient = require("mongodb").MongoClient;
var Redis = require("ioredis");
var redis = new Redis({
    port: Number(process.env.REDIS_PORT),
    host: String(process.env.REDIS_HOST),
    password: String(process.env.REDIS_PASS),
    db: 1
});
var mongoClient;
var db;
var collection;
var usersCollection;
var url = process.env.MONGO_URL;
var username = process.env.MONGO_USERNAME;
var password = process.env.MONGO_PASS;
var authMechanism = "DEFAULT";
var uri = "mongodb://".concat(username, ":").concat(password, "@").concat(url, "/?authMechanism=").concat(authMechanism);
var cashTokenList = {};
var mongoFunc = /** @class */ (function () {
    function mongoFunc() {
        mongoClient = new MongoClient(uri);
        db = mongoClient.db("cloud");
        collection = db.collection("gfUsers");
        usersCollection = db.collection("cloudUsers");
    }
    mongoFunc.prototype.find = function (obj_1) {
        return __awaiter(this, arguments, void 0, function (obj, onlyTok) {
            var extBuf, mongoconnect, login, err_1, err_2;
            var _a;
            if (onlyTok === void 0) { onlyTok = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        extBuf = [];
                        mongoconnect = false;
                        console.log(cashTokenList);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 11, 12, 17]);
                        console.log(obj);
                        if (!(onlyTok && (obj === null || obj === void 0 ? void 0 : obj.token))) return [3 /*break*/, 5];
                        if (!cashTokenList[obj.token]) return [3 /*break*/, 2];
                        extBuf.push({ login: cashTokenList[obj.token].login });
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(obj === null || obj === void 0 ? void 0 : obj.token)) return [3 /*break*/, 4];
                        return [4 /*yield*/, redis.get(obj.token)];
                    case 3:
                        login = _b.sent();
                        if (login !== null) {
                            extBuf.push({ login: login });
                            cashTokenList[obj.token] = {
                                login: login,
                                timer: setTimeout(function () { return delete (cashTokenList[obj.token]); }, 1000 * 60 * 10)
                            };
                        }
                        else
                            mongoconnect = true;
                        return [3 /*break*/, 5];
                    case 4:
                        mongoconnect = true;
                        _b.label = 5;
                    case 5:
                        if (!(mongoconnect || !onlyTok)) return [3 /*break*/, 10];
                        console.log('mongoconnect');
                        return [4 /*yield*/, mongoClient.connect()];
                    case 6:
                        _b.sent();
                        if (!obj) return [3 /*break*/, 8];
                        return [4 /*yield*/, collection.find(obj).toArray()];
                    case 7:
                        extBuf = _b.sent();
                        if (extBuf.length && ((_a = extBuf[0]) === null || _a === void 0 ? void 0 : _a.login)) {
                            redis.set(obj.token, extBuf[0].login, 'EX', 600);
                            cashTokenList[obj.token] = {
                                login: extBuf[0].login,
                                timer: setTimeout(function () { return delete (cashTokenList[obj.token]); }, 1000 * 60 * 10)
                            };
                        }
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, collection.find().toArray()];
                    case 9:
                        extBuf = _b.sent();
                        _b.label = 10;
                    case 10: return [3 /*break*/, 17];
                    case 11:
                        err_1 = _b.sent();
                        extBuf = [];
                        return [3 /*break*/, 17];
                    case 12:
                        if (!mongoconnect) return [3 /*break*/, 16];
                        _b.label = 13;
                    case 13:
                        _b.trys.push([13, 15, , 16]);
                        return [4 /*yield*/, mongoClient.close()];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        err_2 = _b.sent();
                        console.log(err_2);
                        return [3 /*break*/, 16];
                    case 16: return [2 /*return*/, extBuf];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    mongoFunc.prototype.updateOne = function (oldObj, obj) {
        return __awaiter(this, void 0, void 0, function () {
            var userLogin, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 6]);
                        return [4 /*yield*/, mongoClient.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, collection.updateOne(oldObj, { $set: obj })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        err_3 = _a.sent();
                        console.log(err_3);
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, mongoClient.close()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, userLogin];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    mongoFunc.prototype.incertOne = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 6]);
                        return [4 /*yield*/, mongoClient.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, collection.insertOne(obj)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        err_4 = _a.sent();
                        console.log(err_4);
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, mongoClient.close()];
                    case 5:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    mongoFunc.prototype.id = function () {
        return __awaiter(this, void 0, void 0, function () {
            var count, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 6]);
                        return [4 /*yield*/, mongoClient.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, collection.countDocuments()];
                    case 2:
                        count = _a.sent();
                        return [4 /*yield*/, mongoClient.close()];
                    case 3:
                        _a.sent();
                        console.log('Записей: ' + count);
                        return [2 /*return*/, count];
                    case 4:
                        e_1 = _a.sent();
                        console.log(e_1);
                        return [4 /*yield*/, mongoClient.close()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return mongoFunc;
}());
module.exports = mongoFunc;
