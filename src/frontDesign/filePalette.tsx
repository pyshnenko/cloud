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
import { useLoading } from '../hooks/useLoading';
import {User, userData} from '../frontMech/user';
import UploadDiv from './uploadDiv';

export default function FilePalette ({files, path, setSelectedId, selectedId, setAnchorEl, setPath, animIn, fileType, datal, notVerify, folder}: any) {

    const [ fileDrag, setFileDrag ] = useState<boolean>(false);

    const username = useRef(datal);
    const folderPath = useRef(path);
    let inputIdTrig = useRef<any>(null);

    const loading = useLoading;

    useEffect(()=>{
        username.current=datal;
    }, [datal])

    useEffect(()=>{
        folderPath.current=path;
        console.log(path)
    }, [path])

    useEffect(()=>{
        console.log(fileDrag)
    }, [fileDrag])
    
    useEffect(()=>{
        console.log("user: " + datal);
        const dropZone = document.getElementById('folderBox');
        const dropZone2 = document.getElementById('folderBox2');
        const inputElem = document.getElementById('hiddenInput');
        inputElem?.focus();
        inputIdTrig.current = inputElem;

        if (dropZone&&dropZone2) {
            let hoverClassName = 'hover';
        
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
                setFileDrag(false);

                const files = Array.from(e.dataTransfer.files);
                console.log(files);
                attFile(await getFileAsync(e.dataTransfer));
                //console.log(await getFileAsync(e.dataTransfer));
                // TODO что-то делает с файлами...
            });            
        }
    }, [])

    const getFileAsync = async (dataTranfer: any) => {
        const files = [];
        let itemInp = [];
        let itemL = dataTranfer.items.length;
        console.log(itemL);
        for (var i = 0; i < dataTranfer.items.length; i++) 
            itemInp.push(dataTranfer.items[i]);
        console.log(itemInp);
        for (var i = 0; i < itemInp.length; i++) {
            const item = itemInp[i];
            if (item.kind === 'file') {
                if (typeof item.webkitGetAsEntry === 'function'){
                    const entry = item.webkitGetAsEntry();
                    console.log(entry);
                    /*const entryContent: any = await filesFromFolders(entry);
                    console.log(entryContent)
                    entryContent.map((itemMap: any)=> {
                        console.log(itemMap)
                        if (itemMap) files.push(itemMap);
                    })
                    console.log(files)*/
                    const entryContent: any = await readEntryContentAsync(entry);
                    console.log(entryContent)
                    files.push(...entryContent);

                    continue;
                }
    
                const file = item.getAsFile();
                console.log(file)
                if (file) { files.push(file); }
            }
            else console.log(item.kind)
        }
        console.log(files)
        return files;
    };

    const filesFromFolders = async (entry: any) => {
        console.log(entry);
        const contents: any[] = [];
        await readEntry(contents, entry);
        console.log(contents)
        return contents;
        
    }

    async function readEntry(contents: any[], inpEntry: any, fstSt: boolean = true) {
        console.log(inpEntry);
        if (inpEntry.isFile) {                    
            inpEntry.file((file: any) => {
                //const newFileName = entry.fullPath;
                //file.name = entry.fullPath;
                contents.push({file, fileName: file.name, path: folderPath.current+inpEntry.fullPath.slice(0, inpEntry.fullPath.length-file.name.length-1)});
                console.log(contents)
                if (fstSt) return contents;
            });
        }
        else if (inpEntry.isDirectory) {
            inpEntry.createReader()
                .readEntries(async function(entries: any) {
                    for (const entry of entries) {
                        contents.push(await readEntry(contents, entry, false));
                    }console.log(contents)
                    if (fstSt) return contents
                })
        }
    }
    
    // Возвращает Promise со всеми файлами иерархии каталогов
    const readEntryContentAsync = async (entry: any) => {
        console.log(entry);
        return new Promise((resolve, reject) => {
            let reading = 0;
            const contents: any[] = [];
    
            readEntry(entry);
    
            function readEntry(entry: any) {
                //console.log(entry)
                if (entry.isFile) {
                    reading++;                    
                    entry.file((file: any) => {
                        reading--;
                        const newFileName = entry.fullPath;
                        //file.name = entry.fullPath;
                        contents.push({file, fileName: file.name, path: folderPath.current+entry.fullPath.slice(0, entry.fullPath.length-file.name.length-1)});
                        if (reading === 0) {
                            resolve(contents);
                        }
                    });
                } else if (entry.isDirectory) {
                    readReaderContent(entry.createReader());
                }
            };
          
            function readReaderContent(reader: any) {
                reading++;
                reader.readEntries(function(entries: any) {
                    reading--;
                    for (const entry of entries) {
                        readEntry(entry);
                    }
                    if (reading === 0) {
                        resolve(contents);
                    }
                });
            };
        });
    };

    const attFile = async (files: any[]) => {
        console.log(files)
        for (let i = 0; i<files.length; i++) {
            console.log(files)
            let data = new FormData();
            data.append('file', files[i].file);
            const options = {
                method: 'POST',
                headers: {
                    folder: encodeURI(userData.login+'/'+files[i].path),
                    fname: encodeURI(files[i].fileName),
                    user: encodeURI(userData.login),
                    token: encodeURI(User.getToken())
                },
                body: data,
            }                
            try{
                const response = await fetch((window.location.href.slice(0,22)==='http://localhost:8799/')?
                    'http://localhost:8800/upload':
                    '/upload', options);//http://localhost:8800/upload
                const res = await response.json();
                console.log(res);
            }
            catch (e: any) {}
            //folder(path);
        }
        const oPath = folderPath.current;            
        loading(false, 'attFile');
        setPath('//');
        setTimeout(()=>{
            setPath(oPath);
            loading(false, 'attFile');
        }, 1000);
        console.log(oPath);
        //setPath(oPath);
    }

    const pasteMove = (evt: any) => {
        let files = evt.clipboardData.files;
        console.log(files)
        let upFiles: any[] = [];
        for (let i = 0; i< files.length; i++) {
            upFiles.push({file: files[i], fileName: files[i].name==='image.png'?String(files[i].lastModified)+'.png':files[i].name, path: folderPath.current});
        }
        attFile(upFiles);
    }
    
    return (
        <Box sx={{
            display: 'inline-flex', 
            alignItems: 'flex-start', 
            flexWrap: 'wrap', 
            height: '100%', 
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
            <TextField sx={{position: 'absolute', top: '-100px'}} id='hiddenInput' onPasteCapture={pasteMove} />
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
                                        fontSize: '0.95rem'
                                    }} 
                                    title={item}>
                                        {((item.length>15)&&(index!==selectedId))?(item.slice(0, 12) + `${item.length>12?'...':''}`):item}
                                </Typography>
                            </Button>
                            <IconButton
                                sx={{position: 'relative', right: '15px', top: '0px', padding: '1px'}}
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
                                                <img style={{width: '100%'}} src={`${window.location.href.includes('http://localhost:8799/')?'http://localhost:8800':''}/data/${path}/${item}`} />
                                            </Box>
                                        </Box> :
                                    <InsertDriveFileIcon sx={{zoom: 2.5, color: '#0AD58D'}} />}
                                <Typography 
                                    sx={{
                                        width: '85px', 
                                        backgroundColor: (index+files.directs.length)==selectedId?'blanchedalmond':'transparent', 
                                        opacity: 0.8,
                                        fontSize: '0.95rem'
                                    }} 
                                    title={item}
                                >
                                    {((item.length>15)&&(index+files.directs.length!==selectedId))?(item.slice(0, 12) + `${item.length>12?'...':''}`):item}
                                </Typography>
                            </Button>
                            
                            <IconButton
                                sx={{position: 'relative', right: '15px', top: 0, padding: '1px'}}
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