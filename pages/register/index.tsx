import React, { useEffect, useState, useRef } from 'react';
import Box from "@mui/material/Box"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import { Typography } from '@mui/material';
import Api from './../../src/frontMech/api';
import {RegisterReqData} from './../../src/types/api/types';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { EMAIL_REGEXP } from '../../src/types/api/regex';

interface passControl {
    first: string,
    last: string
}

const textValues: {name: string, label: string, type: string}[] = [
    {name: 'login', label: 'Логин', type: 'text'},
    {name:"email", label:"Email", type: 'email'},
    {name:"first_name", label:"Имя", type: 'text'},
    {name:"last_name", label:"Фамилия", type: 'text'}
]

export default function Registration () {

    const [open, setOpen] = useState<boolean>();
    const [height, setHeight] = useState<number>(0);
    const [passControl, setPassControl] = useState<passControl>({first: '', last: ''});
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loginBored, setLoginBored] = useState<boolean>(false);
    const [errorState, setErrorState] = useState
        <{login: boolean, email: boolean, first_name: boolean, last_name: boolean}>
        ({login: false, email: false, first_name: false, last_name: false});

    useEffect(()=>{
        setOpen(true);
        setHeight(window.innerHeight);
        const handleResize = (event: any) => {
            setHeight(event.target.innerHeight);
            console.log(event.target.innerHeight)
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [])

    const handleClickShowPassword = () => setShowPassword((show) => !show);
  
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoginBored(false);
        const form = new FormData(event.currentTarget);
        let data: RegisterReqData = {
            email: String(form.get('email')),
            login: String(form.get('login')),
            password: String(form.get('password')),
            first_name: String(form.get('first_name')),
            last_name: String(form.get('last_name')),
        };
        let readyToSend: boolean = true;
        let errObj: {login: boolean, email: boolean, first_name: boolean, last_name: boolean} = {login: false, email: false, first_name: false, last_name: false};
        for (const dd in data) {
            if (((data as any)[dd]==='')&&dd!=='password') {
                (errObj as any)[dd] = true;
                readyToSend = false;
            }
            if ((dd==='email')&&(!EMAIL_REGEXP.test((data as any)[dd]))) {
                readyToSend = false;
                errObj={...errObj, email: true}
            }
        }
        setErrorState(errObj);
        console.log(data);
        if (readyToSend) {
            Api.register(data)
            .then((res)=>{
                console.log(res);
                setOpen(false);
                localStorage.setItem('cloudToken', res.data.token);
                localStorage.setItem('cloudAToken', res.data.atoken);
                window.location.href='/';
            })
            .catch((e)=>{
                console.log(e);
                if (e.response.status === 401)
                {
                    setErrorState({...errorState, login: true});
                    setLoginBored(true);
                }
            })
        }
    }

    const textSX = {
        margin: 2,
        width: '280px',
        backgroundColor: 'white',
        boxShadow: '0 0 12px 8px white'
    }

    return (
        <Fade in={true}>
            <Box sx={height>400? 
                {display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100vh'} :
                {}
            }>
                <Box sx={{
                    width: '1px',
                    height: '300px',
                    backgroundColor: 'mediumaquamarine',
                    position: 'absolute',
                    top: '50vh',
                    left: '50vw',
                    transform: 'translateY(-50%)',
                    boxShadow: '0 0 200px 300px mediumaquamarine',
                    zIndex: 0
                }} />
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{display: 'grid', justifyContent: 'center', margin: 2}}>
                    <Box sx={{display: 'grid', justifyContent: 'center', margin: 2, justifyItems: 'center'}}>
                        {loginBored?<Typography sx={{zIndex: 5, width: '50%', textAlign: 'center', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 0 12px 8px white'}} color='error'>Логин занят</Typography>:<Box sx={{height: '24px'}} />}
                        {textValues.map((item: {name: string, label: string, type: string}, index: number)=>{
                            return (<Fade in={open} timeout={index*500} key={item.name}>
                                <TextField sx={textSX} name={item.name} label={item.label} error={(errorState as any)[item.name]} type={item.type}/>
                            </Fade>)
                        })}
                        <Fade in={open} timeout={textValues.length * 500}>
                        <TextField 
                            name="password" 
                            sx={textSX}
                            label="Пароль" 
                            type={showPassword ? 'text' : 'password'}                        
                            InputProps={{
                                endAdornment:
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="Не скрывать"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                            }}
                            value={passControl.first} 
                            onChange={({target})=>setPassControl({...passControl, first: target.value})}
                        /></Fade>
                        
                        <Fade in={open} timeout={(textValues.length + 1) * 500}><TextField
                            error={passControl.first.length>5&&passControl.first!==passControl.last} 
                            label="Повтори пароль" 
                            type={showPassword ? 'text' : 'password'}   
                            sx={textSX}                     
                            InputProps={{
                                endAdornment:
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="Скрывать"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }}
                            value={passControl.last} 
                            onChange={({target})=>setPassControl({...passControl, last: target.value})}
                        /></Fade>
                        {passControl.first.length>5&&passControl.first!==passControl.last?
                            <Typography color='error' sx={{textAlign: 'center', zIndex: 5, width: '60%', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 0 12px 8px white'}}>Пароли отличаются</Typography>:
                            <Box sx={{height: '24px'}} />}
                    </Box>
                    <Fade in={passControl.first.length>5&&passControl.first===passControl.last&&open}>
                        <Button variant="contained" type="submit" sx={{boxShadow: '0 0 10px 8px white'}}>Регистрация</Button>
                    </Fade>
                </Box>
            </Box>
        </Fade>
    )
}