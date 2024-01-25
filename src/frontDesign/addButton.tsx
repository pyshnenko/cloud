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

const actions = [
  { icon: <FileUploadIcon />, name: 'Загрузить файл' },
  { icon: <DownloadIcon />, name: 'Скачать содержимое' },
  { icon: <AddIcon />, name: 'Создать папку' },
  { icon: <ShareIcon />, name: 'Поделиться' },
];

interface props {
    path: string, 
    setPath: (d: string)=>void, 
    files: {directs: string[], files: string[]}, 
    folder: (p: string)=>void,
    notVerify?: boolean
}

export default function SpeedDialTooltipOpen({path, setPath, files, folder, notVerify}: props) {
    const [open, setOpen] = React.useState(false);
    const [dialogResult, setDialogResult] = React.useState<{ready: boolean, text?: string, numb?: number}>({ready: false});
    const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

    React.useEffect(()=>{
        if (dialogResult.ready) {
            console.log(dialogResult.text);
            if (dialogResult.text&&dialogResult.text!=='') {
                console.log('aaa');
                createFolder(dialogResult.text);
                setDialogOpen(false);
                handleClose();
                //setPath(path+'/'+dialogResult.text);
                setDialogResult({ready: false});
            }
            else if (!dialogResult.text) {
                console.log('bbb');
                setDialogResult({ready: false});
                setDialogOpen(false);
                handleClose();
            }
        }
    }, [dialogResult])

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleAction = (action: string) => {
        if (action === actions[2].name) {
            setDialogResult({ready: false});
            setDialogOpen(true);
        }
        else if (action === actions[1].name) {
            Api.askLS(User.getToken(), path, 'tar')
            .then((res: any)=>{
                console.log(res.data.addr);
                download_file((window.location.href==='http://localhost:8799/'?'http://localhost:8800/':'/') + res.data.addr);
                //window.open((window.location.href==='http://localhost:8799/'?'http://localhost:8800/':'/') + res.data.addr)
            }).catch((e: any)=>console.log(e))
        }
        else if (action === actions[0].name) {
            attFile();
            handleClose();
        }
    }

    const attFile = async () => {
        let input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = async (e: any) => {
            let files = e.target.files;
            console.log(files)
            for (let i = 0; i<files.length; i++) {
                console.log(files)
                let data = new FormData();
                data.append('file', files[i]);
                const options = {
                    method: 'POST',
                    headers: {
                        folder: encodeURI((notVerify?'':(userData.login+'/'))+(path==='/'?'':path)),
                        fname: encodeURI(files[i].name),
                        user: encodeURI(userData.login),
                        token: encodeURI(User.getToken())
                    },
                    body: data,
                }                
                const response = await fetch((window.location.href.slice(0,22)==='http://localhost:8799/')?
                    'http://localhost:8800/upload':
                    '/upload', options);//http://localhost:8800/upload
                const res = await response.json();
                console.log(res);
                folder(path);
            }
            const oPath = path;
            setPath('');
            setPath(path);
        }
        
        input.click();
    }

    const createFolder = (name: string) => {
        Api.askLS(User.getToken(), path, 'mkdir', name)
        .then((res: any)=>{
            console.log(res);
            setPath(path+'/'+name);
            setDialogOpen(false);
        }).catch((e: any)=>console.log(e));
    }

  return (
    <Box>
        <Box sx={{ height: '99vh', width: '99vw', position: 'fixed', padding: 0, margin: 0 }}>
        <Backdrop open={open||dialogOpen} />
            <SpeedDial
                ariaLabel="Меню действий"
                sx={{ position: 'absolute', bottom: 16, right: 16 }}
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
        {dialogOpen&&<Dialog text={'Новая папка'} files={files} setResult={setDialogResult}/>}
    </Box>
  );
}