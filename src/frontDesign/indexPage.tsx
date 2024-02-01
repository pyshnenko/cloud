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
import Fade from '@mui/material/Fade';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddButton from './addButton'
import Cookies from 'universal-cookie';
import download_file from '../frontMech/downloadFile';
import {Loading, useLoading} from '../hooks/useLoading';
import FolderZipIcon from '@mui/icons-material/FolderZip';

const options = [
    'Открыть',
    'Скачать',
    'Поделиться',
    'Переименовать',
    'Переместить',
    'Удалить'
  ];

const imgEnd = [
    'png',
    'jpg'
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
    const menuOpen = Boolean(anchorEl.elem);

    const loading = useLoading;

    useEffect(()=>{
        loading(true, 'start');
        if (!notVerify) {
            const crypt: string = String(localStorage.getItem('cloudAToken'));
            console.log(crypt);
            const saved: string = String(localStorage.getItem('cloudToken'));
            console.log(saved);
            let decr: TokenLocalData & {exp: number};
            try {
                decr = jwt.verify(saved, crypt) as TokenLocalData & {exp: number}
                User.setToken(saved, crypt, decr);
                folder();
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
                        .then((res)=>{
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
                        .catch((e)=>{
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
        let data: any;
        try {
            data = await Api.askLS(newToken||User.getToken(), location, 'ls', '', notVerify);
            setFiles({directs: data.data.directs, files: data.data.files});
        }
        catch(e){
            console.log(e)
        }
        finally {loading(false, 'folder'); setAnimIn(true)};
        //Api.askLS(User.getToken());
    }

    const menuClose = () => {
        setAnchorEl({elem: null, index: -1});
    }

    const fileType = (name: string) => {
        let item: string = name.toLocaleLowerCase().slice(-3);
        if (item === 'txt') return 'txt'
        else if (imgEnd.includes(item)) return 'picture'
        else if (archEnd.includes(item)) return 'archive'
        else return 'other'
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
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
            {files&&<AddButton path={path} setPath={setPath} files={files} folder={folder} notVerify={notVerify}/>}
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
                        <Fade in={animIn} timeout={index*300} key={item}>
                            <Box sx={{display: 'flex', flexWrap: 'wrap', flexDirection: 'row', alignItems: 'flex-start'}}>
                                <Button                                  
                                    onContextMenu={(event: React.MouseEvent<HTMLElement>)=>{setAnchorEl({elem: event.currentTarget, index: index}); event.preventDefault()}}
                                    onDoubleClick={()=>setPath((path==='/'?'':path) +(path[path.length-1]==='/'||path[path.length-1]==='\\'?'':'/')+item+'/')} 
                                    sx={{display: 'column-flex', maxWidth: '100px', maxHeight: '120px', overflowWrap: 'anywhere', padding: '6px 0px'}}
                                >
                                    <FolderIcon sx={{zoom: 2.5, color: '#FF9C0C'}} />
                                    <Typography sx={{width: '85px'}} title={item}>{item.length>15?(item.slice(0, 12) + `${item.length>12?'...':''}`):item}</Typography>
                                </Button>
                                <IconButton
                                    sx={{position: 'relative', right: '15px', top: '0px', padding: '1px'}}
                                    aria-haspopup="true"
                                    onClick={(event: React.MouseEvent<HTMLElement>)=>setAnchorEl({elem: event.currentTarget, index: index})}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            </Box>
                        </Fade>
                    )
                })}
                {files?.files.map((item: string, index: number)=> {
                    return (
                        <Fade in={animIn} timeout={(index+files.directs.length)*300} key={item}>
                            <Box sx={{display: 'flex', flexWrap: 'wrap', flexDirection: 'row', alignItems: 'flex-start'}} key={item}>
                                <Button 
                                    onContextMenu={(event: React.MouseEvent<HTMLElement>)=>{
                                        setAnchorEl({elem: event.currentTarget, index: index+files.directs.length}); 
                                        event.preventDefault()
                                    }}
                                    sx={{display: 'column-flex', maxWidth: '100px', maxHeight: '120px', overflowWrap: 'anywhere', padding: '6px 0px'}}
                                >
                                    {fileType(item)==='txt'? <TextSnippetIcon sx={{zoom: 2.5, color: '#0AD58D'}} />:
                                        fileType(item)==='archive' ? <FolderZipIcon sx={{zoom: 2.5, color: '#0AD58D'}} />:
                                        fileType(item)==='picture'? 
                                            <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <Box sx={{width: '60px', height: '60px'}}>
                                                    <img style={{width: '100%'}} src={`${window.location.href.includes('http://localhost:8799/')?'http://localhost:8800':''}/data/${path}/${item}`} />
                                                </Box>
                                            </Box> :
                                        <InsertDriveFileIcon sx={{zoom: 2.5, color: '#0AD58D'}} />}
                                    <Typography sx={{width: '85px'}} title={item}>{item.length>15?(item.slice(0, 12) + `${item.length>12?'...':''}`):item}</Typography>
                                </Button>
                                
                                <IconButton
                                    sx={{position: 'relative', right: '15px', top: 0, padding: '1px'}}
                                    aria-haspopup="true"
                                    onClick={(event: React.MouseEvent<HTMLElement>)=>{
                                        setAnchorEl({elem: event.currentTarget, index: index+files.directs.length}); 
                                        event.preventDefault()
                                    }}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            </Box>
                        </Fade>
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