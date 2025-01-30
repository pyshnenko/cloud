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

export default function CouponTable({coupon, bondSum}: {coupon: Coupon[], bondSum: number}) {
    return (<Box>
        <Accordion sx={{margin: 0, padding: 0}}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}         
            >
                <Typography>Все купоны</Typography>
            </AccordionSummary>
            <AccordionDetails  sx={{margin: 0, padding: 0}}>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 300 }} aria-label="bond table">
                        <TableHead>
                            <TableCell>Дата</TableCell>
                            <TableCell>Размер</TableCell>
                            <TableCell>Сумма</TableCell>
                            <TableCell></TableCell>
                        </TableHead>
                        <TableBody>
                            {coupon.map((bond: Coupon)=>{
                                return (
                                    <TableRow key={bond.date.toLocaleDateString()}>
                                        <TableCell>{bond.date.toLocaleDateString()}</TableCell>
                                        <TableCell>{bond.price}</TableCell>
                                        <TableCell>{(bond.price*bondSum).toFixed(2)}</TableCell>
                                        <TableCell>{bond.done ? (bond.check ? <DoneAllIcon sx={{color: 'green'}} /> :<CheckIcon sx={{color: 'orange'}} />) : null}</TableCell>
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