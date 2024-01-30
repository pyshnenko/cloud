import { useState, useRef, useEffect } from 'react';
import copy from 'fast-copy';
import Spinner from '../frontDesign/spinner';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

let openArr: string[] = [];
let openGlob: string[];
let setOpenGlob: (b: string[])=>void;

export function useLoading(openBool: boolean, name: string) {

    console.log(openGlob);
    if (openBool && !openGlob.includes(name)) {let buf = copy(openGlob); buf.push(name); setOpenGlob(buf)}
    else if (!openBool && openGlob.includes(name)) {let buf = copy(openGlob); buf.splice(openGlob.indexOf(name), 1); setOpenGlob(buf)}
}

export function Loading() {
    let [open, setOpen] = useState<string[]>(openArr);
    useEffect(()=>{openArr = open}, [open]);
    openGlob = open;
    setOpenGlob = setOpen;

    return (
    <Fade in={open.length!==0}>
        <Box sx={{
            zIndex: 10000, 
            position: 'fixed', 
            width: '100vw', 
            height: '100vh', 
            display: 'flex',
            justifyContent: 'center',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        }}>
            <Box sx={{
                zIndex:10001,
                width: '100%',
                minWidth: '100vw',
                height: '100%',
                minHeight: '100vh',
                backgroundColor: 'white',
                opacity: 0.7,
                position: 'fixed',
                top: 0,
                left: 0
            }}/>
            <Spinner />
        </Box>
    </Fade>)
}