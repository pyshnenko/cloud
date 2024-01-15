const fs = require('fs');
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
        logger.info(dat.length);
        logger.debug(path.join(dir, 'data'));
        logger.debug(path.normalize(buf.location));
        if (dat.length) {
            console.log(buf)
            if (buf.action === 'mkdir' && buf?.name!=='') {
                try {
                    logger.debug(`folder for ${dat[0].login} created`)
                    await fs.mkdirSync(path.join(dir, 'data', dat[0].login, path.normalize(buf.location), buf.name));
                    res.status(200).json([]);
                }
                catch (e: any) {
                    logger.error(e);
                    res.status(500).json({message: 'folder not created'})
                }
            }
            else if (buf?.name && buf.action === 'rm' && buf?.name!=='') {
                let folders: {dir: string[], files: string[]} = {dir: [], files: []};
                fs.readdirSync(path.join(dir, 'data', dat[0].login, path.normalize(buf.location))).filter((d: any)=> {
                    if (d.isDirectory()) folders.dir.push(d.name)
                    else folders.files.push(d.name)
                });
                if (folders.dir.includes(buf.name)) {
                    try {
                        fs.rmdirSync(path.join(dir, 'data', dat[0].login, path.normalize(buf.location), buf.name), {recursive:true});
                        logger.info(`Directory ${buf.location}/${buf.name} deleted by ${dat[0].login}`);
                        res.status(200).json({});
                    }
                    catch (e: any) {
                        logger.error(`directory ${buf.location}/${buf.name} not deleted by ${dat[0].login}`)
                        logger.debug(e);
                        res.status(500).json({message: 'directory not deleted'})
                    }
                }
                else if (folders.files.includes(buf.name)) {
                    try {
                        fs.unlinkSync(path.join(dir, 'data', dat[0].login, path.normalize(buf.location), buf.name));
                        logger.info(`File ${buf.location}/${buf.name} deleted by ${dat[0].login}`);
                        res.status(200).json({});
                    }
                    catch (e: any) {
                        logger.error(`file ${buf.location}/${buf.name} not deleted by ${dat[0].login}`)
                        logger.debug(e);
                        res.status(500).json({message: 'file not deleted'})
                    }
                }
                else res.status(404).json({message: 'no such file or directory'});
            }
            else if (buf.action === 'ls') {
                const files: string[] = fs.readdirSync(path.join(dir, 'data'));
                if (files.includes(dat[0].login)) {
                    let userFiles = {
                        directs: fs.readdirSync(path.join(dir, 'data', dat[0].login, path.normalize(buf.location)), { withFileTypes: true }).filter((d: any) => d.isDirectory()).map((d: any)=> d.name),
                        files: fs.readdirSync(path.join(dir, 'data', dat[0].login, path.normalize(buf.location)), { withFileTypes: true }).filter((d: any) => !d.isDirectory()).map((d: any)=> d.name),
                    }
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

        }
        else res.status(401)
    }

}