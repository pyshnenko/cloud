import { FSType } from "../types/api/types";

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {FSType} = require('../types/api/types');

const dir = process.cwd();

export function access_check (addr: string, name: string = '/', needLogin: boolean = false) {    
    let addrArr: string[] = (path.normalize(addr)).split(path.sep);
    addrArr[0]===''?addrArr[0] = 'data':addrArr.unshift('data');
    //addrArr.pop();
    for (let i = addrArr.length; i>1; i--) {
        let middlPath = '';
        for (let j = 0; j<i; j++) middlPath+='/'+addrArr[j];
        middlPath = path.join(dir, middlPath, '/%%%ssystemData.json');
        if (fs.existsSync(middlPath)) {
            const secureJson = JSON.parse(fs.readFileSync(middlPath));
            if ((secureJson?.['/'])||(i===addrArr.length&&secureJson?.[name])){
                console.log('access denied');
                return needLogin? {result: true, login: addrArr[1]} : true;
            }
        }
    }
    return {result: false};
}

export const makeZip = (archive: any, folderToGet: string, name: string) => {

    try {
        console.log('delete old');
        fs.unlinkSync(path.normalize(folderToGet + '/' + 'Archive.zip'));
    }
    catch (e: any) {
        console.log('delete error');
    }
    let sysFile: any = undefined;
    if (fs.existsSync(path.normalize(folderToGet + '/' + '%%%ssystemData.json'))) {
        sysFile = fs.readFileSync(path.normalize(folderToGet + '/' + '%%%ssystemData.json'));
        fs.unlinkSync(path.normalize(folderToGet + '/' + '%%%ssystemData.json'))
    }
    const output = fs.createWriteStream(folderToGet + '/' + 'Archive.zip');
    archive.pipe(output);
    /*const files = fs.readdirSync(folderToGet);
    files.forEach((file: any) => {
        const filePath = folderToGet + '/' + file;
        if (file === '%%%ssystemData.json') console.log('%%%ssystemData.json ignored');
        else {
            archive.file(filePath, { name: file });
            console.log('add file');
        }
    });*/
    archive.directory(folderToGet, name);
    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        if (sysFile!==undefined) fs.writeFileSync(path.normalize(folderToGet + '/' + '%%%ssystemData.json'), sysFile)
        //return 'oneTime/' + location + '/' + login + '-archive.zip' 
    });
    archive.on('warning', function(err: any) {
        if (err.code === 'ENOENT') {
            console.log('warning');
          console.log(err)
        } else {
          // throw error
            console.log('warning 2');
            throw err;
        }
    });
    archive.on('error', function(err: any) {
        console.log('error');
        throw err;
    });
    console.log('finalize');
    archive.finalize(()=>console.log('final message'));
}

export function body_data(body: FSType|string) {
    let buf: FSType = {location: '/', action: ''};    
    if (body) {
        if (typeof(body)==='string') {
            buf = JSON.parse(body)
        }
        else buf = body;
    }
    return buf
}