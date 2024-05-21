require('dotenv').config();
const express = require("express");
const multer  = require("multer");
const cors = require('cors');
const fs = require('fs');
process.title='APIServerCloud';
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const mongo = require('./src/mech/mongo');
const mongoS = new mongo();
const jwt = require('jsonwebtoken');
const {access_check} = require('./src/mech/requested_feature');
const Redis = require("ioredis");

const redis = new Redis({
    port: Number(process.env.REDIS_PORT),
    host: String(process.env.REDIS_HOST),
    password: String(process.env.REDIS_PASS),
    db: 1
})

export {};
const dir = process.cwd();

app.use(cors());

app.use(cookieParser('secret key'));
app.use(express.static(__dirname));

app.get("/openLinc*", async function (req: any, res: any) {
    console.log('\n\n\n\n\nyep\n\n\n');
    var filePath = '';
    var folderPath = '';
    if (req?.query && req.query?.tok && req.query?.tok !== '') {
        const subPath = await jwt.verify(decodeURI(req.query.tok), String(process.env.SIMPLETOK));
        filePath = path.normalize(path.join(dir, 'data', subPath.addr, subPath.name));
        folderPath = path.join(dir, path.normalize('data/' + subPath.addr));
        if (access_check(subPath.addr, subPath.name)) {
            if (subPath.type) res.send(`<h4>Адрес: ${filePath}</h4><h4>Тип: 'Папка'</h4><h4>Имя файла или папки: ${subPath.name}</h4><h4>Доступ Разрешен</h4>`);
            else {    
                fs.readFile(filePath, function(error: any, data: any){              
                    if(error){                  
                        res.statusCode = 404;
                        res.end("Resourse not found!");
                    }   
                    else{
                        console.log('выдаем файл')
                        res.end(data);
                    }
                });
            }
        }
        else {
            res.statusCode=401;
            res.end('go out')
        }
    }
    else console.log('smth wrong');
})

app.get("/oneTime*", async function (req: any, res: any) {
    console.log('oneTime');
    let filePath: string = '', login: string='', access: boolean = false;
    if (req?.cookies && req.cookies?.token !== '') {
        let dat: {login: string}[] = await mongoS.find({ token: req.cookies.token }) as {login: string}[];
        if (dat.length) {access = true; login = dat[0].login}
        console.log(req.cookies.token);
        console.log(dat);
    }
    else access=access_check(login + '/' + decodeURI(req.url.substr(9)))
    if (access) {
        filePath = path.normalize(dir+'/data/' + login + '/' + decodeURI(req.url.substr(9)));
        console.log(filePath);
        fs.readFile(filePath, function(error: any, data: any){              
            if(error){                  
                res.statusCode = 404;
                res.end("Resourse not found!");
            }   
            else{
                res.end(data);
                console.log('delete')
                fs.unlinkSync(filePath);
            }
        });
    }
    else {
        res.statusCode = 404;
        res.end("Resourse not found!");
    }
})

app.get("/data*", async function (req: any, res: any) {
    var filePath = '';
    let access: boolean = false, login: string = '';    
    if (req?.cookies && req.cookies?.token !== '') {
        let dat: {login: string}[] = await mongoS.find({ token: req.cookies.token }) as {login: string}[];
        if (dat.length) {access = true; login = dat[0].login}
        console.log(req.cookies.token);
        console.log(dat);
    }
    else access=access_check(login + '/' + decodeURI(req.url.substr(9)))
    console.log(access);
    if (access) {
        filePath = path.normalize(dir+'/data/' + login + '/' + decodeURI(req.url.substr(6)));
        fs.readFile(filePath, function (error: any, data: any) {
        if (error) {
            res.statusCode = 404;
            res.end("Resourse not found!");
        }
        else {
            //response.sendFile(filePath)
            res.end(data);
        }
    })}
    else {        
        res.statusCode = 404;
        res.end("Resourse not found!");
    }
});
  

const storage = multer.diskStorage({
  destination: function (req: Request, file: Response, cb: any) {
    cb(null, 'uploads')
  },
  filename: function (req: any, file: any, cb: any) {
    cb(null, `${decodeURI(req.headers.user)}-${decodeURI(req.headers.fname)}`);
    //global.name = file.fieldname + '-' + uniqueSuffix;
  }
})

const upload = multer({ storage: storage })

app.use(upload.single("file"));
app.post("/upload", function (req: any, res: any, next: any) {
    console.log('im here');
    const folder = decodeURI(req.headers.folder);
    let filedata = req.body;
    console.log(req.body);
    console.log(req.headers);
    if(!filedata)
        res.send({res: 'error'});
    else
    {
        let ddir: string[] = [];
        checkPathCorrect(folder);
        fs.rename(path.normalize(`uploads/${decodeURI(req.headers.user)}-${decodeURI(req.headers.fname)}`), path.normalize(`data/${folder}/${decodeURI(req.headers.fname)}`), (err: any) => {
          if(err) throw err; // не удалось переместить файл
            console.log('Файл успешно перемещён');
        });
        res.send({res: 'ok', addr: `data/${decodeURI(req.headers.fname)}`});
    }
});

app.listen(8800, ()=>console.log('start'));

function checkPathCorrect(filePath: string) {

    let splitPath: string[] = path.normalize(filePath).replace(/\\/g,'/').split('/');
    let folder = ''
    for (let i = 0; i<splitPath.length; i++) {
        folder += ('/'+splitPath[i]);
        try {
            fs.readdirSync(path.normalize(`data/${folder}`), { withFileTypes: true });
            console.log('Папка найдена');
        } catch (e: any) {
            fs.mkdirSync(path.normalize(`data/${folder}`));
            console.log('Папка успешно создана');
        }
    }
}