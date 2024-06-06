import React, { useEffect, useState, useRef, useContext } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { urlCheck } from '../frontMech/checkMech';

export default function Dialog({files, text, setResult}: {files: {files: string[], directs: string[]}, text: string, setResult: (r:{ready: boolean, text?: string, numb?: number})=>void}) {

    const [inpText, setInpText] = useState<string>('');

    return (
        <Box sx={{position: 'fixed', width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10}}>
            <Box sx={{    
                position: 'fixed',
                backgroundColor: 'black',
                width: '100vw',
                height: '100vh',
                top: 0,
                left: 0,
                opacity: 0.5,
                padding: 0,
                margin: 0}} 
            />
            <Box sx={{
                zIndex: 100, 
                backgroundColor: 'white', 
                padding: '32px', 
                borderRadius: '20px', 
                boxShadow: '0 0 10px white', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center'
            }}>
                <Typography sx={{marginBottom: 2}}>{text}</Typography>
                <TextField 
                    value={inpText} 
                    error={(text==='Новая папка')?files?.directs.includes(inpText):!urlCheck(inpText)} 
                    onChange={({target}: any)=>setInpText(target.value)}
                />
                <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%'}}>
                    {((text==='Новая папка')&&(!files?.directs.includes(inpText)&&(inpText!=='')))?
                        <IconButton onClick={()=>setResult({ready: true, text: inpText})}><CheckIcon sx={{zoom: 2}} color="success"/></IconButton>:
                        ((text==='Введи URL')&&urlCheck(inpText))?
                            <IconButton onClick={()=>setResult({ready: true, text: inpText})} ><CheckIcon sx={{zoom: 2}} color="success"/></IconButton>:
                        <Box />}
                    <IconButton onClick={()=>setResult({ready: true, text: undefined})}><CloseIcon sx={{zoom: 2}} color="error" /></IconButton>
                </Box>
            </Box>
        </Box>
    )
}