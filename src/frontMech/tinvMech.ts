import { Coupon } from "../types/api/types";

export const bondsID: {id: string, totalSum: number, price: number}[] = [{id: 'TCS00A10AA02', totalSum: 4000, price: 1000}];

interface CouponData {couponDate: string, payOneBond: {units: string|number, nano: string|number}}

export const couponCorrectData = (data: CouponData[]) => {
    let totalNow: number = 0;
    let last: Coupon | null = null;
    let next: Coupon | null = null;
    const nowDate: number = Number(new Date());
    let extData: Coupon[] = data.map((item: CouponData)=>{
        let price: number = Number((Number(`${String(item.payOneBond.units)}.${String(item.payOneBond.nano)}`)).toFixed(4));
        let date: Date = new Date(item.couponDate);
        if (Number(date) < nowDate) totalNow += price;
        if ((last === null && (Number(date) < nowDate)) || (
            last && (Number(last.date) < nowDate) && (Number(date) < nowDate)
        )) last = {price, date}
        if ((next === null && (Number(date) >= nowDate)) || (
            next && (Number(next.date) < nowDate) && (Number(date) < nowDate)
        )) next = {price, date}
        return {
            price: price,
            date: date
        }
    })
    return {hist: extData, totalNow, last, next}
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

export const dataUpd = async (ttok: string, askPost: (uel: string, body: any, ttok: string)=>void) => {
    const body = {figi: bondsID.map((item: {id: string}) => item.id)};
    const url = 'https://invest-public-api.tinkoff.ru/rest/tinkoff.public.invest.api.contract.v1.MarketDataService/GetLastPrices';
    await askPost(url, body, ttok);
    const url2 = 'https://invest-public-api.tinkoff.ru/rest/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetBondCoupons';        
    await askPost(url2, body, ttok);
    const oldDate = new Date(Number(new Date())-(1000*60*60*24*30));
    const url3 = 'https://invest-public-api.tinkoff.ru/rest/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles';   
    const body3 = {
        figi: "TCS00A10AA02",
        from: (oldDate).toISOString(),
        to: (new Date()).toISOString(),
        interval: "CANDLE_INTERVAL_DAY",
        instrumentId: "TCS00A10AA02"
    }        
    await askPost(url3, body3, ttok);
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