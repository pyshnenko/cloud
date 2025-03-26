import Typography from '@mui/material/Typography';

interface props {
    lined?: boolean,
    isSelected: boolean
    text: string
}

export default function FnamesTypography ({lined, isSelected, text}: props) {
    return (
        <Typography 
            sx={{
                width: lined ? '75%' :'85px', 
                backgroundColor: isSelected?'blanchedalmond':'transparent', 
                opacity: 0.8,
                fontSize: '0.85rem',
                textAlign: lined ? 'left' : 'center'
            }} 
            title={text}>
                {((text.length>(lined ? 100:15))&&(!isSelected))?(text.slice(0, lined ? 98:10) + `${text.length>(lined ? 98:10)?'...':''}`):text}
        </Typography>
    )
}
