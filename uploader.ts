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
export {};
const dir = process.cwd();

app.use(cors());

app.use(cookieParser('secret key'));

app.get("/openLinc*", async function (req: any, res: any) {
    var filePath = '';
    var folderPath = '';
    if (req?.query && req.query?.tok && req.query?.tok !== '') {
        const subPath = jwt.verify(decodeURI(req.query.tok), String(process.env.SIMPLETOK));
        console.log(subPath);
        filePath = path.normalize(path.join(dir, path.normalize('data/' + decodeURI(subPath.addr)), subPath.name));
        folderPath = path.join(dir, path.normalize('data/' + subPath.addr));
        let addrArr: string[] = (path.normalize(subPath.addr)).split(path.sep);
        addrArr[0] = 'data';
        addrArr.pop();
        let access = false;
        for (let i = addrArr.length; i>1; i--) {
            let middlPath = '';
            for (let j = 0; j<i; j++) middlPath+='/'+addrArr[j];
            middlPath = path.join(dir, middlPath, '/%%%ssystemData.json');
            if (fs.existsSync(middlPath)) {
                const secureJson = JSON.parse(fs.readFileSync(middlPath));
                if ((secureJson?.['/'])||(i===addrArr.length&&secureJson?.[subPath.name])){
                    console.log('access denied');
                    access = true;
                    break;
                }
            }
            console.log(middlPath);
        }
        console.log(addrArr);
        if (access) {
            if (subPath.type) res.send(`<h4>Адрес: ${filePath}</h4><h4>Тип: 'Папка'</h4><h4>Имя файла или папки: ${subPath.name}</h4><h4>Доступ ${access?'Разрешен':'Запрещен'}</h4>`);
            else {    
                console.log('выдаем')
                console.log(filePath);
                fs.readFile(decodeURI(encodeURI(filePath)), function (error: any, dataB: any) {
                    if (error) {
                        res.statusCode = 404;
                        res.end("Resourse not found!");
                    }
                    else {
                        res.sendFile(dataB);
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
    var filePath = '';
    if (req?.cookies && req.cookies?.token !== '') {
        var dat = await mongoS.find({ token: req.cookies.token });
        if (dat.length)
            filePath = path.normalize('data/' + dat[0].login + '/' + decodeURI(req.url.substr(9)))
        else {
            res.statusCode = 404;
            res.end("Resourse not found!");
        }
    }
    else console.log('smth wrong');
    console.log(filePath);
    fs.readFile(filePath, function (error: any, data: any) {
        if (error) {
            res.statusCode = 404;
            res.end("Resourse not found!");
        }
        else {
            console.log('send');
            res.end(data);
            console.log('prog work');
            fs.unlinkSync(filePath);
        }
    });
})

app.get("/data*", async function (request: any, response: any) {
    var filePath = '';
    if (request?.cookies && request.cookies?.token !== '') {
        var dat = await mongoS.find({ token: request.cookies.token });
        if (dat.length)
            filePath = path.normalize('data/' + dat[0].login + '/' + decodeURI(request.url.substr(6)))
        else {
            response.statusCode = 404;
            response.end("Resourse not found!");
        }
    }
    else console.log('smth wrong');
    console.log(filePath);
    fs.readFile(filePath, function (error: any, data: any) {
        if (error) {
            response.statusCode = 404;
            response.end("Resourse not found!");
        }
        else {
            response.end(data);
        }
    });
});
  
app.use(express.static(__dirname));

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
    if(!filedata)
        res.send({res: 'error'});
    else
    {
        let ddir: string[] = [];
        try {
            fs.readdirSync(path.normalize(`data/${folder}`), { withFileTypes: true });
            console.log('Папка найдена');
        } catch (e: any) {
            fs.mkdirSync(path.normalize(`data/${folder}`));
            console.log('Папка успешно создана');
        }
        fs.rename(path.normalize(`uploads/${decodeURI(req.headers.user)}-${decodeURI(req.headers.fname)}`), path.normalize(`data/${folder}/${decodeURI(req.headers.fname)}`), (err: any) => {
          if(err) throw err; // не удалось переместить файл
            console.log('Файл успешно перемещён');
        });
        res.send({res: 'ok', addr: `data/${decodeURI(req.headers.fname)}`});
    }
});

app.listen(8800, ()=>console.log('start'));