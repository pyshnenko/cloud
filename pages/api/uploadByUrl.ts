require('dotenv').config();
const fs = require('fs');
const https = require('https');
const path = require('path');
let jwt = require('jsonwebtoken');
import NextCors from 'nextjs-cors';
import { UbyURL } from '../../src/types/api/types';
const dir = process.cwd();
const mongo = require('./../../src/mech/mongo');
const mongoS = new mongo();
const log4js = require("log4js");
const {access_check} = require('../../src/mech/requested_feature');

log4js.configure({
    appenders: { 
        cApi: { type: "file", filename: "log/cloudUploadBuURLlog.log" }, 
        console: { type: 'console' },
    },
    categories: { default: { appenders: ['console', "cApi"], level: "all" },
                mailer: { appenders: ['console', 'cApi'], level: 'all' }, },
  });
const logger = log4js.getLogger("cApi");

export default async function handler(req: any, res: any) {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200,
    });
    if (req.method==='POST'){
        let buf: UbyURL = {location:  '/', fname: '', url: ''};    
        if (req.body) {
            if (typeof(req.body)==='string') {
                buf = JSON.parse(req.body)
            }
            else buf = req.body;
        }
        //console.log(buf);
        if (req.headers?.authorization && req.headers?.authorization!=='') {
            const token: string = req.headers?.authorization.slice(7);
            let dat = await mongoS.find({token: token});
            let access: {result: boolean, login?: string} = (dat.length===0)?access_check(buf.location, buf?.login||'/', true) as {result: boolean, login?: string}:{result: false};
            if (access.result===true) dat[0] = {login: access.login};
            if (dat.length) {
                const location = access.result ? path.join(dir, 'data', path.normalize(buf.location)) : path.join(dir, 'data', dat[0].login, path.normalize(buf.location), buf.fname)
                logger.debug(path.normalize(location));
                let file = fs.createWriteStream(location);
                await https.get(buf.url, function(res: any) {
                    res.pipe(file);
                });            
                file.on('finish', () => {
                    file.close();
                    logger.info(`${buf.fname} ready`)
                });
                console.log('done');
                res.status(200).json({mess: buf.fname})
            }
        }
        else res.status(401).json({mess: 'error'})
    }
}