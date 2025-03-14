import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import FolderIcon from '@mui/icons-material/Folder';
import FnamesTypography from './fNames';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { ImgWieverType } from './pictureWievew';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface props {
    animIn: boolean,
    index: number,
    lined?: boolean,
    selected: boolean,
    text: string,
    setAnchorEl: (d: {elem: any, index: number})=>void,
    setSelectedId: (n: number)=>void,
    path: string,
    setPath: (s: string)=>void,
    folder: boolean,
    setImgPalette: (p: ImgWieverType) => void
}

let imgArr: string[] = [];

export default function FileFoldBox({animIn, index, lined, selected, text, setAnchorEl, setSelectedId, path, setPath, folder, setImgPalette}: props) {

    useEffect(()=>{
        imgArr = [];
    }, [])

    return (
        <Fade in={animIn} timeout={index*300} key={text}>
            <Box sx={{
                    display: 'flex', 
                    flexWrap: 'nowrap', 
                    flexDirection: 'row', 
                    alignItems: lined ? 'center' :'flex-start', 
                    zIndex:selected?1:0,
                    width: lined ? '100%' : 'auto',
                    borderBottom: lined ? '1px solid gray' : 'none',
                    maxHeight: '110px'
                }}>
                <Button                                  
                    onContextMenu={(event: React.MouseEvent<HTMLElement>)=>{setAnchorEl({elem: event.currentTarget, index: index}); event.preventDefault()}}
                    onClick={()=>{setTimeout(()=>setSelectedId(index), 10, index)}}
                    onDoubleClick={()=>{if (folder) setPath((path==='/'?'':path) +(path[path.length-1]==='/'||path[path.length-1]==='\\'?'':'/')+text+'/')}} 
                    sx={{
                        display: 'flex', 
                        maxWidth: !lined ? '100px' : 'auto', 
                        width: lined ? '95%' : 'auto', 
                        maxHeight: '120px', 
                        overflowWrap: 'anywhere', 
                        padding: '6px 0px', 
                        backgroundColor: selected?'blanchedalmond':'transparent',
                        flexDirection: !lined ? 'column' : 'row',
                        justifyContent: 'flex-start'
                    }}
                >
                    {folder?<FolderIcon sx={{zoom: 2.5, color: '#FF9C0C'}} />: FolderIconType(path, text, setImgPalette)}
                    <FnamesTypography 
                        isSelected={selected}
                        lined={lined}
                        text={text}
                    />
                </Button>
                <IconButton
                    sx={{position: 'relative', right: '15px', top: '0px', padding: '0px', margin: '-3px'}}
                    aria-haspopup="true"
                    onClick={(event: React.MouseEvent<HTMLElement>)=>setAnchorEl({elem: event.currentTarget, index: index})}
                >
                    <MoreVertIcon />
                </IconButton>
            </Box>
        </Fade>
    )
}



const options = [
    'Открыть',
    'Скачать',
    'Поделиться',
    'Удалить'
  ];

const imgEnd = [
    '.png',
    '.jpg',
    'jpeg'
]

const archEnd = [
    'rar',
    '.7z',
    'zip'
]

const vidEnd = [
    '.mp4',
    '.gif'
]

const pdfEnd = [
    '.pdf'
]

const fileType = (path: string, name: string) => {
    let item: string = name.toLocaleLowerCase().slice(-4);
    const addr: string = `${window.location.href.includes('http://localhost:8799/')?'http://localhost:8801':''}/data/${path}/${name}`;
    if (item === 'txt') return 'txt'
    else {
        let endText = 'other'
        imgEnd.forEach((itemP: string)=>{if (name.includes(itemP)) {endText='picture'; if (!imgArr.includes(addr)) imgArr.push(addr)}})
        archEnd.forEach((itemP: string)=>{if (name.includes(itemP)) endText='archive'})
        vidEnd.forEach((itemP: string)=>{if (name.includes(itemP)) endText='video'})
        pdfEnd.forEach((itemP: string)=>{if (name.includes(itemP)) endText='pdf'})
        return endText
    }
}

const FolderIconType = (path: string, text: string, setImgPalette: (p: ImgWieverType) => void) => {

    const type: string = fileType(path, text)

    switch (type) {
        case 'txt': return (<TextSnippetIcon sx={{zoom: 2.5, color: '#0AD58D'}} />)
        case 'archive': return (<FolderZipIcon sx={{zoom: 2.5, color: '#0AD58D'}} />)
        case 'picture': return (<Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}} onDoubleClick={()=>{
            setImgPalette({addrArray: imgArr, startPosition: imgArr.indexOf(`${window.location.href.includes('http://localhost:8799/')?'http://localhost:8801':''}/data/${path}/${text}`)})
        }}>
            <Box sx={{width: '60px', height: '60px'}}>
                <img style={{width: '100%', maxHeight: '100%'}} src={`${window.location.href.includes('http://localhost:8799/')?'http://localhost:8801':''}/data/${path}/${text}`} />
            </Box>
        </Box>)
        case 'video': return (<Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Box sx={{width: '60px', height: '60px'}}>
                <video style={{width: '100%', maxHeight: '100%'}} src={`${window.location.href.includes('http://localhost:8799/')?'http://localhost:8801':''}/data/${path}/${text}`} onClick={({target}: any)=>{target.paused?target.play():target.pause()}} />
            </Box>
        </Box>)
        case 'pdf': <PictureAsPdfIcon sx={{zoom: 2.5, color: '#0AD58D'}} />
        default: <InsertDriveFileIcon sx={{zoom: 2.5, color: '#0AD58D'}} />
    }
}