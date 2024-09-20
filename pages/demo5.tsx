import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import copy from 'fast-copy';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

const widthP: number = 50;

export default function SudocuBrootForce () {
    
    const start = () => {
        let buf: number[][][] = [], buf2: number[][][][]=[];
        for (let i = 1; i<=3; i++) buf.push([[0, 1,2],[3,4,5],[6,7,8]]);    
        for (let i = 1; i<=3; i++) buf2.push(copy(buf));
        return buf2;
    }

    const [scelet, setScelet] = useState<number[][][][]>(start());

    return (
        <Box>
            <Typography>Заполни исходные данные</Typography>
            {scelet.map((fitem: number[][][], findex: number)=> { return (
                <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: (9*widthP + 30) + 'px'}}>
                    {fitem.map((sitem: number[][], sindex: number)=>{ return (
                        <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: (3*widthP + 6) + 'px', border: 'black, solid, 1px'}}>
                            {sitem.map((titem: number[], tindex: number)=> {return (
                                <Box>{titem.map((qitem: number, qindex: number)=>{ return (<TextField 
                                    variant="standard" 
                                    key={'f'+qindex} 
                                    sx={{width: widthP+'px', padding: 0, border: 'black, solid, 1px', backgroundColor: qitem===0?"orange":"green"}} 
                                    size="small" 
                                    value={qitem===0?' ':qitem}//{`${findex*3+tindex}-${sindex*3+qindex}-${qitem}`}
                                    onChange={({target})=>{
                                        let buf = copy(scelet);
                                        buf[findex][sindex][tindex][qindex] = Number(target.value)%10;
                                        setScelet(buf);
                                    }}
                                />)})}</Box>
                            )})}
                        </Box>
                    )})}
                </Box>
            )})}
            <Button onClick={()=>{
                    let buf = copy(scelet);
                    let inpBuf = buf[0][0].flat();
                    
                    console.log(inpBuf);
                }
            } >Расчет</Button>
        </Box>
    )}