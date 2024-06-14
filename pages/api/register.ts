const mongo = require('./../../src/mech/mongo');
const mailSend = require('./../../src/mech/mail');
import  {RegisterReqData, RegisterReqSucc} from './../../src/types/api/types';
const mail = new mailSend('https://cloud.spamigor.ru/emailCheck', process.env.SKEY);
let jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import NextCors from 'nextjs-cors';
const mongoS = new mongo();

const log4js = require("log4js");

log4js.configure({
    appenders: { 
        cApi: { type: "file", filename: "log/cloudlog.log" }, 
        console: { type: 'console' },
    },
    categories: { default: { appenders: ['console', "cApi"], level: "all" },
                mailer: { appenders: ['console', 'cApi'], level: 'all' }, },
  });
const logger = log4js.getLogger("cApi");
const mails = log4js.getLogger('mailer');

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
        let buf: RegisterReqData;
        if (typeof(req.body)==='string') {
            buf = JSON.parse(req.body)
        }
        else buf = req.body;
        
        let dat = await mongoS.find({login: buf.login});
        logger.debug('Записей: ' + dat.length);
        if (dat.length) res.status(401).json({ status: 'bored', login: true });
        else if ((await mongoS.find({email: buf.email})).length) res.status(401).json({ status: 'bored', login: false });
        else {
            let atoken = await bcrypt.hash((buf.password+buf.login.trim()), '$2b$10$1'+String(process.env.SALT_CRYPT))
            let id = await mongoS.id() + 1;
            const saveData = {...buf, id, gold: 0, password: atoken, valid: false};
            let token = await jwt.sign(saveData, atoken.slice(8));//String(process.env.SALT_CRYPT));
            if (!(req.headers?.make==='example')) mongoS.incertOne({...saveData, token, password: atoken});
            const reqSucc: RegisterReqSucc = { atoken: atoken.slice(8), token, first_name: buf.first_name, last_name: buf.last_name, id, login: buf.login, email: buf.email, valid: false };
            res.status(200).json(reqSucc)
            console.log('MAIL');
            mail.sendMail(buf.email, buf.login);
            if (!(req.headers?.make==='example')) mails.info('Новый пользователь: ', buf.first_name);
        }
        console.log('\nend\n')
    }
    if (req.method==='GET') {
        let text = '11'//await mail.decryptHash(req.query.name.replaceAll(' ', '+'));
        let dat = await mongoS.find({login: text});    
        console.log(dat);
        await mongoS.updateOne({login: dat[0].login}, {valid: true});        
        res.status(200).json({ver: true});
    }
}