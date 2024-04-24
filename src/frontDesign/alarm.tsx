import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

var openGlob: boolean = false;
var setOpenGlob: (buf: boolean)=>void;

var textGlob: string = '';
var setTextGlob: (buf: string)=>void;

var typeGlob: string = '';
var setTypeGlob: (buf: string)=>void;

export function useAlarm(text: string, type: string = 'success') {
    setOpenGlob(true);
    setTextGlob(text);
    setTypeGlob(type)
}

export function AlarmBar() {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState('');
  const [type, setType] = React.useState<any>('success');

  openGlob = open;
  setOpenGlob = setOpen;
  textGlob = text;
  setTextGlob = setText;
  typeGlob = type;
  setTypeGlob = setType;

  React.useEffect(()=>{
    openGlob = open;
  }, [open])

  React.useEffect(()=>{
    textGlob = text;
  }, [text])

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <div>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={type||"success"}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {text}
        </Alert>
      </Snackbar>
    </div>
  );
}