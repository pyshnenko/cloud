import * as React from 'react';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import ShareIcon from '@mui/icons-material/Share';
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
import Api from '../frontMech/api';
import {User, userData} from '../frontMech/user';
import Dialog from './dialog';
import download_file from '../frontMech/downloadFile';
import { useLoading } from '../hooks/useLoading';
import { attFile } from '../frontMech/mechanics';
import SearchIcon from '@mui/icons-material/Search';
import { useAlarm } from './alarm';
import Cookies from 'universal-cookie';

const actions = [
  { icon: <FileUploadIcon />, name: 'Загрузить файл' },
  { icon: <FileUploadIcon />, name: 'Загрузить по URL' },
  { icon: <DownloadIcon />, name: 'Скачать содержимое' },
  { icon: <AddIcon />, name: 'Создать папку' },
  { icon: <ShareIcon />, name: 'Поделиться' },
  { icon: <SearchIcon />, name: 'Поиск' },
];

interface props {
    path: string, 
    setPath: (d: string)=>void, 
    files: {directs: string[], files: string[], lined?: boolean}, 
    folder: (p: string)=>void,
    notVerify?: boolean,
    setFiles: (arr: {files: string[], directs: string[], lined?: boolean})=>void
}

export default function SpeedDialTooltipOpen({path, setPath, files, folder, notVerify, setFiles}: props) {
    const [open, setOpen] = React.useState(false);
    const [dialogResult, setDialogResult] = React.useState<{ready: boolean, text?: string, numb?: number}>({ready: false});
    const [dialogOpen, setDialogOpen] = React.useState<{visible: boolean, lbl: string, text: string}>({visible: false, lbl: '', text: ''});
    const loading = useLoading;    
    const alarm = useAlarm;

    React.useEffect(()=>{
        if ((dialogResult.ready)&&(dialogOpen.lbl==='folder')) {
            console.log(dialogResult.text);
            if (dialogResult.text&&dialogResult.text!=='') {
                createFolder(dialogResult.text);
                setDialogOpen({visible: false, lbl: '', text: ''});
                handleClose();
                setDialogResult({ready: false});
            }
            else if (!dialogResult.text) {
                setDialogResult({ready: false});
                setDialogOpen({visible: false, lbl: '', text: ''});
                handleClose();
            }
        }
        if ((dialogResult.ready)&&(dialogOpen.lbl==='url')) {
            console.log(dialogResult.text);
            if (dialogResult.text&&dialogResult.text!=='') {
                urlEnter(dialogResult.text);
                setDialogOpen({visible: false, lbl: '', text: ''});
                handleClose();
                setDialogResult({ready: false});
            }
            else if (!dialogResult.text) {
                setDialogResult({ready: false});
                setDialogOpen({visible: false, lbl: '', text: ''});
                handleClose();
            }
        }
        if ((dialogResult.ready)&&(dialogOpen.lbl==='search')) {
            console.log(dialogResult.text);
            if (dialogResult.text&&dialogResult.text!=='') {
                loading(true, 'search');
                searchEnter(dialogResult.text);
                setDialogOpen({visible: false, lbl: '', text: ''});
                handleClose();
                setDialogResult({ready: false});
            }
            else if (!dialogResult.text) {
                setDialogResult({ready: false});
                setDialogOpen({visible: false, lbl: '', text: ''});
                handleClose();
            }
        }
    }, [dialogResult])

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleAction = (action: string) => {
        if (action === actions[5].name) {
            setDialogResult({ready: false});
            setDialogOpen({visible: true, lbl: 'search', text: 'Поиск'});
        }
        if (action === actions[3].name) {
            setDialogResult({ready: false});
            setDialogOpen({visible: true, lbl: 'folder', text: 'Новая папка'});
        }
        else if (action === actions[1].name) {
            setDialogResult({ready: false});
            setDialogOpen({visible: true, lbl: 'url', text: 'Введи URL'});
        }
        else if (action === actions[2].name) {
            /*loading(true, 'tar');
            Api.askLS(User.getToken(), path, 'tar')
            .then((res: any)=>{
                console.log(res.data.addr);
                download_file((window.location.href==='http://localhost:8799/'?'http://localhost:8801/':'/') + res.data.addr);
            }).catch((e: any)=>console.log(e)).finally(()=>loading(false, 'tar'))*/
            const cookies = new Cookies(null, {path: '/'});
            cookies.set('token', User.getToken());
                loading(true, 'save');
                Api.askLS(User.getToken(), path, 'tar', '', notVerify)
                .then(async (res: any)=>{
                    console.log(res.data);
                    setTimeout((href: string, addr: string)=>
                        {download_file(encodeURI(href.includes('http://localhost:8799/')? ('http://localhost:8801/'+addr) : ('/'+addr))); loading(false, 'save')}, 
                        3000, 
                        window.location.href, 
                        res.data.addr) 
                })
                .catch((e: any)=> {alarm('Что-то пошло не так', 'error'); console.log(e); loading(false, 'save')});
        }
        else if (action === actions[0].name) {
            attFile({notVerify: !!notVerify, path, folder});
            handleClose();
        }
    }

    const createFolder = (name: string) => {
        Api.askLS(User.getToken(), path, 'mkdir', name)
        .then((res: any)=>{
            console.log(res);
            setPath(path+'/'+name);
            setDialogOpen({visible: false, lbl: '', text: ''});
        }).catch((e: any)=>console.log(e));
    }

    const urlEnter = (name: string) => {
        Api.uplByUrl(User.getToken(), {fname: String(Number(new Date())) + name.slice(name.lastIndexOf('.')), url: name, location: path })
        .then((res: any)=>{
            console.log(res);
            setPath(path+'/');
            setDialogOpen({visible: false, lbl: '', text: ''});
        }).catch((e: any)=>console.log(e));
    }

    const searchEnter = (name: string) => {
        Api.searchName(User.getToken(), {name: name, location: path})
        .then((res: {data: {directs: string[], files: string[]}}) => {
            console.log(res.data);
            if ((res.data.files.length)||(res.data.directs.length)) setFiles({...res.data, lined: true})
            else alarm('Ничего не найдено', 'info')
            //setPath(path+'/');
        }).catch((e: any)=>{
            console.log(e);
            
        }).finally(()=>{loading(false, 'search');})
    }

  return (
    <Box>
        <Box sx={{  }}>
        {open&&<Backdrop open={open||dialogOpen} sx={{zIndex: 1}}/>}
            <SpeedDial
                ariaLabel="Меню действий"
                sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
                icon={<SpeedDialIcon />}
                onClose={handleClose}
                onOpen={handleOpen}
                open={open}
            >
                {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    tooltipOpen
                    onClick={()=>handleAction(action.name)}
                />
                ))}
            </SpeedDial>
        </Box>
        {dialogOpen.visible&&<Dialog text={dialogOpen.text} files={files} setResult={setDialogResult} />}
    </Box>
  );
}