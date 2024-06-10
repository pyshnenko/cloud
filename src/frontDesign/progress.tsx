import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import * as React from 'react';
import copy from 'fast-copy';
import Fade from '@mui/material/Fade';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

let setMapValGlob: (buf: any)=>void;

export function useProgressBar (mapVal: any) {
    let bufG: any = {};
    //console.log(mapVal)
    for (let item in mapVal) {
        //console.log(item)
        let addr: string[] = [];
        if (item.includes('/')) {
            addr = item.split('/');
            if (addr.length>2) {
                //console.log(bufG[addr[1]])
                if (bufG.hasOwnProperty(addr[1]))
                    bufG[addr[1]] = bufG[addr[1]].hasOwnProperty('%%%total')? {
                        ...bufG[addr[1]], 
                        [addr.slice(2).join('/')]: mapVal[item], 
                        ['%%%total']: (bufG[addr[1]]['%%%total']+mapVal[item])/2 } : 
                        {...bufG[addr[1]], [addr.slice(2).join('/')]: mapVal[item], ['%%%total']: mapVal[item]};
                else bufG[addr[1]] = {
                    [addr.slice(2).join('/')]: mapVal[item],
                    ['%%%total']:  mapVal[item]
                };
            }
            else bufG[item]= mapVal[item]
        }
        else if (item.includes('\\')) {
            addr = item.split('\\');
            if (addr.length>2) {
                if (bufG.hasOwnProperty(addr[1]))
                    bufG[addr[1]] = bufG[addr[1]].hasOwnProperty('%%%total')? {
                        ...bufG[addr[1]], 
                        [addr.slice(2).join('/')]: mapVal[item], 
                        ['%%%total']: (bufG[addr[1]]['%%%total']+mapVal[item])/2 } : 
                        {...bufG[addr[1]], [addr.slice(2).join('/')]: mapVal[item], ['%%%total']: mapVal[item]};
                else bufG[addr[1]] = {
                    [addr.slice(2).join('/')]: mapVal[item],
                    ['%%%total']:  mapVal[item]
                };
            }
            else bufG[item]= mapVal[item]
        }
        else {
            bufG[item]= mapVal[item]  
        }
    }
    //console.log(bufG)
    //setMapValGlob(mapVal);
    setMapValGlob(bufG);
}

function LinearProgressWithLabel2(props: LinearProgressProps & { value: number, name: string }) {
    return (
        <Box sx={{width: '100%'}}>
            <Typography variant="h6" sx={{overflowWrap: 'break-word', fontSize:'0.85rem'}}>{props.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" {...props} sx={{opacity: 0.7}}/>
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
  
  function LinearProgressWithLabel(props: LinearProgressProps & { value: number, name: string, err: string }) {
    return (
        <Box sx={{width: '100%', margin: '4px', minHeight: '48px', padding: 0}}>
        <LinearProgress variant="determinate" {...props} sx={{
                opacity: 0.5, 
                position: 'relative', 
                width: '98%', 
                height: '100%', 
                minHeight: '10px',
                boxShadow: props.err==='false'?'0 0 4px blue':'0 0 4px red', 
                borderRadius: '10px',
                backgroundColor: props.err==='false'?'rgb(167, 202, 237)':'red'
        }}/>
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: '95%', 
                height: '100%',
                minWidth: 35, 
                position: 'relative', 
                top: '-100%', 
                justifyContent: 'space-between', 
                padding: '0 4px'
            }}>
                <Typography sx={{overflowWrap: 'break-word'}}>{props.name}</Typography>
                <Typography variant="body2" color="text.secondary">{`${Math.round(
                    props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
  }

export function Progress () {
    const [mapVal, setMapVal] = React.useState<any>({});
    const [closeButton, setCloseButton] = React.useState<boolean>(false);

    React.useEffect(()=>{              
        setMapValGlob = setMapVal;
    }, [])

    React.useEffect(()=>{              
        //console.log(mapVal)
        setCloseButton(controlClose(mapVal));
    }, [mapVal])

    /*const updVal = (mapValD: Map<string, number>) =>{
        console.log('updVal')
        if (!closeButton) {
            console.log('open')
            let buf = copy(mapValD);
            setMapVal(buf)
            setTimeout(updVal, 1000);
        }
    }*/

    const controlClose = (mapValD: any) => {
        for (let val in mapValD){
            if (typeof(mapValD[val])==='number') 
                if ((mapValD[val]!==100)&&(mapValD[val]!==-1)) return false
            else for (let valInp in mapValD[val])
                if ((mapValD[val][valInp]!==100)&&(mapValD[val]!==-1)) return false
        }
        return true
    }

    return (
        <Fade in={Object.keys(mapVal).length>0}>
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
                            if (closeButton) setMapVal({});
                        }}
                    />
                    <Box sx={{
                        display: 'flex', 
                        flexDirection:'column', 
                        minWidth: '100px', 
                        maxWidth: '600px', 
                        maxHeight: '90vh',
                        width: '80%', 
                        zIndex: 2,
                        padding: '8px',
                        backgroundColor: 'white',
                        boxShadow: '0 0 10px darkgrey',
                        borderRadius: '20px',
                        overflow: 'auto',
                        overflowX: 'hidden'
                    }}>
                        {Object.keys(mapVal).map((item: string) => { 
                            return (typeof(mapVal[item])==='number' ? 
                                <LinearProgressWithLabel 
                                    value={mapVal[item]===-1?0:mapVal[item]} 
                                    name={item} 
                                    key={item} 
                                    sx={{width: '97%', height: '100%'}} 
                                    err={(mapVal[item]===-1).toString()} 
                                /> :
                                    <Accordion elevation={3} sx={{backgroundColor: 'antiquewhite', padding: 0}}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{width: '97%', padding: 0, margin: 0}}>
                                            <LinearProgressWithLabel value={mapVal[item]['%%%total']} name={item} key={item+'%%%total'} sx={{width: '97%', height: '100%'}} />
                                        </AccordionSummary>
                                        <AccordionDetails sx={{padding: 0, margin: 0}}>                                            
                                            {Object.keys(mapVal[item]).map((item2: string) => { if (item2!=='%%%total') return (
                                                <LinearProgressWithLabel 
                                                    value={mapVal[item][item2]===-1?0:mapVal[item][item2]} 
                                                    name={item2} 
                                                    key={item2} 
                                                    sx={{width: '97%', height: '100%'}} 
                                                    err={(mapVal[item][item2]===-1).toString()} 
                                                />)})}
                                        </AccordionDetails>
                                    </Accordion>
                                )
                            }
                        )}
                    </Box>
                </Box>
            </Box>
        </Fade>
    )
}