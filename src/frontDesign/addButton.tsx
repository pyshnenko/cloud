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

const actions = [
  { icon: <FileUploadIcon />, name: 'Загрузить файл' },
  { icon: <DownloadIcon />, name: 'Скачать содержимое' },
  { icon: <AddIcon />, name: 'Создать папку' },
  { icon: <ShareIcon />, name: 'Поделиться' },
];

export default function SpeedDialTooltipOpen({path, setPath, files}: {path: string, setPath: (d: string)=>void, files: {directs: string[], files: string[]}}) {
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
                setPath(path+'/'+dialogResult.text);
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
    }  

    const createFolder = (name: string) => {
        Api.askLS(User.getToken(), path, 'mkdir', name)
        .then((res: any)=>{
            console.log(res);
        }).catch((e: any)=>console.log(e));
        setDialogOpen(false);
        setPath(path+'/'+name);
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