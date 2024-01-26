"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeZip = exports.access_check = void 0;
require('dotenv').config();
var fs = require('fs');
var path = require('path');
var dir = process.cwd();
function access_check(addr, name, needLogin) {
    if (name === void 0) { name = '/'; }
    if (needLogin === void 0) { needLogin = false; }
    var addrArr = (path.normalize(addr)).split(path.sep);
    addrArr[0] === '' ? addrArr[0] = 'data' : addrArr.unshift('data');
    addrArr.pop();
    var access = false;
    for (var i = addrArr.length; i > 1; i--) {
        var middlPath = '';
        for (var j = 0; j < i; j++)
            middlPath += '/' + addrArr[j];
        middlPath = path.join(dir, middlPath, '/%%%ssystemData.json');
        if (fs.existsSync(middlPath)) {
            var secureJson = JSON.parse(fs.readFileSync(middlPath));
            if ((secureJson === null || secureJson === void 0 ? void 0 : secureJson['/']) || (i === addrArr.length && (secureJson === null || secureJson === void 0 ? void 0 : secureJson[name]))) {
                console.log('access denied');
                access = true;
                return needLogin ? { result: true, login: addrArr[1] } : true;
            }
        }
    }
    return false;
}
exports.access_check = access_check;
var makeZip = function (archive, folderToGet, login, location) {
    try {
        console.log('delete old');
        fs.unlinkSync(path.normalize(folderToGet + '/' + 'Archive.zip'));
    }
    catch (e) {
        console.log('delete error');
    }
    var output = fs.createWriteStream(folderToGet + '/' + 'Archive.zip');
    archive.pipe(output);
    var files = fs.readdirSync(folderToGet);
    files.forEach(function (file) {
        var filePath = folderToGet + '/' + file;
        if (file === '%%%ssystemData.json')
            console.log('%%%ssystemData.json ignored');
        else {
            archive.file(filePath, { name: file });
            console.log('add file');
        }
    });
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        //return 'oneTime/' + location + '/' + login + '-archive.zip' 
    });
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            console.log('warning');
            console.log(err);
        }
        else {
            // throw error
            console.log('warning 2');
            throw err;
        }
    });
    archive.on('error', function (err) {
        console.log('error');
        throw err;
    });
    console.log('finalize');
    archive.finalize(function () { return console.log('final message'); });
};
exports.makeZip = makeZip;
