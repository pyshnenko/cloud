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
        cApi: { type: "file", filename: "log/cloudResetPasswordlog.log" }, 
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
            if (login.length!==0) {
                buf.login = login[0].login;
                res.status(200).json(login[0]);
            }
            else {
                res.status(401).json({res: false});
            }
        }
        else {
            res.status(401).json({res: false});
        }
    }
}