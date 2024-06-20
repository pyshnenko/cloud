import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

interface props {
    name: string,
    text: string,
    width?: number,
    expanded: string | false,
    setExpanded: (s: string | false)=>void,
    top: number,
    left: boolean,
    url: string
}

export default function DemoAccordeon ({name, text, width, expanded, setExpanded, top, left, url}: props) {

    const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
		setExpanded(isExpanded ? panel : false);
	};

    const style = {
		margin: 2,
		position: 'fixed',
		width: '15%'
	}

    return (
        <Accordion  
            sx={{
                ...style, 
                top: `${top}%`, 
                left: left?'2%':'auto', 
                right: (!left&&top!==0)?'2%':'auto', 
                minWidth: expanded === name? "250px" : '150px',
                zIndex: expanded === name ? 1 : 0
            }} 
            expanded={expanded === name} 
            onChange={handleChange(name)}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{name}</Typography>
            </AccordionSummary>
            <AccordionDetails >
                <Typography sx={{paddingBottom: 1}}>{text}</Typography>
                <Button sx={{width: '100%'}} variant="contained" onClick={()=>{window.location.href = url}}>{name}</Button>
            </AccordionDetails>
        </Accordion>
    )
}