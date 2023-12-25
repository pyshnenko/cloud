import React, { useEffect, useState, useRef } from 'react';
import Box from "@mui/material/Box"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import Api from './../../src/frontMech/api';

export default function Login () {

    const [width, setWidth] = useState<number>(0);
    const [error, setError] = useState<boolean>(false);

    useEffect(()=>{
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
        const form = new FormData(event.currentTarget);
        const email: string = String(form.get('email'));
        const password: string = String(form.get('password'));
        Api.login({pass: password, email: email.includes('@') ? email: undefined, login: email.includes('@') ? undefined: email})
        .then((res)=> {
            console.log('res');
            setError(false);
        })
        .catch((e)=>{
            console.log(e.response.status);
            setError(true);
        });
    }

    return (
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
            <Box sx={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '90vh', justifyContent: 'center', zIndex: 10}} 
                component="form" noValidate onSubmit={handleSubmit}>
                {error&&<Typography color="error" sx={{padding: 1, zIndex: 20}}>Неверные данные</Typography>}
                <TextField error={error} sx={textStyle} name="email" label="Логин/email" variant="outlined" />
                <TextField sx={textStyle} name="password" label="Пароль" variant="outlined" />
                <Box sx={{zIndex: 20}}>
                    <Button sx={{margin: 1, boxShadow: '0 0 30px 10px white'}} variant="contained" type="submit">Вход</Button>
                    <Button sx={{margin: 1, boxShadow: '0 0 30px 10px white'}} variant="contained" color="success"
                        onClick={()=>console.log('reg')}    
                    >Регистрация</Button>
                </Box>
            </Box>
        </Box>
    )
}