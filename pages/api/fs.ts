require('dotenv').config();
const fs = require('fs');
const zlib = require('zlib');
const archiver = require('archiver');
const path = require('path');
let jwt = require('jsonwebtoken');
import NextCors from 'nextjs-cors';
const dir = process.cwd();
const mongo = require('./../../src/mech/mongo');
const mongoS = new mongo();

const log4js = require("log4js");

log4js.configure({
    appenders: { 
        cApi: { type: "file", filename: "log/cloudfslog.log" }, 
        console: { type: 'console' },
    },
    categories: { default: { appenders: ['console', "cApi"], level: "all" },
                mailer: { appenders: ['console', 'cApi'], level: 'all' }, },
  });
const logger = log4js.getLogger("cApi");

export default async function handler(req: any, res: any) {
    console.log(req.method);
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200,
    });
    if (req.method==='POST'){
        logger.info(req.body);
        let buf: {location: string, token?: string, action: string, name?: string} = {location: '/', action: ''};
        if (req?.body) {
            if (typeof(req.body)==='string') {
                buf = JSON.parse(req.body)
            }
            else buf = req.body;
        }
        const oldToken: string = req.headers?.authorization.slice(7) || buf?.token || '';
        let dat = await mongoS.find({token: oldToken});
        let access = false;
        if (dat.length===0) {
            let addrArr: string[] = (path.normalize(buf.location)).split(path.sep);
            addrArr[0] = 'data';
            console.log(addrArr)
            for (let i = addrArr.length; i>1; i--) {
                let middlPath = '';
                for (let j = 0; j<i; j++) middlPath+='/'+addrArr[j];
                middlPath = path.join(dir, middlPath, '/%%%ssystemData.json');
                console.log('middle')
                console.log(middlPath);
                if (fs.existsSync(middlPath)) {
                    const secureJson = JSON.parse(fs.readFileSync(middlPath));
                    if (secureJson?.['/']){
                        console.log('access denied');
                        access = true;
                        dat[0] = {login: ''};
                        break;
                    }
                }
            }
            if (!access) console.log('failed')
        }    
        if (dat.length || access) {
            const location = access ? path.join(dir, 'data', path.normalize(buf.location)) : path.join(dir, 'data', dat[0].login, path.normalize(buf.location))
            logger.debug(path.normalize(location));
            console.log(buf)
            if (buf.action === 'mkdir' && buf?.name!=='') {
                try {
                    logger.debug(`folder for ${dat[0].login} created`)
                    await fs.mkdirSync(path.join(location, buf.name));
                    res.status(200).json([]);
                }
                catch (e: any) {
                    logger.error(e);
                    res.status(500).json({message: 'folder not created'})
                }
            }
            else if (buf?.name && buf.action === 'rm' && buf?.name!=='') {
                let folders: {dir: string[], files: string[]} = {dir: [], files: []};
                console.log(location);
                fs.readdirSync(location, { withFileTypes: true }).filter((d: any)=> {
                    if (d.isDirectory()) folders.dir.push(d.name)
                    else folders.files.push(d.name)
                });
                if (folders.dir.includes(buf.name)) {
                    try {
                        fs.rmdirSync(path.join(location, buf.name), {recursive:true});
                        logger.info(`Directory ${location}/${buf.name} deleted by ${dat[0].login}`);
                        res.status(200).json({});
                    }
                    catch (e: any) {
                        logger.error(`directory ${location}/${buf.name} not deleted by ${dat[0].login}`)
                        logger.debug(e);
                        res.status(500).json({message: 'directory not deleted'})
                    }
                }
                else if (folders.files.includes(buf.name)) {
                    try {
                        fs.unlinkSync(path.join(location, buf.name));
                        logger.info(`File ${location}/${buf.name} deleted by ${dat[0].login}`);
                        res.status(200).json({});
                    }
                    catch (e: any) {
                        logger.error(`file ${location}/${buf.name} not deleted by ${dat[0].login}`)
                        logger.debug(e);
                        res.status(500).json({message: 'file not deleted'})
                    }
                }
                else res.status(404).json({message: 'no such file or directory'});
            }
            else if (buf.action === 'ls') {
                const files: string[] = fs.readdirSync(path.join(dir, 'data'));
                if (access||(files.includes(dat[0]?.login))) {
                    let userFiles = {
                        directs: fs.readdirSync(location, { withFileTypes: true }).filter((d: any) => d.isDirectory()).map((d: any)=> d.name),
                        files: fs.readdirSync(location, { withFileTypes: true }).filter((d: any) => !d.isDirectory()).map((d: any)=> d.name),
                    }
                    if (userFiles.files.includes('%%%ssystemData.json')) userFiles.files.splice(userFiles.files.indexOf('%%%ssystemData.json'), 1)
                    res.status(200).json(userFiles);
                }
                else {
                    try {
                        logger.debug(`folder for ${dat[0].login} created`)
                        await fs.mkdirSync(path.join(dir, 'data', dat[0].login));
                        res.status(200).json([]);
                    }
                    catch (e: any) {
                        logger.error(e);
                        res.status(500).json({message: 'folder not created'})
                    }
                }
            }
            else if ((buf.action === 'chmod')&&(buf?.name)&&(buf.name!=='')) {
                const directs:string[] = fs.readdirSync(
                    path.join(
                        dir, 
                        'data', 
                        dat[0].login, 
                        location), 
                    { withFileTypes: true })
                    .filter((d: any) => d.isDirectory()).map((d: any)=> d.name)
                let openData: any = {};
                try {
                    let openData: any = {};
                    if (fs.existsSync(path.join(location, '%%%ssystemData.json'))) {
                        openData = JSON.parse(fs.readFileSync(path.join(location, '%%%ssystemData.json')));
                    }
                    openData[buf.name] = true;
                    fs.writeFileSync(path.join(location, '%%%ssystemData.json'), JSON.stringify(openData));
                    res.status(200).json({
                        tok: jwt.sign({addr: path.normalize('/'+dat[0].login+'/'+location), 
                            type: (directs.includes(buf.name)||buf.name==='/')?true: false,
                            name: buf.name}, String(process.env.SIMPLETOK)),
                        type: (directs.includes(buf.name)||buf.name==='/')?true: false,
                        name: buf.name
                    })
                } catch(err) {
                    console.error(err)
                    res.status(500).json({message: 'some error'})
                }
            }
            else if (buf.action === 'tar') {
                const archive = archiver('zip', { zlib: { level: 9 } });
                archive.on('warning', (err: any) => {
                    if (err.code === 'ENOENT') {
                        console.warn('Warning:', err.message);
                    } else {
                        throw err;
                    }
                });
                archive.on('error', (err: any) => {
                    throw err;
                });
                console.log('makeZip');
                makeZip(archive, location, dat[0].login, location);
                console.log('endMakeZip');
                res.status(200).json({addr: 'oneTime/' + buf.location + '/' + dat[0].login + 'Archive.zip' })   
                console.log('after res');
                //res.setHeader('Content-disposition', 'attachment; filename=archive.zip');
                //res.setHeader('Content-type', 'application/zip');
                //archive.pipe(res);
            }
        }
        else res.status(401)
    }
    else if (req.method === 'GET') {
        if (req.query?.tok) {
            console.log(process.env.SIMPLETOK)
            console.log(jwt.verify(decodeURI(req.query.tok), String(process.env.SIMPLETOK)));
        }
    }

}

const makeZip = (archive: any, folderToGet: string, login: string, location: string) => {

    try {
        console.log('delete old');
        fs.unlinkSync(path.normalize(folderToGet + '/' + login + '-archive.zip'));
    }
    catch (e: any) {
        console.log('delete error');
    }
    const output = fs.createWriteStream(folderToGet + '/' + login + '-archive.zip');
    archive.pipe(output);
    const files = fs.readdirSync(folderToGet);
    files.forEach((file: any) => {
        const filePath = folderToGet + '/' + file;
        if (file === '%%%ssystemData.json') console.log('%%%ssystemData.json ignored');
        else {
            archive.file(filePath, { name: file });
            console.log('add file');
        }
    });  
    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
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