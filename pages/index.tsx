require('dotenv').config();
import jwt from 'jsonwebtoken';
import React, { useEffect, useState, useRef } from 'react';

export default function Index() {
    const [datal, setDatal] = useState<string>();


    useEffect(()=>{
        const crypt: string = String(localStorage.getItem('cloudAToken'));
        console.log(crypt);
        const saved: string = String(localStorage.getItem('cloudToken'));
        console.log(saved);
        let decr = jwt.verify(saved, crypt)
        console.log(decr);
        setDatal(decr.login)
    }, [])
    //var decoded = jwt.verify(token, 'shhhhh');
    //console.log(decoded.foo);

    return <h1>{datal}</h1>
}