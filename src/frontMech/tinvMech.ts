import { Coupon } from "../types/api/types";
import { BondData } from "../types/api/types";

export const bondsIDBase: BondData[] = [
    {id: 'TCS00A10AA02', totalSum: 4000, price: 1000, value: 1000},
    {id: 'TCS00A104ZC9', totalSum: 1000, price: 1000, value: 1000, startDate: 1705708800000},
    {id: 'TCS00A10ARS4', totalSum: 2994, price: 1000, startDate: 1738195200000, value: 1000},
    {id: 'TCS00A104YT6', totalSum: Math.floor(1500000/931), price: 931, value: 1000},
    {id: 'TCS00A105518', totalSum: Math.floor(1500000/735), price: 723, value: 750}
];

interface CouponData {couponDate: string, payOneBond: {units: string|number, nano: string|number}}

export const couponCorrectData = (data: CouponData[], id: number, bondsID: BondData[]) => {
    let totalNow: number = 0;
    let totalIfStartNow: number = 0;
    let last: Coupon | null = null;
    let next: Coupon | null = null;
    const nowDate: number = Number(new Date());
    let extData: Coupon[] = data.map((item: CouponData)=>{
        let price: number = Number((Number(`${String(item.payOneBond.units)}.${String(item.payOneBond.nano)}`)).toFixed(4));
        let date: Date = new Date(item.couponDate);
        if (Number(date) < nowDate) {
            if ((bondsID[id]?.startDate) && (Number(date) > (bondsID[id]?.startDate||0))) totalNow += price;
        }
        if (Number(date) >= nowDate) {
            totalIfStartNow += price
        }
        if ((last === null && (Number(date) < nowDate)) || (
            last && (Number(last.date) < nowDate) && (Number(date) < nowDate)
        )) last = {price, date, done: true, check: Boolean(bondsID[id]?.startDate !== undefined && ((bondsID[id]?.startDate || 0) < Number(date)))}
        if ((next === null && (Number(date) >= nowDate)) || 
            (next && (Number(next.date) > nowDate) && (Number(date) > nowDate))
        ) next = {price, date, done: false, check: false}
        return {
            price: price,
            date: date,
            done: (Number(date) < nowDate),
            check: Boolean(bondsID[id]?.startDate!==undefined && ((bondsID[id].startDate||0) < Number(date)))
        }
    })
    return {hist: extData, totalNow, last, next, totalIfStartNow}
}

interface CandlesData {time: string, close: {units: string|number, nano: string|number}}

export const candlesCorrectData = (exdata: CandlesData[]) => {
    let extData:{price: number, date: Date}[] = exdata.map((item: CandlesData)=>{
        return {
            price: Number(item.close.units)*10 + 
                Number(String(item.close.nano).slice(0,3))/100,
            date: new Date(item.time)
        }
    })
    let price: number[] = extData.map((item: {price: number, date: Date}) => item.price);        
    let dateArr: string[] = extData.map((item: {price: number, date: Date}) => item.date.toLocaleDateString());
    return {
        labels: dateArr,
        datasets: [{
            fill: false,
            label: 'Котировки по бумаге',
            data: price,
            backgroundColor: [
            'rgb(153, 102, 255)'
            ],
            borderColor: [
            'rgb(153, 102, 255)'
            ],
            borderWidth: 1
        }]
    }
}

export const dataUpd = async (ttok: string, askPost: (uel: string, body: any, bondid: number, ttok: string)=>void, i: number = 0, bondsID: BondData[]) => {
    console.log(i)
    console.log(bondsID)
    const body = {instrumentId: [bondsID[i].id]};
    const url = 'https://invest-public-api.tinkoff.ru/rest/tinkoff.public.invest.api.contract.v1.MarketDataService/GetLastPrices';
    await askPost(url, body, i, ttok);
    const url2 = 'https://invest-public-api.tinkoff.ru/rest/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetBondCoupons';        
    await askPost(url2, body, i, ttok);
    const oldDate = new Date(Number(new Date())-(1000*60*60*24*30));
    const url3 = 'https://invest-public-api.tinkoff.ru/rest/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles';   
    const body3 = {
        figi: bondsID[i].id,
        from: (oldDate).toISOString(),
        to: (new Date()).toISOString(),
        interval: "CANDLE_INTERVAL_DAY",
        instrumentId: bondsID[i].id
    }        
    await askPost(url3, body3, i, ttok);
    const url4 = 'https://invest-public-api.tinkoff.ru/rest/tinkoff.public.invest.api.contract.v1.InstrumentsService/BondBy';  
    const body4 = {
        idType: "INSTRUMENT_ID_TYPE_FIGI",
        id: bondsID[i].id
    }
    await askPost(url4, body4, i, ttok);
    if (i < (bondsID.length - 1)) {
        setTimeout(dataUpd, 1000, ttok, askPost, i += 1, bondsID)
    }
}

export const basicChartState = {
    labels: [],
    datasets: [{
      fill: false,
      label: 'Посуточный график',
      data: [0,0,0,0,0],
      backgroundColor: [
        'rgb(153, 102, 255)'
      ],
      borderColor: [
        'rgb(153, 102, 255)'
      ],
      borderWidth: 1
    }]
  };