require('dotenv').config();
import jwt from 'jsonwebtoken';
import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import {TokenLocalData} from '../types/api/types';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Api from '../frontMech/api';
import {User, userData} from '../frontMech/user';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddButton from './addButton'
import FilePalette from './filePalette'
import Cookies from 'universal-cookie';
import download_file from '../frontMech/downloadFile';
import {Loading, useLoading} from '../hooks/useLoading';

const options = [
    'Открыть',
    'Скачать',
    'Поделиться',
    'Переименовать',
    'Переместить',
    'Удалить'
  ];

const imgEnd = [
    '.png',
    '.jpg',
    'jpeg'
]

const archEnd = [
    'rar',
    '.7z',
    'zip'
]

export default function Index({exPath, notVerify, bbPath}: {exPath?: string, notVerify?: boolean, bbPath?: string }) {
    const [datal, setDatal] = useState<string>();
    const [path, setPath] = useState<string>(exPath || '/');
    const [files, setFiles] = useState<{directs: string[], files: string[]}>();
    const [anchorEl, setAnchorEl] = useState<{elem: null | HTMLElement, index: number}>({elem: null, index: -1});
    const [animIn, setAnimIn] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<number>(-1);
    const menuOpen = Boolean(anchorEl.elem);
    const trig = useRef(true);

    const loading = useLoading;

    useEffect(()=>{
        loading(true, 'start');
        if (!notVerify&&trig.current) {
            trig.current=false;
            const crypt: string = String(localStorage.getItem('cloudAToken'));
            console.log(crypt);
            const saved: string = String(localStorage.getItem('cloudToken'));
            console.log(saved);
            let decr: TokenLocalData & {exp: number};
            try {
                decr = jwt.verify(saved, crypt) as TokenLocalData & {exp: number};
                console.log(decr);
                User.setToken(saved, crypt, decr);
                folder('/', saved);
                const cookies = new Cookies(null, {path: '/'});
                cookies.set('token', saved);
                setDatal(decr.login);
            } catch(e: any) {
                setDatal('токен протух');
                console.log(e);
                console.log(e.message);
                if (e){//.message === 'jwt malformed' || e.message === 'jwt expired') {
                    console.log(e.expiredAt);
                    const date = new Date(e.expiredAt);
                    const days: number = (Number(new Date())- Number(date))/(1000*60*60*24);
                    console.log(`days: ${days}`);
                    if (days > 5) window.location.href='/login';
                    else {
                        loading(true, 'tokenUPD');
                        Api.tokenUPD(saved, crypt)
                        .then((res: any)=>{
                            console.log(res);
                            let usData = res.data;
                            const token = res.data.token;
                            const atoken = res.data.atoken;
                            delete(usData.token);
                            delete(usData.atoken);
                            User.setToken(token, atoken, usData);
                            const cookies = new Cookies(null, {path: '/'});
                            cookies.set('token', token);
                            folder('/', token);
                            setDatal(usData.login);
                            loading(false, 'tokenUPD')
                        })
                        .catch((e: any)=>{
                            console.log(e);
                            User.exit();
                            window.location.href='/login';
                        });
                        loading(false, 'start');
                    }
                }
            }
            console.log(userData)
        }
        else {
            folder(path);
            setDatal('Путник')
        }
        loading(false, 'start');
    }, [])

    useEffect(()=> {
        console.log(files)
    }, [files])

    useEffect(()=>{
        console.log(path);
        if (User.getAuth()) {
            setAnimIn(false);
            let realLocation = '';
            const location = path;
            if (notVerify) {
                let arrLocation: string[] = location.split(location.indexOf('/')===-1?'\\':'/');
                console.log(arrLocation);
                if (arrLocation.includes(userData.login)) {
                    realLocation = location;
                    folder(realLocation);
                }
                else {
                    console.log(location);
                    realLocation = '/' + userData.login + '/'+ location.slice((location[0]==='/')?1:0 ) +'/';
                    console.log(realLocation);
                    setPath(realLocation);
                }
            }
            else {
                realLocation = location;
                folder(realLocation);
            }
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

    const folder = async (location: string = '/', newToken?: string) => {
        loading(true, 'folder');
        console.log(userData);
        console.log(User.getToken());
        let data: any;
        try {
            data = await Api.askLS(newToken||User.getToken(), location, 'ls', '', notVerify);
            console.log(data)
            setFiles({directs: data.data.directs, files: data.data.files});
        }
        catch(e){
            console.log(e)
            setFiles({directs: [], files: []});
        }
        finally {loading(false, 'folder'); setAnimIn(true)};
        //Api.askLS(User.getToken());
    }

    const menuClose = () => {
        setAnchorEl({elem: null, index: -1});
    }

    const fileType = (name: string) => {
        let item: string = name.toLocaleLowerCase().slice(-4);
        if (item === 'txt') return 'txt'
        else {
            let endText = 'other'
            imgEnd.forEach((itemP: string)=>{if (name.includes(itemP)) endText='picture'})
            archEnd.forEach((itemP: string)=>{if (name.includes(itemP)) endText='archive'})
            return endText
        }
        /*if (imgEnd.includes(item)) return 'picture'
        else if (archEnd.includes(item)) return 'archive'
        else return 'other'*/
    }

    const menuClick = (action: string, index: number, path: string) => {
        if (files) {
            const objName = index<files.directs.length ? files.directs[index] : files.files[index-files.directs.length];
            if (action === 'Открыть') setPath(path + objName + '/');
            else if (action === 'Скачать' && index>=files.directs.length) {
                console.log(action + ' ' + path + (objName));
                const cookies = new Cookies(null, {path: '/'});
                cookies.set('token', User.getToken());
                const fileAddr: string = encodeURI(`${window.location.href==='http://localhost:8799/'?'http://localhost:8800':''}/data/${path}${objName}`);
                download_file(fileAddr, objName);
                console.log(fileAddr);
            }
            else if (action === 'Скачать' && index < files.directs.length) {const cookies = new Cookies(null, {path: '/'});
                cookies.set('token', User.getToken());
                loading(true, 'save');
                Api.askLS(User.getToken(), path + '/' + files.directs[index], 'tar', '', notVerify)
                .then(async (res: any)=>{
                    console.log(res.data);
                    setTimeout((href: string, addr: string)=>
                        {download_file(encodeURI(href.includes('http://localhost:8799/')? ('http://localhost:8800/'+addr) : ('/'+addr))); loading(false, 'save')}, 
                        3000, 
                        window.location.href, 
                        res.data.addr) 
                    /*let file = new Blob([res.data], {type: "application/zip"});
                    FileSaver.saveAs(file, "hello world.zip");*/
                })
                .catch((e: any)=> {console.log(e); loading(false, 'save')});
            }
            else if (action === 'Удалить') {
                console.log(objName);
                loading(true, 'rm')
                Api.askLS(User.getToken(), path, 'rm', objName)
                .then((res: any)=>{folder(path); loading(false, 'rm')})
                .catch((e: any)=>console.log(e))
                .finally(()=>loading(false, 'rm'))
            }
            else if (action === 'Поделиться') {
                loading(true, 'chmod')
                Api.askLS(User.getToken(), (index<files.directs.length?path+objName:path), 'chmod', (index<files.directs.length?'/':objName))
                .then((res: any)=>{
                    window.open(encodeURI(`/download?tok=${encodeURI(res.data.tok)}&name=${res.data.name}&type=${res.data.type}`))
                })
                .catch((e: any)=>console.log(e))
                .finally(()=>loading(false, 'chmod'))
            }
            menuClose();
        }
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '98vh'}}>
            {files&&<AddButton path={path} setPath={setPath} files={files} folder={folder} notVerify={notVerify}/>}
            <Box sx={{display: 'flex', flexDirection: 'column', flexWrap: 'wrap', alignItems: 'center'}}>
                <h1 style={{margin: '4px'}}>{datal}</h1>        
                <ButtonGroup variant="text" aria-label="text button group">
                    <Button onClick={()=>window.location.href='/login'}>Войти</Button>
                    <Button onClick={()=>window.location.href='/register'}>Регистрация</Button>
                    <Button onClick={()=>folder()}>О сайте</Button>
                </ButtonGroup>
            </Box>
            {User.getAuth()&&<div role="presentation" style={{
                    backgroundColor: 'aliceblue', 
                    padding: '4px', 
                    borderRadius: '12px', 
                    boxShadow: '0 0 10px aliceblue'}}>
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
            <FilePalette 
                files={files} 
                path={path} 
                setSelectedId={setSelectedId} 
                selectedId={selectedId} 
                setAnchorEl={setAnchorEl} 
                setPath={setPath} 
                animIn={animIn} 
                fileType={fileType} 
                datal={datal} 
                notVerify={notVerify}
                folder={folder}
            />
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
                            maxHeight: 45 * 7,
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
            <Loading />
        </Box>
    )
}