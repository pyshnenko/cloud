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
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddButton from '../src/frontDesign/addButton'

const options = [
    'Открыть',
    'Скачать',
    'Переименовать',
    'Переместить',
    'Удалить'
  ];

export default function Index() {
    const [datal, setDatal] = useState<string>();
    const [path, setPath] = useState<string>('/');
    const [files, setFiles] = useState<{directs: string[], files: string[]}>();
    const [anchorEl, setAnchorEl] = useState<{elem: null | HTMLElement, index: number}>({elem: null, index: -1});
    const menuOpen = Boolean(anchorEl.elem);

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
            if (e.message === 'jwt malformed' || e.message === 'jwt expired') {
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
                        //User.exit();
                        //window.location.href='/login';
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
        console.log(path);
        if (User.getAuth()) {
            console.log('upd');
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

    const folder = async (location: string = '/') => {
        console.log(userData);
        let data: any = await Api.askLS(User.getToken(), location);
        setFiles({directs: data.data.directs, files: data.data.files});
        //Api.askLS(User.getToken());
    }

    const menuClose = () => {
        setAnchorEl({elem: null, index: -1});
    }

    const menuClick = (action: string, index: number, path: string) => {
        if (files) {
            const objName = index<files.directs.length ? files.directs[index] : files.files[index-files.directs.length];
            if (action === 'Открыть') setPath(path + '/' + objName);
            else if (action === 'Удалить') console.log('Удалить ' + objName)
            menuClose();
        }
    }
 
    async function handleClick(event: any) {
        event.preventDefault();
        console.log(event.target.textContent);
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
            {files&&<AddButton path={path} setPath={setPath} files={files} />}
            <h1>{datal}</h1>        
            <ButtonGroup variant="text" aria-label="text button group">
                <Button onClick={()=>window.location.href='/login'}>Войти</Button>
                <Button onClick={()=>window.location.href='/register'}>Регистрация</Button>
                <Button onClick={()=>folder()}>О сайте</Button>
            </ButtonGroup>
            {User.getAuth()&&<div role="presentation" style={{zIndex: 10}}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Typography color="inherit" onClick={()=>setPath('/')} sx={{cursor: 'pointer'}}>
                        {userData.login}
                    </Typography>
                    {
                        path.split('/').map((item: string, index: number)=>{
                            if (item !== '') return <Typography key={index} onDoubleClick={()=>setPath(backPath(index))} sx={{cursor: 'pointer'}}>{item}</Typography>
                        })
                    }
                </Breadcrumbs>
            </div>}
            <Box sx={{display: 'inline-flex', alignItems: 'flex-start', flexWrap: 'wrap'}}>
                {files?.directs.map((item: string, index: number)=> {
                    return (
                        <Box sx={{display: 'flex', flexWrap: 'wrap', flexDirection: 'row', alignItems: 'flex-start'}} key={item}>
                            <Button                                  
                                onContextMenu={(event: React.MouseEvent<HTMLElement>)=>{setAnchorEl({elem: event.currentTarget, index: index}); event.preventDefault()}}
                                onDoubleClick={()=>setPath(path+'/'+item)} 
                                sx={{display: 'column-flex', maxWidth: '100px', maxHeight: '120px', overflowWrap: 'anywhere'}}
                            >
                                <FolderIcon sx={{zoom: 2.5}} />
                                <Typography sx={{width: '85px'}}>{item.length>15?(item.slice(0, 12) + `${item.length>12?'...':''}`):item}</Typography>
                            </Button>
                            <IconButton
                                sx={{position: 'relative', right: '15px', top: '0px'}}
                                aria-haspopup="true"
                                onClick={(event: React.MouseEvent<HTMLElement>)=>setAnchorEl({elem: event.currentTarget, index: index})}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        </Box>
                    )
                })}
                {files?.files.map((item: string, index: number)=> {
                    return (
                        <Box sx={{display: 'flex', flexWrap: 'wrap', flexDirection: 'row', alignItems: 'flex-start'}} key={item}>
                            <Button 
                                onContextMenu={(event: React.MouseEvent<HTMLElement>)=>{
                                    setAnchorEl({elem: event.currentTarget, index: index+files.directs.length}); 
                                    event.preventDefault()
                                }}
                                sx={{display: 'column-flex', maxWidth: '100px', maxHeight: '120px', overflowWrap: 'anywhere'}}
                            >
                                {item.slice(-3)==='txt'?<TextSnippetIcon sx={{zoom: 2.5}} />:<InsertDriveFileIcon sx={{zoom: 2.5}} />}
                                <Typography sx={{width: '85px'}}>{item.length>15?(item.slice(0, 12) + `${item.length>12?'...':''}`):item}</Typography>
                            </Button>
                            
                            <IconButton
                                sx={{position: 'relative', right: '15px', top: 0}}
                                aria-haspopup="true"
                                onClick={(event: React.MouseEvent<HTMLElement>)=>{
                                    setAnchorEl({elem: event.currentTarget, index: index+files.directs.length}); 
                                    event.preventDefault()
                                }}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        </Box>
                    )
                })}
            </Box>
            <div>
                <Menu
                    id="long-menu"
                    MenuListProps={{
                    'aria-labelledby': 'long-button',
                    }}
                    anchorEl={anchorEl.elem}
                    open={menuOpen}
                    onClose={menuClose}
                    PaperProps={{
                        style: {
                            maxHeight: 45 * 4.5,
                            width: '20ch',
                        },
                    }}
                >
                    {files&&options.map((option: string) => {
                        if (anchorEl.index<files?.directs.length || option!=="Открыть")
                            return <MenuItem 
                                key={option} 
                                sx={{color: option==='Удалить'?'red':'inherit'}}
                                onClick={()=>{menuClick(option, anchorEl.index, path)}}>
                                {option}
                            </MenuItem>
                    })}
                </Menu>
            </div>
        </Box>
    )
}