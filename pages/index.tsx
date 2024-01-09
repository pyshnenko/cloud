require('dotenv').config();
import jwt from 'jsonwebtoken';
import React, { useEffect, useState, useRef } from 'react';
import {TokenLocalData} from '../src/types/api/types';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Api from './../src/frontMech/api';
import User from './../src/frontMech/user';

export default function Index() {
    const [datal, setDatal] = useState<string>();


    useEffect(()=>{
        const crypt: string = String(localStorage.getItem('cloudAToken'));
        console.log(crypt);
        const saved: string = String(localStorage.getItem('cloudToken'));
        console.log(saved);
        let decr: TokenLocalData & {exp: number};
        try {
            decr = jwt.verify(saved, crypt) as TokenLocalData & {exp: number}
            console.log(decr);
            console.log((new Date(decr.iat*1000)).toLocaleString())
            console.log((new Date(decr.exp*1000)).toLocaleString())
            User.setToken(saved, crypt);
            folder();
            setDatal(decr.login)
        } catch(e: any) {
            setDatal('токен протух');
            console.log(e);
            console.log(e.message);
            if (e.message === 'jwt expired') {
                console.log(e.expiredAt);
                const date = new Date(e.expiredAt);
                const days: number = (Number(new Date())- Number(date))/(1000*60*60*24);
                console.log(`days: ${days}`);
                if (days > 3) window.location.href='/';
                else {
                    Api.tokenUPD(saved)
                    .then((res)=>{
                        console.log(res);
                        User.setToken(res.data.token, res.data.atoken);
                        folder();
                        setDatal(decr.login)
                    })
                    .catch((e)=>{
                        console.log(e);
                        User.exit();
                        window.location.href='/login';
                    });
                }
            }
        }
    }, [])

    const folder = (location: string = '/') => {
        console.log(User.getToken());
        //Api.askLS(User.getToken());
    }

    return (
        <Box>
            <h1>{datal}</h1>        
            <ButtonGroup variant="text" aria-label="text button group">
                <Button onClick={()=>window.location.href='/login'}>Войти</Button>
                <Button onClick={()=>window.location.href='/register'}>Регистрация</Button>
                <Button onClick={()=>folder()}>О сайте</Button>
            </ButtonGroup>
        </Box>
    )
}