import React, { useEffect, useState, useRef } from 'react';
import Box from "@mui/material/Box"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import { Typography } from '@mui/material';
import Api from './../../src/frontMech/api';
import Head from 'next/head';

export default function Login () {

    const [width, setWidth] = useState<number>(0);
    const [error, setError] = useState<{email:boolean, pass: boolean, text: string}>({email: false, pass: false, text: ''});
    const [open, setOpen] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [demo, setDemo] = useState<boolean>(false);
    const [emailresetMessage, setEmailResetMessage] = useState<{visible: boolean, text: string}>({visible: false, text: ''});

    useEffect(()=>{
        setOpen(true);
        const handleResize = (event: any) => {
            setWidth(event.target.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [])

    const textStyle = {
        margin: 1, 
        zIndex:20, 
        backgroundColor: 'white',
        boxShadow: '0 0 30px 10px white'
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('push');
        console.log(demo);
        const form = new FormData(event.currentTarget) || '';
        const email: string = String(form.get('email')) || (demo ? 'demo' : '');
        const password: string = String(form.get('password')) || (demo ? 'demodemo' : '');
        if ((email==='')||(password==='')) setError({email: true, pass: true, text: 'Заполни поля'})
        else {
            setError({email: false, pass: false, text: ''})
            Api.login({pass: password, email: email.includes('@') ? email: undefined, login: email.includes('@') ? undefined: email})
            .then((res)=> {
                console.log(res);
                localStorage.setItem('cloudToken', res.data.token);
                localStorage.setItem('cloudAToken', res.data.atoken);
                setError({email: true, pass: true, text: 'Неверные данные'});
                setOpen(false);
                window.location.href='/';
            })
            .catch((e)=>{
                console.log(e.response.status);
                setError({email: true, pass: true, text: 'Неверные данные'});
            });
        }
    }

    return (
        <Fade in={open} timeout={500}>
            <>
                <Head>
                    <link rel="shortcut icon" href="/favicon.ico" />
                </Head>
                <Box>
                    <Box sx={{    
                        position: 'absolute',
                        top: '50vh',
                        left: '50vw',
                        width: '10px',
                        height: '10px',
                        backgroundColor: 'burlywood',
                        boxShadow: `-10px 0 250px 300px burlywood`,
                        borderRadius: '100px',
                        zIndex: 1
                    }}/>
                    {emailresetMessage.visible ? <Typography>{emailresetMessage.text}</Typography>:
                    <Box sx={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '90vh', justifyContent: 'center', zIndex: 10}} 
                        component="form" noValidate onSubmit={handleSubmit}>
                        {error&&<Typography color="error" sx={{padding: 1, zIndex: 20}}>{error.text}</Typography>}
                        <TextField error={error.email} sx={textStyle} id="loginBox" name="email" label="Логин/email" variant="outlined" onChange={({target}: any)=>{setEmail(target.value)}} />
                        <TextField error={error.pass} sx={textStyle} type="password" name="password" label="Пароль" variant="outlined" />
                        <Box sx={{zIndex: 20}}>
                            <Button sx={{margin: 1, boxShadow: '0 0 30px 10px white'}} variant="contained" type="submit">Вход</Button>
                            <Button sx={{margin: 1, boxShadow: '0 0 30px 10px white'}} variant="contained" color="success"
                                onClick={()=>{
                                    setOpen(false);
                                    window.location.href = '/register';
                                }}>Регистрация</Button>
                        </Box>
                        <Button 
                        sx={{margin: 1, boxShadow: '0 0 30px 10px white', zIndex: 1, width: '228px'}} 
                        variant="contained" 
                        color="secondary"
                        onClick={()=>{setDemo(true)}} 
                        type="submit"
                        >
                            Демонстрационный режим
                        </Button>
                    </Box>}
                </Box>
            </>
        </Fade>
    )
}