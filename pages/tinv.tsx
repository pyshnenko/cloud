require('dotenv').config();
import { Coupon } from '../src/types/api/types';
import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import { couponCorrectData, candlesCorrectData, bondsID, dataUpd, basicChartState } from '../src/frontMech/tinvMech';
import { Line, Bar } from 'react-chartjs-2';
import Typography from '@mui/material/Typography';
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

export default function TInv() {

    const [actualPrice, setActualPrice] = useState<number>(-1);
    const [ deltaSum, setdeltaSum] = useState<{positive: boolean, value: string, price: number}>({positive: false, value: '0', price: 0});
    const [coupon, setCoupon] = useState<{hist: Coupon[], totalNow: number, last: Coupon|null, next: Coupon| null}|null>();
    const [ data, setData ] = useState<any>(basicChartState);
    const [cash, setCash] = useState<number>(0);

    const askPost = async (url: string, body: any, auth: string = '') => {
        let resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': auth,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        const result = await resp.json();
        if (result?.lastPrices) setActualPrice(Number(result.lastPrices[0].price.units)*10 + 
            Number(String(result.lastPrices[0].price.nano).slice(0,3))/100)
        else if (result?.events) setCoupon(couponCorrectData(result.events))
        else if (result?.candles) setData(candlesCorrectData(result.candles))
        else if (result?.ttok) return result.ttok
        else console.log(result)        
    }

    useEffect(() => {
        const tokApi: string = '/api/tokenUpd';
        const tokBody = {oldToken: '', atoken: 't'};
        askPost(tokApi, tokBody).then((res: string)=>{
            if (res.length>10) dataUpd('Bearer ' + res, askPost)
        })
        //const tok = 'Bearer '+askPost(tokApi, tokBody);
        
    },[])

    useEffect(()=> {
        const delta = Math.floor(bondsID[0].price*bondsID[0].totalSum*actualPrice/1000 - bondsID[0].price*bondsID[0].totalSum);
        const value: string = delta > 0 ? `+${delta}` : `${delta}`;
        setdeltaSum({positive: delta > 0, value, price: delta})
        setCash(Math.floor(bondsID[0].price*bondsID[0].totalSum*actualPrice/1000))
    }, [actualPrice])

    const priceToWiew = (price: number) => {
        return {pos: price>0, value: price > 0 ? `+${price}` : `${price}`}
    }

    return (
    <Box>
        <Typography>Цена сейчас: {actualPrice}</Typography>
        <Box sx={{display: 'inline-flex'}}>
            <Typography>Мой кошелек сейчас: {cash}</Typography>
            <Typography color={deltaSum.positive?'green':'error'}>,  {deltaSum.value}</Typography>
        </Box>
        <Typography>Купоны:</Typography>
        {coupon?.last?<Box>
            <Typography>Предыдущий: {coupon.last?.price} от {coupon.last?.date.toLocaleDateString()}</Typography>
            <Typography>Размер: {coupon.last?.price*bondsID[0].totalSum} от {coupon.last.date.toLocaleDateString()}</Typography>
        </Box>:null}
        {coupon?.next?<Box>
            <Typography>Предстоящий: {coupon.next.price} от {coupon.next.date.toLocaleDateString()}</Typography>
            <Typography>Размер: {coupon.next.price*bondsID[0].totalSum} от {coupon.next.date.toLocaleDateString()}</Typography>
        </Box>:null}
        <Box>
            <Typography>Итого </Typography>
            <Typography>Купонов: {(coupon?.totalNow||0) * bondsID[0].totalSum}</Typography>
            <Box>
                <Typography>Кошелек: {((coupon?.totalNow||0) * bondsID[0].totalSum) + cash}</Typography>
                <Typography color={priceToWiew(
                    (coupon?.totalNow||0) * bondsID[0].totalSum + deltaSum.price).pos?
                    'green':
                    'error'}>
                        ,  {priceToWiew((coupon?.totalNow||0) * bondsID[0].totalSum + deltaSum.price).value}
                </Typography>
            </Box>
        </Box>
        <Line data={data} />
    </Box>)
}