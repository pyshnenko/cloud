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
        cApi: { type: "file", filename: "log/cloudSearch.log" }, 
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
        let buf: {location: string, name: string, login?: string} = {location:  '/', name: ''};    
        if (req.body) {
            if (typeof(req.body)==='string') {
                buf = JSON.parse(req.body)
            }
            else buf = req.body;
        }
        console.log(buf);
        if (req.headers?.authorization && req.headers?.authorization!=='') {
            const token: string = req.headers?.authorization.slice(7);
            let dat = await mongoS.find({token: token});
            let access: {result: boolean, login?: string} = (dat.length===0)?access_check(buf.location, buf?.login||'/', true) as {result: boolean, login?: string}:{result: false};
            if (access.result===true) dat[0] = {login: access.login};
            if (dat.length) {
                const location = access.result ? path.join(dir, 'data', path.normalize(buf.location)) : path.join(dir, 'data', dat[0].login, path.normalize(buf.location))
                logger.debug(path.normalize(location));
                console.log('done');
                const files = {
                    directs: searchFolderRecurs(location, buf.name),
                    files: searchFilesRecurs(location, buf.name)
                }
                res.status(200).json(files)
            }
        }
        else res.status(401).json({mess: 'error'})
    }
}

function searchFilesRecurs(pathF: string, text: string, recursePath?: string) {
    let arr: string[] = [];
    fs.readdirSync(
        pathF, 
        { withFileTypes: true })
        .filter((d: any) => !d.isDirectory())
        .map((d: any)=> {if ((d.name.toLocaleUpperCase().includes(text.toLocaleUpperCase()))&&(d.name!=='%%%ssystemData.json')) arr.push(path.join(recursePath||'', d.name))})
    const dirs = fs.readdirSync(
        pathF, 
        { withFileTypes: true })
        .filter((d: any) => d.isDirectory())
        .map((d: any)=>d.name)
    for (let i=0; i<dirs.length; i++)
        arr = arr.concat(searchFilesRecurs(path.join(pathF, dirs[i]), text, path.join(recursePath||'', dirs[i])))
    for (let i = 0; i<arr.length; i++)
        arr = arr.map(item=>item.replaceAll('\\', '/'))
    return arr
}

function searchFolderRecurs(pathF: string, text: string, recursePath?: string) {
    let arr: string[] = [];
    const dirs = fs.readdirSync(
        pathF, 
        { withFileTypes: true })
        .filter((d: any) => d.isDirectory())
        .map((d: any)=>{
            if ((d.name.toLocaleUpperCase().includes(text.toLocaleUpperCase()))&&(d.name!=='%%%ssystemData.json')) 
                arr.push(path.join(recursePath||'', d.name))
            return d.name
        })
    for (let i=0; i<dirs.length; i++)
        arr = arr.concat(searchFolderRecurs(path.join(pathF, dirs[i]), text, path.join(recursePath||'', dirs[i])))
    for (let i = 0; i<arr.length; i++)
        arr = arr.map(item=>item.replaceAll('\\', '/'))
    return arr
}