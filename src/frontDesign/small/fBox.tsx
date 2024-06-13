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
    folder: boolean
}

export default function FileFoldBox({animIn, index, lined, selected, text, setAnchorEl, setSelectedId, path, setPath, folder}: props) {
    return (
        <Fade in={animIn} timeout={index*300} key={text}>
            <Box sx={{
                    display: 'flex', 
                    flexWrap: 'nowrap', 
                    flexDirection: 'row', 
                    alignItems: lined ? 'center' :'flex-start', 
                    zIndex:selected?1:0,
                    width: lined ? '100%' : 'auto',
                    borderBottom: lined ? '1px solid gray' : 'none'
                }}>
                <Button                                  
                    onContextMenu={(event: React.MouseEvent<HTMLElement>)=>{setAnchorEl({elem: event.currentTarget, index: index}); event.preventDefault()}}
                    onClick={()=>{setTimeout(()=>setSelectedId(index), 10, index)}}
                    onDoubleClick={()=>setPath((path==='/'?'':path) +(path[path.length-1]==='/'||path[path.length-1]==='\\'?'':'/')+text+'/')} 
                    sx={{
                        display: 'flex', 
                        maxWidth: !lined ? '100px' : 'auto', 
                        width: lined ? '95%' : 'auto', 
                        maxHeight: '120px', 
                        overflowWrap: 'anywhere', 
                        padding: '6px 0px', 
                        backgroundColor: selected?'blanchedalmond':'transparent',
                        flexDirection: !lined ? 'column' : 'row',
                        justifyContent: lined ? 'flex-start' : 'center'
                    }}
                >
                    {folder?<FolderIcon sx={{zoom: 2.5, color: '#FF9C0C'}} />:
                        fileType(text)==='txt'? <TextSnippetIcon sx={{zoom: 2.5, color: '#0AD58D'}} />:
                        fileType(text)==='archive' ? <FolderZipIcon sx={{zoom: 2.5, color: '#0AD58D'}} />:
                        fileType(text)==='picture'? 
                            <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <Box sx={{width: '60px', height: '60px'}}>
                                    <img style={{width: '100%', maxHeight: '100%'}} src={`${window.location.href.includes('http://localhost:8799/')?'http://localhost:8800':''}/data/${path}/${text}`} />
                                </Box>
                            </Box> :
                        fileType(text)==='video'? 
                        <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Box sx={{width: '60px', height: '60px'}}>
                                <video style={{width: '100%', maxHeight: '100%'}} src={`${window.location.href.includes('http://localhost:8799/')?'http://localhost:8800':''}/data/${path}/${text}`} onClick={({target}: any)=>{target.paused?target.play():target.pause()}} />
                            </Box>
                        </Box> :
                        <InsertDriveFileIcon sx={{zoom: 2.5, color: '#0AD58D'}} />}
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

const fileType = (name: string) => {
    let item: string = name.toLocaleLowerCase().slice(-4);
    if (item === 'txt') return 'txt'
    else {
        let endText = 'other'
        imgEnd.forEach((itemP: string)=>{if (name.includes(itemP)) endText='picture'})
        archEnd.forEach((itemP: string)=>{if (name.includes(itemP)) endText='archive'})
        vidEnd.forEach((itemP: string)=>{if (name.includes(itemP)) endText='video'})
        return endText
    }
}