import React, { useEffect, useState, useRef } from 'react';
import Box from "@mui/material/Box";
import Fade from '@mui/material/Fade';

export interface ImgWieverType {addr?: string, addrArray?: string[], startPosition?: number}

export function ImgWiever ({props, src}: {props?:ImgWieverType, src?: string}) {
    const {addr, addrArray, startPosition = 0}: ImgWieverType = props||{addr: src||'', addrArray: undefined};
    const [open, setOpen] = useState<boolean>(false);
    const [anim, setAnim] = useState<boolean>(false);
    const [pict, setPict] = useState<string[]>(addrArray||[addr||'']);
    const [pos, setPos] = useState<number>(startPosition);
    const [width, setWidth] = useState<number>();
    const trig = useRef<boolean>(true);
    const posCurr = useRef<number>(startPosition);
    const pictCurr = useRef<number>(pict.length);
    const widthRef = useRef<number>(0);
    const zoomRef = useRef<{zoomI: number, top: number, left: number}>({zoomI: 1, top: 0, left: 0});
    const [zoom, setZoom] = useState<{zoomI: number, top: number, left: number}>({zoomI: 1, top: 0, left: 0});  
    let pictBox = useRef<HTMLElement | null>(); 

    useEffect(()=>{
        if (trig.current) {
            trig.current = false;
            posCurr.current = pos;

            window.addEventListener('mousewheel', (e: any ) => {
                const newZoom: number = zoomRef.current.zoomI + (e.deltaY/1000);
                const newTop: number = zoomRef.current.top - (e.deltaY/100*((e.clientY-(e.view.innerHeight/2))/20));
                const newLeft: number = zoomRef.current.left - (e.deltaY/100*((e.clientX-(e.view.innerWidth/2))/20));
                setZoom({zoomI: newZoom<0.1?0.1:newZoom>5?5:newZoom, top: newTop, left: newLeft})
            });
            const onKeyUp = (key: KeyboardEvent) => {
                if (key.code==='ArrowLeft') setPos(posCurr.current<=0?0:posCurr.current-1);
                else if (key.code === 'ArrowRight') setPos(posCurr.current>=pictCurr.current-1?pictCurr.current-1:posCurr.current+1);
                else if (key.code === 'Escape') setAnim(false);

            }

            document.addEventListener('keyup', onKeyUp);

            const handleResize = (event: any) => {
                if (event.target.innerWidth!==null) {
                    setWidth(event.target.innerWidth);
                    console.log(event.target.innerWidth)
                }
            };
    
            window.addEventListener('resize', handleResize);
            
            return () => {
                window.removeEventListener('resize', handleResize);
                document.removeEventListener('keyup', onKeyUp);
            };
        }
    }, [])

    useEffect(()=>{
        zoomRef.current = zoom;
    }, [zoom])

    useEffect(()=>{
        widthRef.current = width||1;
    }, [width])

    useEffect(()=>{
        posCurr.current = pos;
        setZoom({zoomI: 1, left: 0, top: 0});
        if (addrArray&&pictBox.current&&(addrArray.length>8)) {
            pictBox.current.scrollTo((pictBox.current.children[pos+1] as HTMLElement).offsetLeft - widthRef.current/2, 0)
        }
    }, [pos])

    useEffect(()=>{
        console.log(posCurr)
        pictCurr.current = pict.length;
        pictBox.current = document.getElementById('ssssd');
    }, [pict])

    useEffect(()=>{
        if (!anim) setTimeout(setOpen, 500, {anim: false, total: false}) 
        else setOpen(true);
    }, [anim])

    useEffect(()=>{
        console.log(addr);
        if ((addr && (addr!==''))||(addrArray && addrArray.length!==0)) {
            setPict(addrArray||[addr||'']);
            setPos(startPosition);
            setAnim(true)
        }
    }, [props, src])

    const cssforDownBar = {maxHeight: '70%', maxWidth: '100%', margin: '0 8px', padding: 0, zIndex: 10014};

    return (
        <Box>
            {open&&<Fade in={anim}>
                <Box sx={{position: 'fixed', width: '100%', height: '100%', top: 0, left: 0, zIndex: 10010, display: 'flex', alignItems: 'center', justifyContent: 'center'}} >
                    <Box 
                        sx={{position: 'fixed', width: '100%', height: '100%', top: 0, left: 0, zIndex: 10011, opacity: 0.85, backgroundColor: 'black'}}
                        onClick={()=>{setAnim(false)}}
                    />
                    <Box sx={{zIndex: 10012, maxWidth: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '15vh'}}>
                            <img 
                                srcSet={pict[pos]} 
                                src={pict[pos]} 
                                style={{
                                    maxHeight: pict.length>1?'70vh':'90vh', 
                                    maxWidth: pict.length>1?'70vw':'90vw', 
                                    zoom: zoom.zoomI, 
                                    position:'relative',
                                    top: zoom.top,
                                    left: zoom.left
                                }} 
                            />
                        </Box>
                        {pict.length>1&&<Box 
                            id='ssssd'
                            sx={{
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'flex-start', 
                                margin: 2, 
                                height: '12vh', 
                                position: 'fixed', 
                                bottom: 0, 
                                left: 0, 
                                width: '100%',
                                overflowX: 'auto'
                            }}
                        >
                            <Box sx={{
                                    backgroundColor: 'black',
                                    width: '100%',
                                    height: '15vh',
                                    position: 'fixed',
                                    bottom: 0,
                                    left: 0,
                                    opacity: 0.8,
                                    boxShadow: '0 0 20px black',
                                    zIndex: 1
                            }} />
                            {pict.map((src: string, index: number)=>{
                                return(
                                    <img 
                                        srcSet={src} 
                                        src={src} 
                                        style={index!==pos?
                                            cssforDownBar:
                                            {...cssforDownBar, backgroundColor: 'darkslategrey', boxShadow: 'darkslategrey 0px 0px 5px 3px', borderRadius: '5px', maxHeight: '90%'}
                                        }                                             
                                        id='imgHover'
                                        key={src}
                                        onClick={()=>setPos(index)}
                                    />
                                )
                            })}
                        </Box>}
                    </Box>
                </Box>
            </Fade>}
        </Box>
    )
}