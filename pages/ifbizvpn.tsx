import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import Button from '@mui/material/Button';
import { Line, Bar } from 'react-chartjs-2';
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
import axios from 'axios';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

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

interface fullData {
    interfaces: any
}

const values: string[] = ['b', 'kb', 'Mb', 'Gb', 'Tb', 'Pb'];

export default function DedansCharts() {

    const [fullData, setFullData] = useState<fullData>();
    const [ifaceList, setiFaceList] = useState<string[]>([]);
    const [iface, setiFace] = useState<string>("1");
    const [sTime, setSTime] = useState<number>(Number((new Date(0)).setHours(0)));
    const [eTime, setETime] = useState<number>(Number((new Date()).setHours(23)));   
    const [ data, setData ] = useState({
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
      });
    const [range, setRange] = useState<string>('day');

    useEffect(()=>{
        axios.get('https://spamigor.ru/ifbizvpn/trafic.json')
            .then((res: any)=>{
            console.log(res.data.interfaces);
            let ifaceNames: string[] = [];
            res.data.interfaces.forEach((int: any)=>ifaceNames.push(int.name));
            setiFaceList(ifaceNames);
            setFullData(res.data);
        });
    }, []);

    useEffect(()=>{
        if (fullData){
            console.log(fullData.interfaces[Number(iface||0)]);
        }
    }, [iface])

    useEffect(()=>{
        console.log(fullData?.interfaces[Number(iface)])
        if (fullData) //setData(fullData.interfaces[Number(iface)].traffic[range]);
            setData({
                labels: fullData.interfaces[Number(iface)].traffic[range].map(
                    (row: {rx: number, time?: {hour: number, minute: number}, date:{year: number, month: number, day: number}}) => {
                    const rowTime = generateDates(row);
                    console.log(rowTime);
                    if ((sTime <= rowTime) && (eTime >= rowTime)) {return generateLabels(row)}
                }).filter(Boolean),
                datasets: [{
                  fill: false,
                  label: 'rx, Mb' ,
                  data: fullData.interfaces[Number(iface)].traffic[range].map(
                    (row: {rx: number, time?: {hour: number, minute: number}, date:{year: number, month: number, day: number}}) => {
                        const rowTime = generateDates(row);
                        console.log(rowTime);
                        if ((sTime <= rowTime) && (eTime >= rowTime)) {return row.rx/1024/1024}
                    }).filter(Boolean),
                  borderColor: ['rgb(53, 162, 235)'],
                  backgroundColor: ['rgba(53, 162, 235, 0.5)'],
                  borderWidth: 1
                },{
                  fill: false,
                  label: 'tx, Mb',
                  data: fullData.interfaces[Number(iface)].traffic[range].map(
                    (row: {tx: number, time?: {hour: number, minute: number}, date:{year: number, month: number, day: number}}) => {
                        const rowTime = generateDates(row);
                        if ((sTime <= rowTime) && (eTime >= rowTime)) return row.tx/1024/1024
                    }).filter(Boolean),
                  borderColor: ['rgb(162, 53, 235)'],
                  backgroundColor: ['rgba(162, 53, 235, 0.5)'],
                  borderWidth: 1
                }]
            })
    }, [fullData, range, iface, sTime, eTime])

    const valueToHumanable = (data: string|number) => {
        let mass = Number(data);

        if (mass) {
            if (mass>1024) {
                let d:{num: number, mn: number} = del1024({num: mass, mn: 0})
                return `${d.num.toFixed(3)} ${values[d.mn]}`
            }
        }
        else return 0
    }

    const del1024 = ({num, mn}: {num: number, mn: number}) =>{    
        if (num>1024) return del1024({num: (num/1024), mn: mn+1});
        else return {num, mn}
    }

    const generateLabels = (inpDats: {date: {year: number, month?: number, day?: number}, time?: {hour: number, minute: number}}) =>{
        let exString: string = '';
        if (inpDats?.time) exString+=`${inpDats.time.hour}:${inpDats.time.minute} `;
        if (inpDats.date?.day) exString+=`${inpDats.date?.day}.`
        if (inpDats.date?.month) exString+=`${inpDats.date?.month}.`
        if (inpDats.date.year) exString+=`${inpDats.date.year}`
        return exString
    }

    const generateDates = (inpDats: {date: {year: number, month?: number, day?: number}, time?: {hour: number, minute: number}}) =>{
        let exDate = new Date(0);
        if (inpDats?.time) {exDate.setHours(inpDats?.time.hour); exDate.setMinutes(inpDats?.time.minute)}
        if (inpDats.date?.day) exDate.setDate(inpDats.date?.day)
        if (inpDats.date?.month) exDate.setMonth(inpDats.date?.month-1)
        if (inpDats.date.year) exDate.setFullYear(inpDats.date.year)
        return Number(exDate)
    }

    return (
        <Box>
            {ifaceList.length!==0&&<Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Box sx={{display: 'flex', flexDirection: 'row'}}>
                    <FormControl fullWidth>
                        <InputLabel id="iFaceType">Интерфейс</InputLabel>
                        <Select
                            labelId="iFaceType"
                            id="iFaceType"
                            value={iface}
                            label="Интерфейс"
                            onChange={(event: SelectChangeEvent)=>setiFace((event.target.value||0) as string)}
                        >
                            <MenuItem value="">
                                <em>Нет</em>
                            </MenuItem>
                            {ifaceList.map((item: string, index: number)=>{
                                return <MenuItem key={'iface: '+item} value={index}>{item}</MenuItem>
                            })}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel id="iFacePeriod">Период</InputLabel>
                        <Select
                            labelId="iFacePeriod"
                            id="iFacePeriod"
                            value={range}
                            label="Период"
                            onChange={(event: SelectChangeEvent)=>setRange(event.target.value)}
                        >
                            <MenuItem value="fiveminute">5 минут</MenuItem>
                            <MenuItem value="hour">Часы</MenuItem>
                            <MenuItem value="day">Дни</MenuItem>
                            <MenuItem value="month">Месяцы</MenuItem>
                            <MenuItem value="year">Года</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{display: 'flex', justifyContent: 'space-evenly'}}>
                    <Box>
                        <Typography>Начальная точка</Typography>
                        <TextField type='time' onChange={({target}: any)=>{
                            let time = new Date(sTime);
                            time.setHours(Number(target.value.slice(0,2)))                            
                            time.setMinutes(Number(target.value.slice(-2)))
                            setSTime(Number(time))
                        }}></TextField>
                        <TextField type='date' onChange={({target}: any)=>
                            {
                                let time = new Date(sTime);
                                time.setDate(Number(target.value.slice(-2)))
                                time.setMonth(Number(target.value.slice(5,7))-1)
                                time.setFullYear(Number(target.value.slice(0,4)))
                                setSTime(Number(time))
                            }}></TextField>
                    </Box>
                    <Box>
                        <Typography>Конечная точка</Typography>
                        <TextField type='time' onChange={({target}: any)=>{
                            let time = new Date(eTime);
                            time.setHours(Number(target.value.slice(0,2)))                            
                            time.setMinutes(Number(target.value.slice(-2)))
                            setETime(Number(time))
                        }}></TextField>
                        <TextField type='date' onChange={({target}: any)=>
                            {
                                let time = new Date(eTime);
                                time.setDate(Number(target.value.slice(-2)))
                                time.setMonth(Number(target.value.slice(5,7))-1)
                                time.setFullYear(Number(target.value.slice(0,4)))
                                console.log(time)
                                setETime(Number(time))
                            }}></TextField>
                    </Box>
                </Box>
            </Box>}
            <Line data={data} />
            {fullData?
                <Box>
                    <Typography>{`Последнее обновление в ${fullData.interfaces[Number(iface)].updated.time.hour}:${fullData.interfaces[Number(iface)].updated.time.minute} ${fullData.interfaces[Number(iface)].updated.date.day}.${fullData.interfaces[Number(iface)].updated.date.month}.${fullData.interfaces[Number(iface)].updated.date.year}`}</Typography>
                    <Typography>{`Суммарное:`}</Typography>
                    <Typography>{`rx: ${valueToHumanable(fullData.interfaces[Number(iface)].traffic.total.rx)}`}</Typography>
                    <Typography>{`tx: ${valueToHumanable(fullData.interfaces[Number(iface)].traffic.total.tx)}`}</Typography>
                </Box>
            :null}
        </Box>
    )
}