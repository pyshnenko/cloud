import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import {User} from '../frontMech/user';
import UploadDiv from './uploadDiv';
import mobile from 'is-mobile';
import Api from '../frontMech/api';
import { urlCheck } from '../frontMech/checkMech';
import { getFileAsync, attFileSend } from '../frontMech/mechanics';
import FileFoldBox from './small/fBox';

export default function FilePalette ({files, path, setSelectedId, selectedId, setAnchorEl, setPath, animIn, fileType, datal, notVerify, folder}: any) {

    const [ fileDrag, setFileDrag ] = useState<boolean>(false);
    const [ isMobile, setIsMobile ] = useState<boolean>(false);

    const username = useRef(datal);
    const folderPath = useRef(path);
    let inputIdTrig = useRef<any>(null);

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
            alignContent: 'flex-start',
            flexDirection: files?.lined ? 'column' : 'row'
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
                    <FileFoldBox 
                        animIn={animIn} 
                        text={item} 
                        index={index} 
                        setAnchorEl={setAnchorEl} 
                        path={path} 
                        setPath={setPath} 
                        setSelectedId={setSelectedId} 
                        lined={files?.lined} 
                        selected={index==selectedId} 
                        folder={true}
                    />
                )
            })}
            {files?.files.map((item: string, index: number)=> {
                return (
                    <FileFoldBox 
                        animIn={animIn} 
                        text={item} 
                        index={(index+files.directs.length)} 
                        setAnchorEl={setAnchorEl} 
                        path={path} 
                        setPath={setPath} 
                        setSelectedId={setSelectedId} 
                        lined={files?.lined} 
                        selected={(index+files.directs.length)==selectedId} 
                        folder={false}
                    />                    
                )
            })}
        </Box>
    )
}