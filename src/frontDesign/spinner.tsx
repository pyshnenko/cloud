import '../style/spiner.css'
import Box from '@mui/material/Box';

export default function Spinner() {
    return (
        <Box className={'spinner'}>
            <div className="spinner-circle spinner-circle-outer"></div>
            <div className="spinner-circle-off spinner-circle-inner"></div>
            <div className="spinner-circle spinner-circle-single-1"></div>
            <div className="spinner-circle spinner-circle-single-2"></div>
            <div className="text">...Загрузка...</div>
        </Box>
    )
}