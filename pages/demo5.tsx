import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import copy from 'fast-copy';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

interface Step {
    x: number,
    y: number,
    num: number
}

const widthP: number = 30;

export default function SudocuBrootForce () {
    
    const start = () => {
        let buf: number[][] = [];
        for (let i = 1; i<=9; i++) buf.push([0,0,0,0,0,0,0,0,0]);    
        /*buf.push([2,3,9,0,5,8,1,6,7]);
        buf.push([0,0,0,1,0,7,0,8,9]);
        buf.push([8,7,1,3,0,9,2,5,4]);
        buf.push([7,0,8,2,1,3,0,0,6]);
        buf.push([4,1,3,9,0,0,7,2,5]);
        buf.push([9,0,2,5,7,4,8,1,3]);
        buf.push([6,0,4,7,9,1,5,3,0]);
        buf.push([3,9,5,0,0,0,6,7,1]);
        buf.push([1,8,7,6,3,5,0,0,2]);*/
        return buf;
    }
    const steps = useRef<Step[]>([]);
    let startNumbers: number[][] = [];
    

    const firstStepCheck = () => {
        console.log('start');
        startNumbers = copy(scelet);
        let simpleBufHorizont: number[][] = copy(scelet);
        simpleCheck(simpleBufHorizont);
        let simpleBufVertical: number[][] = horizontToVertical(simpleBufHorizont);
        simpleCheck(simpleBufVertical);
        simpleBufHorizont = horizontToVertical(simpleBufVertical);
        console.log(simpleBufHorizont);
        let simpleBufSQ: number[][] = horizontToSqare(simpleBufHorizont);
        simpleCheck(simpleBufSQ);
        simpleBufHorizont = horizontToSqare(simpleBufSQ);
        //buf = simplArrToArr(simpleBuf);
        setScelet(simpleBufHorizont);
        console.log(steps);
        for (let i = 0; i < 1000000; i++) {
            if (brootForce(simpleBufHorizont)===true) {
                //setTimeout(brootForce, 10000, simpleBufHorizont, steps);
                break;
            }
        }
        setScelet(simpleBufHorizont);
        console.log('end')
    }

    const simpleCheck = (arr:number[][]) => {
        
        for (let arrpos: number = 0; arrpos<9; arrpos++ ){
            if (checkNumOfNum(arr[arrpos]) === 1) {
                let actPos: number = checkNumberOnArray(arr[arrpos], 0);
                for (let i = 1; i<=9; i++) {
                    let sPos: number = checkNumberOnArray(arr[arrpos], i);
                    if (sPos===-1) {
                        arr[arrpos][actPos] = i;
                        break;
                    }
                }
            }
        }
    }

    const horizontToVertical = (arr: number[][]) => {
        let buf: number[][] = [];
        for (let i=0; i<9; i++) {
            let buf2: number[] = [];
            for (let j=0; j<9; j++) {
                buf2.push(arr[j][i])
            }
            buf.push(buf2);
        }
        console.log(buf)
        return buf;
    }

    const horizontToSqare = (arr: number[][]) => {
        let buf: number[][]=[[],[],[],[],[],[],[],[],[]];
        for (let i: number = 0; i<9; i++) 
            for (let j: number = 0; j<9; j++) {
                buf[Math.floor(j/3)+Math.floor(i/3)*3].push(arr[i][j])
        }
        return buf
    }

    const checkZerosTotal = (arr: number[][], positionExt: boolean = false) => {
        for (let i: number = 0; i<arr.length; i++)
            for (let j: number = 0; j<arr[i].length; j++)
                if (arr[i][j]===0) return positionExt?{x:i, y: j}:true
        return false
    }

    const checkNumberAvailabe = (arr: number[][], num: number = 0, x: number = 0, y: number = 0) => {
        if (arr[x][y]!==0) return false
        for (let i: number = 0; i<9; i++){
            if (arr[x][i] === num) return false
            else if (arr[i][y] === num) return false
            else if ((i<3)&&(arr[Math.floor(x/3)*3+(i%3)][Math.floor(y/3)*3] == num)) return false
            else if ((i<3)&&(arr[Math.floor(x/3)*3+(i%3)][Math.floor(y/3)*3+1] == num)) return false
            else if ((i<3)&&(arr[Math.floor(x/3)*3+(i%3)][Math.floor(y/3)*3+2] == num)) return false
        }
        return true
    }

    const brootForce = (arr: number[][], startNum: number = 1, seccondChanse: boolean = false) => {
        let extBool: boolean = false;
        if (seccondChanse) 
            steps.current.pop();
        if (checkZerosTotal(arr)) {
            let posB: {x: number, y: number}|boolean = checkZerosTotal(arr, true);
            let pos: {x: number, y: number} = posB===true?{x:0, y: 0}:posB as {x: number, y: number};
            console.log(pos);
            for (let i = startNum; i<=9; i++) {
                if (checkNumberAvailabe(arr, i, pos.x, pos.y)) {
                    if ((steps.current.length===0)||((steps.current[steps.current.length-1].x!==pos.x)||(steps.current[steps.current.length-1].y!==pos.y))) 
                        steps.current.push({x:pos.x, y: pos.y, num: i});
                    arr[pos.x][pos.y] = i;
                    break;
                }
                else if (i===9) {
                    console.log('fail');
                    console.log(seccondChanse + ' ' + steps.current.length)
                    if (steps.current.length === 0) return true
                    arr[steps.current[steps.current.length-1].x][steps.current[steps.current.length-1].y] = 0;
                    extBool = true;
                    /*if ((seccondChanse)&&(step.length>1)) {
                        step.pop();
                        arr[step[step.length-1].x][step[step.length-1].y] = 0
                    }*/
                }
            }
        }
        else {
            return true;
        }
        if (extBool) brootForce(arr, steps.current[steps.current.length-1].num+1, true)
        //setTimeout(brootForce, 1000, arr, step);
        else return false;
    }

    const checkNumberOnArray = (arr: number[], num: number) => {
        if (arr.includes(num)) return arr.indexOf(num)
        return -1;
    }

    const checkNumOfNum = (arr:number[], num: number = 0) => {
        return arr.filter((x: number)=>x===num).length
    }

    const [scelet, setScelet] = useState<number[][]>(start());

    return (
        <Box>
            <Typography>Заполни исходные данные</Typography>
            {scelet.map((fitem: number[], findex: number)=> { return (
                <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: (9*widthP + 30) + 'px'}}>
                    {fitem.map((sitem: number, sindex: number)=>{ return (
                        <Box sx={{
                            display: 'flex', 
                            flexDirection: 'row', 
                            flexWrap: 'wrap', 
                            width: (widthP) + 'px', 
                            borderRight: (sindex+1)%3===0?'black solid 2px':'black solid 1px',
                            borderBottom: (findex+1)%3===0?'black solid 2px':'black solid 1px',
                            borderTop: findex===0?'black solid 2px':'none',
                            borderLeft: sindex===0?'black solid 2px':'none'
                        }}>
                           <TextField 
                                    variant="standard" 
                                    key={`${findex}-${sindex}-${sitem}`}
                                    sx={{width: widthP+'px', padding: 0, backgroundColor: sitem===0?"orange":"green", textAlign: 'center'}} 
                                    size="small" 
                                    value={sitem===0?' ':sitem}//{`${findex*3+tindex}-${sindex*3+qindex}-${qitem}`}
                                    onChange={({target})=>{
                                        let buf = copy(scelet);
                                        buf[findex][sindex] = Number(target.value)%10;
                                        setScelet(buf);
                                    }}
                                />
                        </Box>
                    )})}
                </Box>
            )})}
            <Button onClick={()=>{
                    console.log(scelet);
                    firstStepCheck();
                }
            } >Расчет</Button>
            {steps.current.length>0&&<Button onClick={()=>{
                    console.log(startNumbers);
                    setScelet(startNumbers);
                    steps.current = []
                }
            } >Сброс</Button>}
        </Box>
    )}