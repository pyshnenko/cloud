import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import copy from 'fast-copy';
import Box from '@mui/material/Box';

var openGlob: number[] = [];
var setOpenGlob: (buf: number[])=>void;

interface arrayData {text: string, type: string, id: number};

var allertArrayGlob: arrayData[] = [];
var setAllertArrayGlob: (buf: arrayData[])=>void;

var timer: NodeJS.Timeout | number = 0;

export function useAlarm(text: string, type: string = 'success') {

  let id = newId();
  let numArr: number[] = copy(openGlob);
  numArr.push(id);
  setOpenGlob(numArr);
  let bufArr: arrayData[] = copy(allertArrayGlob);
  bufArr.push({text, type, id});
  setAllertArrayGlob(bufArr);
}

function newId() {
  console.log('newId');
  console.log(allertArrayGlob)
  let max = 0;
  for (let i = 0; i<allertArrayGlob.length; i++) {
    if (allertArrayGlob[i].id >= max) max = allertArrayGlob[i].id + 1
  }
  console.log(max);
  return max
}

export function AlarmBar() {
  const [open, setOpen] = React.useState<number[]>([]);
  const [allertArray, setAllertArray] = React.useState<arrayData[]>([]);

  openGlob = open;
  setOpenGlob = setOpen;
  allertArrayGlob = allertArray;
  setAllertArrayGlob = setAllertArray;

  React.useEffect(()=>{
    openGlob = open;
  }, [open])

  React.useEffect(()=>{
    allertArrayGlob = allertArray;
  }, [allertArray])

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string, id?: number) => {
    console.log(id)
    console.log(allertArrayGlob)
    if (reason === 'clickaway') {
      return;
    }
    let buf: arrayData[] = copy(allertArray);
    buf.forEach((item: arrayData, index: number)=>{
      if (item.id === id) {
        buf.splice(index,1);
      }
    })
    setAllertArray(buf);
    let numBuf: number[] = copy(open);
    numBuf.forEach((item: number, index: number)=>{
      if (item === id) {
        numBuf.splice(index,1);
      }
    })
    setOpen(numBuf);
    if (timer!==0) {
      clearTimeout(timer);
      timer = 0;
    }
    else timer = setTimeout(()=>{
      setAllertArray([]);
      setOpen([]);
    }, 10000)
    //setOpen(false);
  };

  return (
    <div>
      {allertArray.map((item: arrayData, index: number)=>{ return (
        <Snackbar open={open.includes(item.id)} autoHideDuration={6000} onClose={(evt: React.SyntheticEvent | Event)=>handleClose(evt, '', item.id)} key={index}>
          <Alert
            onClose={(evt: React.SyntheticEvent | Event)=>handleClose(evt, '', item.id)}
            severity={item.type||"success"}
            variant="filled"
            sx={{ width: '100%', bottom: `${50*index + 24}px`, position: 'relative' }}
          >
            {item.text}
          </Alert>
        </Snackbar>
      )})}
    </div>
  );
}