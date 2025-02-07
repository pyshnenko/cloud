require('dotenv').config();
import copy from 'fast-copy';
import { Coupon } from '../src/types/api/types';
import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import { couponCorrectData, candlesCorrectData, bondsIDBase, dataUpd, basicChartState } from '../src/frontMech/tinvMech';
import { Line, Bar } from 'react-chartjs-2';
import Typography from '@mui/material/Typography';
import CouponTable from '../src/frontDesign/couponTable';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CachedIcon from '@mui/icons-material/Cached';
import { BondData } from '../src/types/api/types';
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

    const [ actualPrice, setActualPrice ] = useState<{[key: string]: number}>({});
    const [ deltaSum, setdeltaSum] = useState<{[key: string]:DSum}>({});
    const [ coupon, setCoupon ] = useState<{[key: string]:{hist: Coupon[], totalNow: number, totalIfStartNow: number, last: Coupon|null, next: Coupon| null}}>({});
    const [ data, setData ] = useState<{[key: string]: any}>({});
    const [ cash, setCash ] = useState<{[key: string]: number}>({});
    const [ bondName, setBondName ] = useState<{[key: string]: {name: string, offDate: Date}}>({});
    const [ bondsID, setBondsID ] = useState<BondData[]>(bondsIDBase);
    const [ reinvCouponSum, setReinvCouponSum ] = useState<{[key: string]: {priceSum: number, sum: number}}>({});

    const refBondsValue = useRef<{
        aPrice?: {[key: string]: number},
        coup?: {[key: string]:{hist: Coupon[], totalNow: number, totalIfStartNow: number, last: Coupon|null, next: Coupon| null}}, 
        dt?: {[key: string]: any},
        bName?: {[key: string]: {name: string, offDate: Date}}
    }>();

    const askPost = async (url: string, body: any, bondIDNum: number, auth: string = '') => {
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
        if (result?.lastPrices)
            setActualPrice({...refBondsValue.current?.aPrice, [bondsID[bondIDNum].id]: (Number(result.lastPrices[0].price?.units || 0) + 
                Number(String(result.lastPrices[0].price?.nano || 0).slice(0,3))/1000)/100 * bondsID[bondIDNum].value})
        else if (result?.events) {
            setCoupon({...refBondsValue.current?.coup, [bondsID[bondIDNum].id]: couponCorrectData(result.events, bondIDNum, bondsID)})
        }
        else if (result?.candles) {
            setData({...refBondsValue.current?.dt, [bondsID[bondIDNum].id]: candlesCorrectData(result.candles, bondsID[bondIDNum].value)})
        }
        else if (result?.ttok) return result.ttok
        else if (result?.instrument) {
            setBondName({...refBondsValue.current?.bName, [bondsID[bondIDNum].id]: {name: result.instrument.name, offDate: new Date(result.instrument.maturityDate)}})
        }
        else console.log(result)        
    }

    useEffect(() => {
        const tokApi: string = '/api/tokenUpd';
        const tokBody = {oldToken: '', atoken: 't'};
        askPost(tokApi, tokBody, -1).then((res: string)=>{ 
            if (res.length>10) dataUpd('Bearer ' + res, askPost, 0, bondsID)
        })
        //const tok = 'Bearer '+askPost(tokApi, tokBody);
        
    },[])

    useEffect(()=> {
        refBondsValue.current = {...refBondsValue.current, aPrice: actualPrice};
        let dSumBuf: {[key: string]:{positive: boolean, value: string, price: number}} = {};
        let cashBuf: {[key: string]: number} = {};
        Object.keys(actualPrice).map((item: string, index: number)=>{
            const delta = Math.floor((actualPrice[item] - bondsID[index].price)*bondsID[index].totalSum);
            const value: string = delta > 0 ? `+${delta}` : `${delta}`;
            dSumBuf[item] = {positive: delta > 0, value, price: delta}
            cashBuf = {...cashBuf, [item]: Math.floor(bondsID[index].totalSum*actualPrice[item])}
        })
        setdeltaSum(dSumBuf)
        setCash(cashBuf)
    }, [actualPrice])

    useEffect(() => {
        refBondsValue.current = {...refBondsValue.current, coup: coupon};
    }, [coupon])

    useEffect(() => {
        refBondsValue.current = {...refBondsValue.current, dt: data};
    }, [data])

    useEffect(() => {
        refBondsValue.current = {...refBondsValue.current, bName: bondName};
    }, [bondName])

    const priceToWiew = (price: number | string) => {
        return {pos: Number(price)>0, value: Number(price) > 0 ? `+${price}` : `${price}`}
    }

    const formUpdate = (evt: React.FormEvent<HTMLFormElement>, id: number) => {
        evt.preventDefault();
        const form = new FormData(evt.currentTarget);
        const value: number = Number(form.get('value'));
        const price: number = Number(form.get('price'));
        let buf: BondData[] = copy(bondsID);
        buf[id].totalSum = value;
        buf[id].price = price;
        setBondsID(buf);
        setActualPrice(copy(actualPrice))
        console.log(buf)
    }

    return (
        <Box sx={{display: 'flex', justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start'}}>
            {bondsID.map((item: BondData, index: number) => { return (
                <Box sx={{
                    border: '1px solid lightgray', 
                    width: '80%', minWidth: '340px', 
                    borderRadius: '20px', 
                    maxWidth: '400px', 
                    marginBottom: 1,
                    '@media (min-width: 821px)': {margin: 2}
                }} key={bondsID[index].id}>
                    <Box sx={{margin: 1}}>
                        <Typography align='center' component={'h1'} fontSize={'large'}>{bondName[item.id]?.name}</Typography>
                        {bondName[item.id]?.offDate&&<Typography align='center'>До {bondName[item.id].offDate.toLocaleDateString()}</Typography>}
                        <Box sx={{marginTop: 1}}>
                            <Typography>Цена сейчас: {(actualPrice[item.id]||0).toFixed(2)}</Typography>
                            <Typography>Цена покупки: {bondsID[index].price}</Typography>
                            <Box sx={{display: 'flex'}} component="form" onSubmit={(evt)=>{formUpdate(evt, index)}}>
                                <TextField sx={{margin: 1}} name="value" defaultValue={bondsID[index].totalSum} label="Количество" type="number"/>
                                <TextField sx={{margin: 1}} name="price" defaultValue={bondsID[index].price} label="Цена" type="number"/>
                                <IconButton type="submit">
                                    <CachedIcon />
                                </IconButton>
                            </Box>
                            <Typography>Количество: {bondsID[index].totalSum}</Typography>
                            <Typography>Сумма покупки: {bondsID[index].totalSum * bondsID[index].price}</Typography>
                            {bondsID[index]?.startDate && <Typography>Дата покупки: {(new Date(bondsID[index]?.startDate || 0)).toLocaleDateString()}</Typography>}
                            <Box sx={{display: 'inline-flex'}}>
                                <Typography>Мой кошелек сейчас: {cash[item.id]}</Typography>
                                <Typography color={deltaSum[item.id]?.positive?'green':'error'}>,  {deltaSum[item.id]?.value}</Typography>
                            </Box>
                            <Box sx={{display: 'inline-flex'}}>
                                <Typography>При погашении: {bondsID[index].totalSum * bondsID[index].value}</Typography>
                                <Typography color={(bondsID[index].price < bondsID[index].value) ? 'green' : 'error'}>
                                    ,  {(bondsID[index].value - bondsID[index].price) * bondsID[index].totalSum}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{marginTop: 1}}>
                            <Typography>Купоны:</Typography>
                            {(coupon[item.id]?.last && coupon[item.id].last !== null)?<Box>
                                <Typography>Предыдущий: {coupon[item.id].last?.price} от {coupon[item.id].last?.date.toLocaleDateString()}</Typography>
                                <Typography>Размер: {((coupon[item.id].last?.price||0)*bondsID[index].totalSum).toFixed(2)}</Typography>
                            </Box>:null}
                            {(coupon[item.id]?.next && coupon[item.id].next?.price) && <Box>
                                <Typography>Предстоящий: {coupon[item.id].next?.price} от {coupon[item.id].next?.date.toLocaleDateString()}</Typography>
                                <Typography>Размер: {Math.floor((coupon[item.id].next?.price || 0) * bondsID[index].totalSum)} ({((coupon[item.id].next?.price || 0)*0.87 * bondsID[index].totalSum).toFixed(2)})</Typography>
                            </Box>}
                            {coupon && coupon[item.id]?.hist && 
                                <CouponTable 
                                    coupon={coupon[item.id]} 
                                    bondID={item.id} 
                                    bondsID={bondsID}
                                    bondSum={bondsID[index].totalSum} 
                                    bondPrice={bondsID[index].value} 
                                    reinvSum={reinvCouponSum}
                                    setReinvSum={setReinvCouponSum} />}
                        </Box>
                        <Box sx={{marginTop: 1}}>
                            <Typography>Итого </Typography>
                            <Typography>Купонов: {((coupon[item.id]?.totalNow||0) * bondsID[index].totalSum).toFixed(2)}</Typography>
                            <Box sx={{display: 'inline-flex'}}>
                                <Typography>Кошелек: {(((coupon[item.id]?.totalNow||0) * bondsID[index].totalSum) + (cash[item.id]||0)).toFixed(2)}</Typography>
                                <Typography color={priceToWiew(
                                    (coupon[item.id]?.totalNow||0) * bondsID[index].totalSum + (deltaSum[item.id]?.price||0)).pos?
                                    'green':
                                    'error'}>
                                        ,  {priceToWiew(((coupon[item.id]?.totalNow||0) * bondsID[index].totalSum + (deltaSum[item.id]?.price||0)).toFixed(2)).value}
                                </Typography>
                            </Box>
                        </Box>
                        {(!bondsID[index]?.startDate) && <><Box sx={{marginTop: 1}}>
                            <Typography>Если зайти сейчас</Typography>
                            <Typography>Купонов: {((coupon[item.id]?.totalIfStartNow||0) * bondsID[index].totalSum).toFixed(2)}</Typography>
                            <Box sx={{display: 'inline-flex'}}>
                                <Typography>Кошелек: {(((coupon[item.id]?.totalIfStartNow||0) * bondsID[index].totalSum) + (cash[item.id]||0)).toFixed(2)}</Typography>
                                <Typography color={priceToWiew(
                                    (coupon[item.id]?.totalIfStartNow||0) * bondsID[index].totalSum + (deltaSum[item.id]?.price||0)).pos?
                                    'green':'error'}>
                                        ,  {priceToWiew(((coupon[item.id]?.totalIfStartNow||0) * bondsID[index].totalSum + (deltaSum[item.id]?.price||0)).toFixed(2)).value}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{marginTop: 1}}>
                            <Typography>Если зайти сейчас с реинвестицией</Typography>
                            <Typography>Купонов: {(reinvCouponSum[item.id]?.sum||0).toFixed(2)}</Typography>
                            <Typography>Купонов: {(reinvCouponSum[item.id]?.priceSum||0).toFixed(2)}</Typography>
                            <Box sx={{display: 'inline-flex'}}>
                                <Typography>Кошелек: {((reinvCouponSum[item.id]?.priceSum||0) + (cash[item.id]||0)).toFixed(2)}</Typography>
                                <Typography color={priceToWiew(
                                    (reinvCouponSum[item.id]?.priceSum||0) + (deltaSum[item.id]?.price||0)).pos?
                                    'green':'error'}>
                                        ,  {priceToWiew(((reinvCouponSum[item.id]?.priceSum||0) + (deltaSum[item.id]?.price||0)).toFixed(2)).value}
                                </Typography>
                            </Box>
                        </Box></>}
                                                    
                        <Box sx={{display: 'inline-flex'}}>
                            <Typography>На выходе: {(((coupon[item.id]?.totalIfStartNow||0) + bondsID[index].value) * bondsID[index].totalSum).toFixed(2)}</Typography>
                            <Typography color={priceToWiew(
                                ((coupon[item.id]?.totalIfStartNow||0) + bondsID[index].value - bondsID[index].price) * bondsID[index].totalSum).pos?
                                'green':'error'}>
                                    ,  {priceToWiew(
                                (((coupon[item.id]?.totalIfStartNow||0) + bondsID[index].value - bondsID[index].price) * bondsID[index].totalSum).toFixed(2)).value}
                            </Typography>
                        </Box>           
                        <Typography>На выходе с реинвестицией: </Typography>                 
                        <Box sx={{display: 'inline-flex'}}>
                            <Typography>{((reinvCouponSum[item.id]?.priceSum||0) + bondsID[index].value * (bondsID[index].totalSum || 0)).toFixed(2)}</Typography>
                            <Typography color={priceToWiew(
                                (reinvCouponSum[item.id]?.priceSum||0) + (bondsID[index].value - bondsID[index].price) * (bondsID[index].totalSum || 0)).pos?
                                'green':'error'}>
                                    ,  {priceToWiew(
                                ((reinvCouponSum[item.id]?.priceSum||0) + (bondsID[index].value - bondsID[index].price) * (bondsID[index].totalSum || 0)).toFixed(2)).value}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{marginBottom: 2}}>
                        <Box sx={{maxWidth: '700px', margin: 0, padding: 0}}>
                            {data[item.id] && <Line data={data[item.id]} />}
                        </Box>
                    </Box>
                </Box>
            )})}
        </Box>
    )
}