require('dotenv').config();
import copy from 'fast-copy';
import { Coupon } from '../src/types/api/types';
import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import { couponCorrectData, candlesCorrectData, bondsID, dataUpd, basicChartState } from '../src/frontMech/tinvMech';
import { Line, Bar } from 'react-chartjs-2';
import Typography from '@mui/material/Typography';
import CouponTable from '../src/frontDesign/couponTable';
import Box from '@mui/material/Box';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
  );

interface DSum {positive: boolean, value: string, price: number}

export default function TInv() {

    const [ actualPrice, setActualPrice ] = useState<number[]>([]);
    const [ deltaSum, setdeltaSum] = useState<DSum[]>([]);
    const [ coupon, setCoupon ] = useState<{hist: Coupon[], totalNow: number, last: Coupon|null, next: Coupon| null}[]>([]);
    const [ data, setData ] = useState<any[]>([]);
    const [ cash, setCash ] = useState<number[]>([]);
    const [ bondName, setBondName ] = useState<string[]>([]);
    let actualPriceBuf: number[] = [];

    const askPost = async (url: string, body: any, auth: string = '') => {
        console.log(body)
        let resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': auth,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        const result = await resp.json();
        console.log(result)
        if (result?.lastPrices) {
            actualPriceBuf.push(Number(result.lastPrices[0].price.units)*10 + 
                Number(String(result.lastPrices[0].price.nano).slice(0,3))/100)
            setActualPrice(actualPriceBuf)
        }
        else if (result?.events) {
            let buf = copy(coupon);
            buf.push(couponCorrectData(result.events));
            setCoupon(buf)
        }
        else if (result?.candles) {
            let buf = copy(data);
            buf.push(candlesCorrectData(result.candles));
            setData(buf)
        }
        else if (result?.ttok) return result.ttok
        else if (result?.instrument) {
            let buf = copy(bondName);
            buf.push(result.instrument.name);
            setBondName(buf)
        }
        else console.log(result)        
    }

    useEffect(() => {
        const tokApi: string = '/api/tokenUpd';
        const tokBody = {oldToken: '', atoken: 't'};
        askPost(tokApi, tokBody).then((res: string)=>{ console.log(res);
            if (res.length>10) dataUpd('Bearer ' + res, askPost)
        })
        //const tok = 'Bearer '+askPost(tokApi, tokBody);
        
    },[])

    useEffect(()=> {
        let dSumBuf: {positive: boolean, value: string, price: number}[] = [];
        let cashBuf: number[] = [];
        console.log(actualPrice)
        actualPrice.map((item: number, index: number)=>{
            const delta = Math.floor(bondsID[index].price*bondsID[index].totalSum*item/1000 - bondsID[index].price*bondsID[index].totalSum);
            const value: string = delta > 0 ? `+${delta}` : `${delta}`;
            dSumBuf.push({positive: delta > 0, value, price: delta})
            cashBuf.push(Math.floor(bondsID[index].price*bondsID[index].totalSum*item/1000))
        })
        setdeltaSum(dSumBuf)
        setCash(cashBuf)
    }, [actualPrice])

    const priceToWiew = (price: number) => {
        return {pos: price>0, value: price > 0 ? `+${price}` : `${price}`}
    }

    return (
        <Box sx={{display: 'flex', justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap', maxWidth: '400px'}}>
            {deltaSum.map((item: DSum, index: number) => { return (
                <Box sx={{border: '1px solid lightgray', width: '80%', minWidth: '340px', borderRadius: '20px'}} key={bondsID[index].id}>
                    <Box sx={{margin: 1}}>
                        <Typography align='center' component={'h1'} fontSize={'large'}>{bondName}</Typography>
                        <Box sx={{marginTop: 1}}>
                            <Typography>Цена сейчас: {actualPrice}</Typography>
                            <Box sx={{display: 'inline-flex'}}>
                                <Typography>Мой кошелек сейчас: {cash}</Typography>
                                <Typography color={item.positive?'green':'error'}>,  {item.value}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{marginTop: 1}}>
                            <Typography>Купоны:</Typography>
                            {coupon[index]?.last?<Box>
                                <Typography>Предыдущий: {coupon[index].last?.price} от {coupon[index].last?.date.toLocaleDateString()}</Typography>
                                <Typography>Размер: {coupon[index].last?.price*bondsID[index].totalSum} от {coupon[index].last.date.toLocaleDateString()}</Typography>
                            </Box>:null}
                            {coupon[index]?.next?<Box>
                                <Typography>Предстоящий: {coupon[index].next.price} от {coupon[index].next.date.toLocaleDateString()}</Typography>
                                <Typography>Размер: {coupon[index].next.price*bondsID[index].totalSum} от {coupon[index].next.date.toLocaleDateString()}</Typography>
                            </Box>:null}
                            {coupon !== undefined && coupon !== null && coupon[index]?.hist && 
                                <CouponTable coupon={coupon[index].hist} bondSum={bondsID[index].totalSum} />}
                        </Box>
                        <Box sx={{marginTop: 1}}>
                            <Typography>Итого </Typography>
                            <Typography>Купонов: {(coupon[index]?.totalNow||0) * bondsID[index].totalSum}</Typography>
                            <Box sx={{display: 'inline-flex'}}>
                                <Typography>Кошелек: {((coupon[index]?.totalNow||0) * bondsID[index].totalSum) + cash[index]}</Typography>
                                <Typography color={priceToWiew(
                                    (coupon[index]?.totalNow||0) * bondsID[index].totalSum + deltaSum[index].price).pos?
                                    'green':
                                    'error'}>
                                        ,  {priceToWiew((coupon[index]?.totalNow||0) * bondsID[index].totalSum + deltaSum[index].price).value}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{marginBottom: 2}}>
                        <Box sx={{maxWidth: '700px', margin: 0, padding: 0}}>
                            {data[index] && <Line data={data[index]} />}
                        </Box>
                    </Box>
                </Box>
            )})}
        </Box>
    )
}