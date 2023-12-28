const mongo = require('./../../src/mech/mongo');
import  {loginType} from './../../src/types/api/types';
const fs = require('fs');
let jwt = require('jsonwebtoken');
import NextCors from 'nextjs-cors';
const mongoS = new mongo();
const bcrypt = require('bcrypt');

const log4js = require("log4js");

log4js.configure({
    appenders: { 
        cApi: { type: "file", filename: "log/cloudLoginlog.log" }, 
        console: { type: 'console' },
    },
    categories: { default: { appenders: ['console', "cApi"], level: "all" },
                mailer: { appenders: ['console', 'cApi'], level: 'all' }, },
  });
const logger = log4js.getLogger("cApi");

export default async function handler(req: any, res: any) {
    console.log('hello')
    console.log(req.method);
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200,
    });
    if (req.method==='POST'){
        logger.info(req.body);
        let buf: loginType;
        if (typeof(req.body)==='string') {
            buf = JSON.parse(req.body)
        }
        else buf = req.body;
        console.log(buf);
        if ((buf.email) && (buf.email!=='') && (!buf.login)) {
            let login = await mongoS.find({email: buf.email});
            if (login.length!==0) buf.login = login[0].login;
        }
        if (buf.login) {
            const atoken = await bcrypt.hash((buf.pass+buf.login.trim()), '$2b$10$1'+String(process.env.SALT_CRYPT))
            let dat = await mongoS.find({password: atoken});
            logger.debug('Записей: ' + dat.length);
            if (dat.length) {
                delete(dat[0]._id);
                const token = dat[0].token;
                delete(dat[0].token);
                delete(dat[0].password);
                const nTok = await jwt.sign(dat[0], String(process.env.SALT_CRYPT));
                if (nTok!==token) {
                    mongoS.updateOne({login: dat[0].login}, {token: nTok});
                    dat[0].token=nTok;
                }
                else dat[0].token=token;
                res.status(200).json(dat[0]);
            }
            else {
                res.status(401).json({res: false});
            }
            console.log('\nend\n')
        }
        else {
            res.status(401).json({res: false});
        }
    }
}