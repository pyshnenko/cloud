require('dotenv').config();
import type {NextApiRequest, NextApiResponse} from 'next';
import cookie from "cookie";
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
let jwt = require('jsonwebtoken');
import NextCors from 'nextjs-cors';
import { FSType } from '../../src/types/api/types';
const dir = process.cwd();
const mongo = require('./../../src/mech/mongo');
const mongoS = new mongo();
const {access_check, makeZip, body_data} = require('../../src/mech/requested_feature');
//const {FSType} = require('../../src/types/api/types');

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
//
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200,
    });
    if (req.method==='POST'){
        logger.info(req.body);
        const buf: FSType = body_data(req.body);
        const oldToken: string = req.headers.hasOwnProperty('authorization')? (
            (req.headers?.authorization ? req.headers?.authorization.slice(7):null) || buf?.token || ''): buf?.token || '';
        let dat = await mongoS.find({token: oldToken}, true);
        let access: {result: boolean, login?: string} = (dat.length===0||buf?.incognit)?access_check(buf.location, buf?.name||'/', true) as {result: boolean, login?: string}:{result: false};
        if (access.result===true) dat[0] = {login: access.login};
        logger.info(dat[0]?.login);
        console.log(dat);
        if (dat.length) {
            const location = access.result ? path.join(dir, 'data', path.normalize(buf.location)) : path.join(dir, 'data', dat[0].login, path.normalize(buf.location))
            logger.debug(path.normalize(location));
            if (buf.action === 'mkdir' && buf?.name!=='') {
                try {
                    logger.debug(`folder for ${dat[0].login} created`)
                    await fs.mkdirSync(path.join(location, buf.name));
                    res.setHeader('Set-Cookie', cookie.serialize('token', dat[0].token, {sameSite: 'none'}))
                    res.status(200).json([]);
                }
                catch (e: any) {
                    logger.error(e);
                    res.status(500).json({message: 'folder not created'})
                }
            }
            else if (buf?.name && buf.action === 'rm' && buf?.name!=='') {
                let folders: {dir: string[], files: string[]} = {dir: [], files: []};
                fs.readdirSync(location, { withFileTypes: true }).filter((d: any)=> {
                    if (d.isDirectory()) folders.dir.push(d.name)
                    else folders.files.push(d.name)
                });
                if (folders.dir.includes(buf.name)) {
                    try {
                        fs.rmdirSync(path.join(location, buf.name), {recursive:true});
                        logger.info(`Directory ${location}/${buf.name} deleted by ${dat[0].login}`);
                        res.setHeader('Set-Cookie', cookie.serialize('token', dat[0].token, {sameSite: 'none'}))
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
                        res.setHeader('Set-Cookie', cookie.serialize('token', dat[0].token, {sameSite: 'none'}))
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
                if (access.result||(files.includes(dat[0]?.login))) {
                    let userFiles = {
                        directs: fs.readdirSync(location, { withFileTypes: true }).filter((d: any) => d.isDirectory()).map((d: any)=> d.name),
                        files: fs.readdirSync(location, { withFileTypes: true }).filter((d: any) => !d.isDirectory()).map((d: any)=> d.name),
                    }
                    if (userFiles.files.includes('%%%ssystemData.json')) userFiles.files.splice(userFiles.files.indexOf('%%%ssystemData.json'), 1)
                    res.setHeader('Set-Cookie', cookie.serialize('token', dat[0].token, {sameSite: 'none'}))
                    res.status(200).json(userFiles);
                }
                else {
                    try {
                        logger.debug(`folder for ${dat[0].login} created`)
                        await fs.mkdirSync(path.join(dir, 'data', dat[0].login));
                        res.setHeader('Set-Cookie', cookie.serialize('token', dat[0].token, {sameSite: 'none'}))
                        res.status(200).json([]);
                    }
                    catch (e: any) {
                        logger.error(e);
                        res.status(500).json({message: 'folder not created'})
                    }
                }
            }
            else if ((buf.action === 'chmod')&&(buf?.name)&&(buf.name!=='')) {
                const directs:string[] = fs.readdirSync(location, { withFileTypes: true })
                    .filter((d: any) => d.isDirectory()).map((d: any)=> d.name)
                let openData: any = {};
                try {
                    let openData: any = {};
                    if (fs.existsSync(path.join(location, '%%%ssystemData.json'))) {
                        openData = JSON.parse(fs.readFileSync(path.join(location, '%%%ssystemData.json')));
                    }
                    openData[buf.name] = true;
                    fs.writeFileSync(path.join(location, '%%%ssystemData.json'), JSON.stringify(openData));
                    res.setHeader('Set-Cookie', cookie.serialize('token', dat[0].token, {sameSite: 'none'}))
                    res.status(200).json({
                        tok: jwt.sign({addr: path.normalize(path.join(dat[0].login, path.normalize(buf.location))),//'/'+dat[0].login+'/'+location), 
                            type: (directs.includes(buf.name)||buf.name==='/')?true: false,
                            name: buf.name}, String(process.env.SIMPLETOK)),
                        type: (directs.includes(buf.name)||buf.name==='/')?true: false,
                        name: buf.name
                    })
                } catch(err) {
                    logger.error(err)
                    res.status(500).json({message: 'some error'})
                }
            }
            else if (buf.action === 'tar') {
                const archive = archiver('zip', { zlib: { level: 9 } });
                archive.on('warning', (err: any) => {
                    if (err.code === 'ENOENT') {
                        logger.error('Warning:', err.message);
                    } else {
                        throw err;
                    }
                });
                archive.on('error', (err: any) => {
                    throw err;
                });
                makeZip(archive, location, dat[0].login, location);
                logger.debug('endMakeZip');
                res.setHeader('Set-Cookie', cookie.serialize('token', dat[0].token, {sameSite: 'none'}))
                res.status(200).json({addr: 'oneTime/' + buf.location + '/' + 'Archive.zip' })
                //res.setHeader('Content-disposition', 'attachment; filename=archive.zip');
                //res.setHeader('Content-type', 'application/zip');
                //archive.pipe(res);
            }
        }
        else res.status(401).json({mess: 'error'})
    }
}