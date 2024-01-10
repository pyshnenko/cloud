require('dotenv').config();
import jwt from 'jsonwebtoken';
import React, { useEffect, useState, useRef } from 'react';
import {TokenLocalData} from '../src/types/api/types';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Api from './../src/frontMech/api';
import {User, userData} from './../src/frontMech/user';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export default function Index() {
    const [datal, setDatal] = useState<string>();
    const [path, setPath] = useState<string>('/');
    const [dialogOpen, setDialogOpen] = useState<{visible: boolean, name: string}>({visible: false, name: ''});
    const [files, setFiles] = useState<{directs: string[], files: string[]}>();

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
            User.setToken(saved, crypt, decr);
            console.log(userData);
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
                        let usData = res.data;
                        delete(usData.token);
                        delete(usData.atoken);
                        User.setToken(res.data.token, res.data.atoken, usData);
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
        console.log(userData)
    }, [])

    useEffect(()=> {
        console.log(files)
    }, [files])

    useEffect(()=>{
        if (User.getAuth()) {
            folder(path);
        }
    }, [path])

    const backPath = (index: number) => {
        let pathArr = path.split('/');
        let newPath = '';
        for (let i = 0; i<=index; i++) {
            if (pathArr[i]!=='') newPath+=('/'+pathArr[i])
        }
        return newPath;
    }

    const createFolder = (name: string) => {
        Api.askLS(User.getToken(), path, 'mkdir', name)
        .then((res: any)=>{
            console.log(res);
        }).catch((e: any)=>console.log(e));
        setDialogOpen({visible: false, name: ''});
        setPath(path+'/'+name);
    }

    const folder = async (location: string = '/') => {
        console.log(userData);
        let data: any = await Api.askLS(User.getToken(), location);
        setFiles({directs: data.data.directs, files: data.data.files});
        //Api.askLS(User.getToken());
    }

    async function handleClick(event: any) {
        event.preventDefault();
        console.log(event.target.textContent);
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <h1>{datal}</h1>        
            <ButtonGroup variant="text" aria-label="text button group">
                <Button onClick={()=>window.location.href='/login'}>Войти</Button>
                <Button onClick={()=>window.location.href='/register'}>Регистрация</Button>
                <Button onClick={()=>folder()}>О сайте</Button>
            </ButtonGroup>
            {User.getAuth()&&<div role="presentation">
                <Breadcrumbs aria-label="breadcrumb">
                    <Typography color="inherit" onClick={()=>setPath('/')}>
                        {userData.login}
                    </Typography>
                    {
                        path.split('/').map((item: string, index: number)=>{
                            if (item !== '') return <Typography key={index} onDoubleClick={()=>setPath(backPath(index))}>{item}</Typography>
                        })
                    }
                </Breadcrumbs>
            </div>}
            <Box sx={{display: 'inline-flex', alignItems: 'flex-start'}}>
                {files?.directs.map((item: string)=> {
                    return (
                        <Button key={item} onDoubleClick={()=>setPath(path+'/'+item)} sx={{display: 'column-flex', maxWidth: '100px', maxHeight: '120px', overflowWrap: 'anywhere'}}>
                            <FolderIcon sx={{zoom: 2.5}} />
                            <Typography>{item.length>15?(item.slice(0, 12) + `${item.length>12?'...':''}`):item}</Typography>
                        </Button>
                    )
                })}
                {files?.files.map((item: string)=> {
                    return (
                        <Button key={item} sx={{display: 'column-flex', maxWidth: '100px', maxHeight: '120px', overflowWrap: 'anywhere'}}>
                            {item.slice(-3)==='txt'?<TextSnippetIcon sx={{zoom: 2.5}} />:<InsertDriveFileIcon sx={{zoom: 2.5}} />}
                            <Typography>{item.length>15?(item.slice(0, 12) + `${item.length>12?'...':''}`):item}</Typography>
                        </Button>
                    )
                })}
            </Box>
            {dialogOpen.visible ?
            <Box>
                <Typography>Название папки</Typography>
                <TextField value={dialogOpen.name} error={files?.directs.includes(dialogOpen.name)} onChange={({target}: any)=>setDialogOpen({visible: true, name: target.value})}/>
                <Box>
                    {!files?.directs.includes(dialogOpen.name)&&<IconButton><CheckIcon color="success" onClick={()=>createFolder(dialogOpen.name)} /></IconButton>}
                    <IconButton onClick={()=>setDialogOpen({visible: false, name: ''})}><CloseIcon color="error" /></IconButton>
                </Box>
            </Box> :
            <Button onClick={()=>setDialogOpen({visible: true, name: ''})}>Новая папка</Button>}
        </Box>
    )
}