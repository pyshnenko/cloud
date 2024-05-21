import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import * as React from 'react';

function LinearProgressWithLabel(props: LinearProgressProps & { value: number, name: string }) {
    return (
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
            <Box sx={{opacity: 0.7, backgroundColor: 'darkgray', width: '100vw', height: '100vh', position:'absolute', top: 0, left: 0}} />
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
                <Typography>{props.name}</Typography>
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
        </Box>
    );
  }

export default function Progress ({value, name}: {value: number, name: string}) {
    return (
        <Box>
            <LinearProgressWithLabel value={value} name={name} />
        </Box>
    )
}