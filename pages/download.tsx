import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import Box from '@mui/material/Box';
import download_file from '../src/frontMech/downloadFile';
import Typography from '@mui/material/Typography';

export default function DownloadPage () {

    const [text, setText] = useState('Загружаем');
    const [fname, setfname] = useState('Загружаем');
    const [type, setType] = useState('Загружаем');

    useEffect(()=>{
        let params = (new URL(window.location.href)).searchParams; 
        const tok: string = params.get("tok") as string;
        console.log(tok);
        setText(tok);
        const name = params.get("name") as string;
        setfname(name);
        const type = params.get("type") === 'true';
        if (!type) download_file(encodeURI(`/openLinc?tok=${tok}`), name)//http://localhost:8800
        setType(String(type));
    }, [])

    return (
    <Box>
        <Typography>{text}</Typography>
        <Typography>{fname}</Typography>
        <Typography>{type}</Typography>
    </Box>)

}