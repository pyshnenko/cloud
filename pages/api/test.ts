import {NextRequest, NextResponse} from "next/server";
import type {NextApiRequest, NextApiResponse} from 'next';
import {cookies} from "next/headers";

const axios = require('axios');
const socketUrl = 'http://localhost:8801/socket';

interface CooKieToken {
    token: string
}

export default async function handler(req: NextRequest, res: NextApiResponse) {
    console.log('test');
    let token: string = 'no token';
    if (req?.cookies) {
        let ccc: CooKieToken = (req.cookies as any)
        token = ccc.token || 'no token';
        console.log(ccc.token)
    }
    else console.log('no cookies');
    //axios.post(socketUrl, {text: `sim800l connected\r\n${req.query.a}\r\nsms: ${req.query.sms}`})
    console.log('res')
    res.status(200).json({res: new Date().toLocaleString(), cookies: token});
}