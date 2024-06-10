import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import FolderIcon from '@mui/icons-material/Folder';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import Typography from '@mui/material/Typography';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import TextField from '@mui/material/TextField';
import {User} from '../frontMech/user';
import UploadDiv from './uploadDiv';
import {useProgressBar} from './progress';
import { useAlarm } from './alarm';
import mobile from 'is-mobile';
import Api from '../frontMech/api';
import { urlCheck } from '../frontMech/checkMech';
import { getFileAsync, attFileSend } from '../frontMech/mechanics';

export default function FilePalette ({files, path, setSelectedId, selectedId, setAnchorEl, setPath, animIn, fileType, datal, notVerify, folder}: any) {

    const [ fileDrag, setFileDrag ] = useState<boolean>(false);
    const [ isMobile, setIsMobile ] = useState<boolean>(false);

    const username = useRef(datal);
    const folderPath = useRef(path);
    let inputIdTrig = useRef<any>(null);

    const progress = useProgressBar;
    const alarm = useAlarm;

    useEffect(()=>{
        username.current=datal;
    }, [datal])

    useEffect(()=>{
        folderPath.current=path;
        //console.log(path)
    }, [path])

    useEffect(()=>{
        //console.log(fileDrag)
    }, [fileDrag])
    
    useEffect(()=>{
        //console.log("user: " + datal);
        const dropZone = document.getElementById('folderBox');
        const dropZone2 = document.getElementById('folderBox2');
        const inputElem = document.getElementById('hiddenInput');
        inputElem?.focus();
        inputIdTrig.current = inputElem;

        if (dropZone&&dropZone2) {
            let hoverClassName = 'hover';
            setIsMobile(mobile());
        
            dropZone.addEventListener("dragenter", function(e) {
                e.preventDefault();
                console.log("dragenter")
                setFileDrag(true);
            });
        
            dropZone2.addEventListener("dragover", function(e) {
                e.preventDefault();
                console.log("dragover")
                setFileDrag(true);
            });
        
            dropZone2.addEventListener("dragleave", function(e) {
                e.preventDefault();
                console.log("dragleave")
                setFileDrag(false);
            });
        
            // Это самое важное событие, событие, которое дает доступ к файлам
            dropZone2.addEventListener("drop", async function(e: any) {
                e.preventDefault();
                //e.defaultPrevented(false);
                setFileDrag(false);
                console.log(e);
                attFileSend(await getFileAsync(e.dataTransfer, folderPath), folderPath.current, folder);
            });            
        }
    }, [])

    const pasteMove = (evt: any) => {
        evt.preventDefault();
        const tpast: string = evt.clipboardData.getData("text");
        console.log(tpast);
        let files = evt.hasOwnProperty('clipboardData')? evt.clipboardData.files : evt.hasOwnProperty('dataTransfer')?evt.dataTransfer.files:evt;
        console.log(files)
        let upFiles: any[] = [];
        for (let i = 0; i< files.length; i++) {
            let name = ((files[i].name==='image.png')&&(files.length===1))?String(files[i].lastModified)+'.png':files[i].name;
            upFiles.push({file: files[i], fileName: name, path: folderPath.current, filePath: name});
        }
        if (files.length)
            attFileSend(upFiles, path, folder);
        else if ((tpast.length)&&(urlCheck(tpast))) {
            console.log(Number(new Date())+tpast.slice(tpast.lastIndexOf('.')));
            Api.uplByUrl(User.getToken(), {fname: String(Number(new Date())+tpast.slice(tpast.lastIndexOf('.'))), url: tpast, location: folderPath.current})
            .then((res: any)=>setPath(folderPath.current+'/'));
        }
    }
    
    return (
        <Box sx={{
            display: 'inline-flex', 
            alignItems: 'flex-start', 
            flexWrap: 'wrap', 
            height: '100%', 
            minHeight: '86vh',
            backgroundColor: 'floralwhite', 
            padding: '8px', 
            margin: '8px',
            boxShadow: '0 0 10px floralwhite',
            borderRadius: '8px',
            alignContent: 'flex-start'
        }}
            id='folderBox'
            onClick={()=>{setSelectedId(-1); inputIdTrig.current?.focus()}}
        >
            <UploadDiv fileDrag={fileDrag} />
            {!isMobile&&<TextField 
                autoComplete="off" 
                sx={{position: 'absolute', top: '-100px', width: 0, height: 0, zIndex: -1}} 
                id='hiddenInput' 
                onPasteCapture={pasteMove} 
                hidden={true} 
                autoFocus={false} 
                aria-readonly={true}
            />}
            {files?.directs.map((item: string, index: number)=> {
                return (
                    <Fade in={animIn} timeout={index*300} key={item}>
                        <Box sx={{display: 'flex', flexWrap: 'wrap', flexDirection: 'row', alignItems: 'flex-start', zIndex: index==selectedId?1:0}}>
                            <Button                                  
                                onContextMenu={(event: React.MouseEvent<HTMLElement>)=>{setAnchorEl({elem: event.currentTarget, index: index}); event.preventDefault()}}
                                onClick={()=>{setTimeout(()=>setSelectedId(index), 10, index)}}
                                onDoubleClick={()=>setPath((path==='/'?'':path) +(path[path.length-1]==='/'||path[path.length-1]==='\\'?'':'/')+item+'/')} 
                                sx={{
                                    display: 'column-flex', 
                                    maxWidth: '100px', 
                                    maxHeight: '120px', 
                                    overflowWrap: 'anywhere', 
                                    padding: '6px 0px', 
                                    backgroundColor: index==selectedId?'blanchedalmond':'transparent'
                                }}
                            >
                                <FolderIcon sx={{zoom: 2.5, color: '#FF9C0C'}} />
                                <Typography 
                                    sx={{
                                        width: '85px', 
                                        backgroundColor: index==selectedId?'blanchedalmond':'transparent', 
                                        opacity: 0.8,
                                        fontSize: '0.85rem'
                                    }} 
                                    title={item}>
                                        {((item.length>15)&&(index!==selectedId))?(item.slice(0, 12) + `${item.length>12?'...':''}`):item}
                                </Typography>
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
            })}
            {files?.files.map((item: string, index: number)=> {
                return (
                    <Fade in={animIn} timeout={(index+files.directs.length)*300} key={item}>
                        <Box sx={{display: 'flex', flexWrap: 'wrap', flexDirection: 'row', alignItems: 'flex-start', zIndex: (index+files.directs.length)==selectedId?1:0}} key={item}>
                            <Button 
                                onClick={()=>{setTimeout(()=>setSelectedId(index+files.directs.length), 10)}}
                                onContextMenu={(event: React.MouseEvent<HTMLElement>)=>{
                                    setAnchorEl({elem: event.currentTarget, index: index+files.directs.length}); 
                                    event.preventDefault()
                                }}
                                sx={{
                                    display: 'column-flex', 
                                    maxWidth: '100px', 
                                    maxHeight: '120px', 
                                    overflowWrap: 'anywhere', 
                                    padding: '6px 0px', 
                                    backgroundColor: (index+files.directs.length)==selectedId?'blanchedalmond':'transparent'
                                }}
                            >
                                {fileType(item)==='txt'? <TextSnippetIcon sx={{zoom: 2.5, color: '#0AD58D'}} />:
                                    fileType(item)==='archive' ? <FolderZipIcon sx={{zoom: 2.5, color: '#0AD58D'}} />:
                                    fileType(item)==='picture'? 
                                        <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <Box sx={{width: '60px', height: '60px'}}>
                                                <img style={{width: '100%', maxHeight: '100%'}} src={`${window.location.href.includes('http://localhost:8799/')?'http://localhost:8800':''}/data/${path}/${item}`} />
                                            </Box>
                                        </Box> :
                                    fileType(item)==='video'? 
                                    <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <Box sx={{width: '60px', height: '60px'}}>
                                            <video style={{width: '100%', maxHeight: '100%'}} src={`${window.location.href.includes('http://localhost:8799/')?'http://localhost:8800':''}/data/${path}/${item}`} onClick={({target}: any)=>{target.paused?target.play():target.pause()}} />
                                        </Box>
                                    </Box> :
                                    <InsertDriveFileIcon sx={{zoom: 2.5, color: '#0AD58D'}} />}
                                <Typography 
                                    sx={{
                                        width: '85px', 
                                        backgroundColor: (index+files.directs.length)==selectedId?'blanchedalmond':'transparent', 
                                        opacity: 0.8,
                                        fontSize: '0.85rem'
                                    }} 
                                    title={item}
                                >
                                    {((item.length>15)&&(index+files.directs.length!==selectedId))?(item.slice(0, 12) + `${item.length>12?'...':''}`):item}
                                </Typography>
                            </Button>
                            
                            <IconButton
                                sx={{position: 'relative', right: '15px', top: 0, padding: '0px', margin: '-3px'}}
                                aria-haspopup="true"
                                onClick={(event: React.MouseEvent<HTMLElement>)=>{
                                    setAnchorEl({elem: event.currentTarget, index: index+files.directs.length}); 
                                    event.preventDefault()
                                }}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        </Box>
                    </Fade>
                )
            })}
        </Box>
    )
}