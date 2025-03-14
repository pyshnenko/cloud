import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Coupon } from '../types/api/types';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { BondData } from '../types/api/types';

const tableSX = {margin: 0, padding: 0};

interface CTable {
    coupon: {hist: Coupon[], totalNow: number, totalIfStartNow: number, last: Coupon|null, next: Coupon| null}, 
    bondSum: number, 
    bondPrice: number, 
    bondID: string,
    bondsID: BondData[],
    reinvSum: {[key: string]: {priceSum: number, sum: number}}, 
    setReinvSum: (v: {[key: string]: {priceSum: number, sum: number}})=>void
};

export default function CouponTable({coupon, bondSum, bondPrice, bondID, bondsID, reinvSum, setReinvSum}: CTable) {

    const [ reinvCoupon, setReinvCoupon ] = useState<number[]>([])

    useEffect(()=> {
        let buf: number[] = [];
        buf.push(coupon.hist[coupon.hist.length-1].price*bondSum);
        let bufCouponReSum: number = bondSum;
        let reSummary: number = coupon.hist[coupon.hist.length-1].check ? buf[0] : 0;
        for (let i = coupon.hist.length-2; i >= 0; i--) {
            const bufReVal: number = coupon.hist[i].price * bufCouponReSum;
            buf.unshift(bufReVal);
            if (((coupon.hist[i].check) || !coupon.hist[i].done)) {
                reSummary += bufReVal
                bufCouponReSum += Math.floor(coupon.hist[i].price * bufCouponReSum / bondPrice);
            }
        }
        setReinvCoupon(buf);
        setReinvSum({...reinvSum, [bondID]: {priceSum: reSummary, sum: bufCouponReSum}})//{priceSum: number, sum: number}
    }, [coupon, bondsID])

    return (<Box>
        <Accordion sx={{margin: 0, padding: 0}}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}         
            >
                <Typography>Все купоны</Typography>
            </AccordionSummary>
            <AccordionDetails  sx={{margin: 0, padding: 0}}>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 300 }} aria-label="bond table" size="small">
                        <TableHead>
                            <TableCell sx={tableSX}>Дата</TableCell>
                            <TableCell sx={tableSX}>Размер</TableCell>
                            <TableCell sx={tableSX}>Сумма</TableCell>
                            <TableCell sx={tableSX}>Реинв</TableCell>
                            <TableCell sx={tableSX}></TableCell>
                        </TableHead>
                        <TableBody>
                            {coupon.hist.map((bond: Coupon, index: number)=>{
                                return (
                                    <TableRow key={bond.date.toLocaleDateString()}>
                                        <TableCell sx={tableSX}>{bond.date.toLocaleDateString()}</TableCell>
                                        <TableCell sx={tableSX}>{bond.price}</TableCell>
                                        <TableCell sx={tableSX}>{(bond.price*bondSum).toFixed(2)}</TableCell>
                                        <TableCell sx={tableSX}>{(reinvCoupon[index] || 0).toFixed(2)}</TableCell>
                                        <TableCell sx={tableSX}>{bond.done ? (bond.check ? <DoneAllIcon sx={{color: 'green'}} /> :<CheckIcon sx={{color: 'orange'}} />) : null}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </AccordionDetails>
        </Accordion>
    </Box>)
}