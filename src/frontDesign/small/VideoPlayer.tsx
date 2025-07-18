import React from "react";
import { Box } from "@mui/material";
import ReactPlayer from 'react-player'
import MuxPlayer from "@mux/mux-player-react";

interface PropsType {
    setActiveVideo: (s: string|null)=>void,
    activeVideo: string|null
}

export default function VideoPlayer(props: PropsType): React.JSX.Element {
    return (<>{props.activeVideo !== null && <Box sx={{
        position: 'fixed',
        top: 0, 
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
        <Box onClick={()=>props.setActiveVideo(null)} sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999,
            backgroundColor: 'black',
            opacity: 0.85
        }} />
        <MuxPlayer accent-color="#2dbd36" style={{maxWidth: '90vw', width: '100%', maxHeight: '90vh', height: '100%', position: 'relative', zIndex: 1001}}>
            <source src={props.activeVideo} type="video/mp4"></source>
        </MuxPlayer>
    </Box>}</>)
}