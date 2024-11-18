const axios = require('axios');
const socketUrl = 'http://localhost:8801/socket';

export default async function handler(req: any, res: any) {

    console.log(req.query);
    axios.post(socketUrl, {text: `sim800l connected\r\n${req.query.a}\r\nsms: ${req.query.sms}`})
    res.status(200).json({res: new Date().toLocaleString()});
}