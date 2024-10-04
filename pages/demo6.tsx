import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import copy from 'fast-copy';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { badgeClasses } from '@mui/material';

export default function Keyboards() {
    const [a, setA] = useState<number>(3);
    const [b, setB] = useState<number>(3);
    const [pass, setPass] = useState<number[]>([1,5,9,6]);
    const [tab, setTab] = useState<number[][]>([]);
    const [activeStep, setActiveStep] = useState<{x: Number, y: number}>({x:1, y: 1});
    const [iteration, setIteration] = useState<number>(0);

    useEffect(()=>{
        if ((a)&&(b)) setTab(createKeyboard(a,b))
    },[a,b])

    useEffect(()=>{
        setActiveStep({x: (pass[0]-1)%a, y: Math.floor((pass[0]-1)/a)})
    }, [pass])

    const stepOne = (myNum: number, endNum: number) => {
        if (myNum!==endNum) {
            const myPosition = {y: Math.floor((myNum-1)/a), x: (myNum-1)%a}
            //console.log(myPosition)
            const endPosition = {y: Math.floor((endNum-1)/a), x: (endNum-1)%a}
            //console.log(endPosition)
            const stepY = (endPosition.y-myPosition.y);
            const stepX = (endPosition.x-myPosition.x);
            const newPosition = {
                y: (stepY>0?1:stepY<0?-1:0)+myPosition.y, 
                x: (stepX>0?1:stepX<0?-1:0)+myPosition.x
            };
            setActiveStep(newPosition)
            setTimeout(stepOne, 1000, tab[newPosition.y][newPosition.x], endNum)
        }
        else return true
    }
    
    const createKeyboard = (a: number,b: number) => {
        let arr: number[][] = [];
        for (let i = 1; i<=b; i++) {
            let loArr: number[] = []
            for (let j = (i-1)*a+1; j<=(i*a); j++)
                loArr.push(j);
            arr.push(loArr);
        }
        return arr
    }

    return (
        <Box>
            <Box>
                <Typography>Введи число столбцов</Typography>
                <TextField 
                    variant='standard'
                    value={a}
                    type="number"
                    onChange={({target})=>setA(Number(target.value))}
                />
            </Box>
            <Box>
                <Typography>Введи число строк</Typography>
                <TextField 
                    variant='standard'
                    value={b}
                    type="number"
                    onChange={({target})=>setB(Number(target.value))}
                />
            </Box>
            <Box>
                <Typography>пароль</Typography>
                <TextField 
                    variant='standard'
                    value={pass.join(',')}
                    onChange={({target})=>{
                        setPass(target.value.split(',').map(item=>{return Number(item)}))
                    }}
                />
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                {tab.map((item: number[], y: number)=>{
                    return (
                        <Box 
                            key={'line '+item[0]} 
                            sx={{
                                display: 'flex', 
                                flexDirection: 'row'
                            }}
                        >
                            {item.map((itemCol: number, x: number)=>{
                                return (
                                    <Typography 
                                        key={itemCol} 
                                        sx={{
                                        padding: 2,
                                        border: 'solid 1px black',
                                        backgroundColor: ((y===activeStep.y)&&(x===activeStep.x))?'red':'green',
                                        width: '25px',
                                        textAlign: 'center'
                                    }}>
                                        {itemCol}
                                    </Typography>)
                            })}
                        </Box>
                    )
                })}
            </Box>
            <Button 
                onClick={()=>{
                    stepOne(pass[iteration===-1?0:iteration],pass[(iteration===-1?0:iteration)+1])
                    setIteration((iteration>=pass.length-2)?-1:iteration+1)
                }}>{iteration===-1?'Запуск':'Следующий шаг'}</Button>
        </Box>
    )
}