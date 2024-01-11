import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export default function Dialog({files, text, setResult}: {files: {files: string[], directs: string[]}, text: string, setResult: (r:{ready: boolean, text?: string, numb?: number})=>void}) {

    const [inpText, setInpText] = useState<string>('');

    return (
        <Box>
            <Box>
                <Typography>{text}</Typography>
                <TextField value={inpText} error={files?.directs.includes(inpText)} onChange={({target}: any)=>setInpText(target.value)}/>
                <Box>
                    {!files?.directs.includes(inpText)&&<IconButton onClick={()=>setResult({ready: true, text: inpText})} ><CheckIcon color="success"/></IconButton>}
                    <IconButton onClick={()=>setResult({ready: true, text: undefined})}><CloseIcon color="error" /></IconButton>
                </Box>
            </Box>
        </Box>
    )
}