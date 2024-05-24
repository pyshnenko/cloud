import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import * as React from 'react';

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

export default function Progress ({mapVal, setMapVal, value, name}: {mapVal: Map<string, number>, setMapVal: (buf: Map<string, number>)=>void, value?: number, name?: string}) {

    const [closeButton, setCloseButton] = React.useState<boolean>(true);

    React.useEffect(()=>{
        console.log(mapVal.keys())
        for (let val of Array.from(mapVal.values())){
            console.log(val)
            if (val!==100) return
        }
        setCloseButton(true);
    }, [mapVal])

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
                    {Array.from(mapVal).map((item: any[]) => { return (
                        <LinearProgressWithLabel value={item[1]} name={item[0]} key={item[1]} />
                    )})}
                </Box>
            </Box>
        </Box>
    )
}