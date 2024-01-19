import React, { useEffect, useState, useRef, useContext } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export default function Dialog({files, text, setResult}: {files: {files: string[], directs: string[]}, text: string, setResult: (r:{ready: boolean, text?: string, numb?: number})=>void}) {

    const [inpText, setInpText] = useState<string>('');

    return (
        <Box sx={{position: 'fixed', width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
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
                <Typography sx={{marginBottom: 2}}>{text}</Typography>
                <TextField value={inpText} error={files?.directs.includes(inpText)} onChange={({target}: any)=>setInpText(target.value)}/>
                <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%'}}>
                    {(!files?.directs.includes(inpText)&&(inpText!==''))?
                        <IconButton onClick={()=>setResult({ready: true, text: inpText})} ><CheckIcon sx={{zoom: 2}} color="success"/></IconButton>:
                        <Box />}
                    <IconButton onClick={()=>setResult({ready: true, text: undefined})}><CloseIcon sx={{zoom: 2}} color="error" /></IconButton>
                </Box>
            </Box>
        </Box>
    )
}