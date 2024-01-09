const mongo = require('./../../src/mech/mongo');
const fs = require('fs');
let jwt = require('jsonwebtoken');
import NextCors from 'nextjs-cors';
const mongoS = new mongo();
const bcrypt = require('bcrypt');

const log4js = require("log4js");

log4js.configure({
    appenders: { 
        cApi: { type: "file", filename: "log/cloudtokenUpdlog.log" }, 
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
        let buf: {oldToken: string} = {oldToken: ''};
        if (req?.body) {
            if (typeof(req.body)==='string') {
                buf = JSON.parse(req.body)
            }
            else buf = req.body;
        }
        console.log(buf);
        const oldToken: string = req.headers?.authorization.slice(7) || buf?.oldToken || '';
        if (oldToken !== '') {            
            let dat = await mongoS.find({token: oldToken});
            logger.debug('Записей: ' + dat.length);
            if (dat.length) {
                delete(dat[0]._id);
                delete(dat[0].token);
                const nTok = await jwt.sign(dat[0], dat[0].password.slice(8), { expiresIn: 60 * 60 });//String(process.env.SALT_CRYPT));
                mongoS.updateOne({login: dat[0].login}, {token: nTok});
                dat[0].token=nTok;
                dat[0].atoken = dat[0].password.slice(8);
                delete(dat[0].password);
                res.status(200).json(dat[0]);
            }
            else res.status(401).json({res: false});
        }
        else res.status(402).json({res: false});
    }
}