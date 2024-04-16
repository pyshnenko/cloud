import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';

export default function UploadDiv ({fileDrag}: {fileDrag: boolean}) {
    return (
        <Fade in={fileDrag}>
            <Box sx={{
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: fileDrag?'100vw':0, 
                height: fileDrag?'100vh':0, 
                opacity: '0.7 !important', 
                backgroundColor: 'black', 
                zIndex: 1001,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }} 
        >
            <Box sx={{
                maxWidth: '100%',
                width: '90%',
                maxHeight: '100%',
                height: '85%',
                borderRadius: '100px',
                border: 'dashed 20px aquamarine',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <CloudUploadIcon sx={{width: '100px', height: '100px', color: 'aquamarine'}} />
            </Box>
            <Box sx={{opacity: 0, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0}} id='folderBox2'/>
        </Box></Fade>
    )
}