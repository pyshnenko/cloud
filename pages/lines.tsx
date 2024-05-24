import React, { useEffect, useState, useRef} from 'react';

export default function Lines () {

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [screenX, setScreenX] = useState(0);
    const [screenY, setScreenY] = useState(0);
    const [angle, setAngle] = useState(0);
    const [endPoint, setEndPoint] = useState({w: 400, h: 700});
    const [startPoint, setStartPoint] = useState({w: 400, h: 700});
    const [flightPoint, setFlightPoint] = useState({w: 0, h:0});
    const [server, setServer] = useState(true);
    const trig1 = useRef(true);
    const screenXRef = useRef(screenX);
    const screenYRef = useRef(screenY);
    const lastAngle = useRef(0);
    const endPointRef = useRef(endPoint);
    const startPointRef = useRef(startPoint);
    const serverRef = useRef(true);

    useEffect(() => {
        if (trig1.current) {
            trig1.current = false;
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
            setScreenX(window.screenX);
            setScreenY(window.screenY);
            setAngle(Math.atan(((window.screenY+window.innerHeight/2)-endPoint.h)/((window.screenX+window.innerWidth/2)-endPoint.w))||0);
            const serv = (localStorage.getItem('lineServer')!=='true')||((Number(new Date()) - Number((localStorage.getItem('lineTime')||0)))>2000)
            console.log(serv)
            setServer(serv)



            const handleMove = () => {
                setScreenX(window.screenX);
                setScreenY(window.screenY);
                if (serv) {
                    setAngle(Math.atan(((window.screenY+window.innerHeight/2)-endPointRef.current.h)/((window.screenX+window.innerWidth/2)-endPointRef.current.w))||0);
                    setStartPoint({w: window.screenX+window.innerWidth/2, h: window.screenY+window.innerHeight/2})
                }
                localStorage.setItem(serv?'lineWStart':'lineWEnd', String(window.screenX+window.innerWidth/2))
                localStorage.setItem(serv?'lineHStart':'lineHEnd', String(window.screenY+window.innerHeight/2))
            }
            const handleResize = (event: any) => {
                setWidth(event.target.innerWidth);
                setHeight(event.target.innerHeight);
                if (serv) {
                    setAngle(Math.atan(((window.screenY+window.innerHeight/2)-endPoint.h)/((window.screenX+window.innerWidth/2)-endPoint.w))||0);
                }
                localStorage.setItem(serv?'lineWStart':'lineWEnd', String(window.screenX+window.innerWidth/2))
                localStorage.setItem(serv?'lineHStart':'lineHEnd', String(window.screenY+window.innerHeight/2))
            };

            const handleStorage = () => {
                if (serv) {
                    const dTime = Number(new Date()) - Number(localStorage.getItem('lineClientTime'))
                    setEndPoint({w: dTime>10000 ? 0 : Number(localStorage.getItem('lineWEnd'))||0, h: dTime>10000 ? 0 : Number(localStorage.getItem('lineHEnd'))||0})
                    console.log('storage: ' + serv);
                }
                else {
                    setStartPoint({w: Number(localStorage.getItem('lineWStart')||0), h: Number(localStorage.getItem('lineHStart')||0)})
                    if (localStorage.getItem('startLine')==='true') {
                        setFlightPoint({w: startPointRef.current.w, h:startPointRef.current.h});
                        localStorage.setItem('startLine', 'false')
                    }
                }
            }

            if (serv) {
                setInterval(()=>localStorage.setItem('lineTime', String(Number(new Date()))), 1000);
                localStorage.setItem('lineServer', 'true');            
                setInterval(()=>{
                    setFlightPoint({w: 0, h:0});
                    localStorage.setItem('startLine', 'true');
                }, 2000);
            }
            else setInterval(()=>localStorage.setItem('lineClientTime', String(Number(new Date()))), 1000);

            const timeOutFunction = () => {
                if ((window.screenX!==screenXRef.current)||(window.screenY!==screenYRef.current)) {
                    handleMove();
                }
                setTimeout(timeOutFunction, 1)
            }

            /*const roatation = (angleF: number) => {
                setAngle(angleF+1);
                setTimeout(roatation, 1000, angleF+1);
            }*/

            //roatation(angle);
            window.addEventListener('resize', handleResize);
            window.addEventListener('mouseup', handleMove);
            window.addEventListener('storage', handleStorage)
            timeOutFunction();
            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('mouseup', handleMove);
            };
        }
    }, []);

    useEffect(()=>{
        screenXRef.current = screenX;
        screenYRef.current = screenY;

        if ((Math.abs((flightPoint.w+width/2+screenX)-endPoint.w)>9 && Math.abs((flightPoint.h+height/2 + screenY)-endPoint.h)>9)&&server)//(flightPoint.w<=1000 && flightPoint.w>-1000) && (flightPoint.h<=1000 && flightPoint.h>-1000))
            setTimeout((w: number, h: number, sX: number, sY: number, wi: number, he: number, endP: {w: number, h: number}, ang: number)=>{
                const ySpeed = -10*Math.sin(ang);
                const xSpeed = 10*Math.cos(ang);
                setFlightPoint({w: (wi/2+sX)>(endP.w)?w-xSpeed:w+xSpeed, h: (wi/2+sX)<(endP.w)?h-ySpeed:h+ySpeed})
            }, 10, flightPoint.w, flightPoint.h, screenX, screenY, width, height, endPoint, angle)
        else if ((Math.abs((flightPoint.w-screenX)-endPoint.w)>9 && Math.abs((flightPoint.h - screenY)-endPoint.h)>9)&&!server)//(flightPoint.w<=1000 && flightPoint.w>-1000) && (flightPoint.h<=1000 && flightPoint.h>-1000))
            setTimeout((w: number, h: number, sX: number, sY: number, wi: number, he: number, startP: {w: number, h: number}, ang: number)=>{
                const ySpeed = 10*Math.sin(ang);
                const xSpeed = -10*Math.cos(ang);
                setFlightPoint({w: (wi/2+sX)>(startP.w)?w-xSpeed:w+xSpeed, h: (wi/2+sX)<(startP.w)?h-ySpeed:h+ySpeed})
            }, 10, flightPoint.w, flightPoint.h, screenX, screenY, width, height, startPoint, angle)
        let canvas: any = document.getElementById("canvas");
        
        if (canvas.getContext) {
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, width*2, height*2)
            if (!server) {
                ctx.beginPath();
                ctx.arc(width/2, height/2, 20, 0, Math.PI * 2, true);
                ctx.arc(flightPoint.w-screenX, flightPoint.h-screenY, 10, 0, Math.PI * 2, true);
                ctx.stroke();
            }

            else {
                ctx.beginPath();
                ctx.moveTo(width/2-50*Math.cos(angle), height/2-50*Math.sin(angle));
                ctx.lineTo(width/2+50*Math.cos(angle), height/2+50*Math.sin(angle));
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(width/2, height/2, 50, 0, Math.PI * 2, true);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(flightPoint.w+width/2, flightPoint.h+height/2, 10, 0, Math.PI * 2, true);
                ctx.stroke();
            }
            lastAngle.current = angle;
        }
    }, [angle, flightPoint, width, height, screenX, screenY])

    useEffect(()=>{
        const ang = Math.atan(((window.screenY+window.innerHeight/2)-endPoint.h)/((window.screenX+window.innerWidth/2)-endPoint.w))||0
        if (serverRef.current) setAngle(ang);
        console.log(ang*180/3.14);
        endPointRef.current = endPoint;
    }, [endPoint])


    useEffect(()=>{
        const ang = Math.atan(((window.screenY+window.innerHeight/2)-startPoint.h)/((window.screenX+window.innerWidth/2)-startPoint.w))||0
        if (!serverRef.current) setAngle(ang);
        console.log(ang*180/3.14);
        startPointRef.current = startPoint;
    }, [startPoint])

    useEffect(()=>{
        serverRef.current = server
    }, [server])

    return (
        <canvas id={'canvas'} width={width} height={height} style={{position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, backgroundColor: 'aliceblue'}} />
    )
}