const fs = require('fs');
const path = require('path');
let jwt = require('jsonwebtoken');
import NextCors from 'nextjs-cors';
const dir = process.cwd();
const sep = path.sep;
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
        res.status(401)
    }

}