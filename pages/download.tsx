import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import Box from '@mui/material/Box';
import download_file from '../src/frontMech/downloadFile';
import Typography from '@mui/material/Typography';
import IndexPage from '../src/frontDesign/indexPage';
import jwt from 'jsonwebtoken';
import Api from '../src/frontMech/api';
import {User, userData} from '../src/frontMech/user';

export default function DownloadPage () {

    const [text, setText] = useState('Загружаем');
    const [fname, setfname] = useState('Загружаем');
    const [type, setType] = useState('Загружаем');
    const [oPath, setOPath] = useState('');
    const [bPath, setBPath] = useState('');

    useEffect(()=>{
        let params = (new URL(window.location.href)).searchParams; 
        const tok: string = params.get("tok") as string;
        console.log(tok);
        setText(tok);
        const name = params.get("name") as string;
        console.log(name);
        setfname(name);
        const typeR = params.get("type") === 'true';
        console.log(typeR);
        if (!typeR) {
            console.log('download');
            download_file(encodeURI(`/openLinc?tok=${tok}`), name)//http://localhost:8800
        }
        else {
            Api.askSimpleTok().then((res: any)=>{
                console.log(res);
                const tokData: any = jwt.verify(tok, res.data.simpleToken);
                if (tokData?.addr && tokData.addr!=='') {
                    setOPath(tokData.addr.replace(/\\/g, '/'));
                    const pathArr = tokData.addr.replace(/\\/g, '/').split('/');
                    let bbPath: string = '';
                    for (let i = 2; i<pathArr.length; i++) bbPath+='/'+pathArr[i];
                    console.log(bbPath);
                    setBPath(bbPath);
                    User.setToken('','',{login: pathArr[1]}, false);
                }
            }).catch((e: any)=>console.log(e));
        }
        setType(String(typeR));
    }, [])

    return (
    <Box>{type? (oPath===''?<Typography>{fname}</Typography>:<IndexPage exPath={oPath} notVerify={true} bbPath={bPath} />):<Box>
        <Typography>{text}</Typography>
        <Typography>{fname}</Typography>
        <Typography>{type}</Typography>
    </Box>}</Box>)

}