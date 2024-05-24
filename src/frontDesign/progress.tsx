import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import copy from 'fast-copy';

function LinearProgressWithLabel(props: LinearProgressProps & { value: number, name: string }) {
    return (
        <Box>
            <Typography sx={{overflowWrap: 'break-word'}}>{props.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" {...props} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">{`${Math.round(
                        props.value,
                    )}%`}</Typography>
                </Box>
            </Box>
        </Box>
    );
  }

export default function Progress ({mapVal, setMapVal, value, name}: {mapVal: any, setMapVal: (buf: any)=>void, value?: number, name?: string}) {

    const [closeButton, setCloseButton] = React.useState<boolean>(false);

    React.useEffect(()=>{
              
        setCloseButton(controlClose(mapVal));
    }, [mapVal])

    const updVal = (mapValD: Map<string, number>) =>{
        console.log('updVal')
        if (!closeButton) {
            console.log('open')
            let buf = copy(mapValD);
            setMapVal(buf)
            setTimeout(updVal, 1000);
        }
    }

    const controlClose = (mapValD: any) => {
        for (let val in mapValD){
            console.log(val)
            if (mapValD[val]!==100) return false
        }
        return true
    }

    return (
        <Box>
            {closeButton&&<IconButton sx={{
                    position: 'fixed',
                    zIndex: 10000000,
                    top: '14px',
                    right: '14px',
                    backgroundColor: 'aliceblue'
                }}  
                onClick={()=>setMapVal(new Map())}
            >
                <CloseIcon />
            </IconButton>}
            <Box sx={{
                position: 'fixed',
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center',
                left: 0,
                top: 0,
                zIndex: 9000000
            }}>
                <Box 
                    sx={{opacity: 0.7, backgroundColor: 'darkgray', width: '100vw', height: '100vh', position:'absolute', top: 0, left: 0}} 
                    onClick={()=>{
                        if (closeButton) setMapVal(new Map());
                    }}
                />
                <Box sx={{
                    display: 'flex', 
                    flexDirection:'column', 
                    minWidth: '100px', 
                    maxWidth: '300px', 
                    width: '80%', 
                    zIndex: 2,
                    padding: '8px',
                    backgroundColor: 'white',
                    boxShadow: '0 0 10px darkgrey',
                    borderRadius: '20px'
                }}>
                    {Object.keys(mapVal).map((item: string) => { return (
                        <LinearProgressWithLabel value={mapVal[item]} name={item} key={item} />
                    )})}
                </Box>
            </Box>
        </Box>
    )
}