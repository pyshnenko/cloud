import React, { useEffect, useState, useRef} from 'react';

export default function Lines () {

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [screenX, setScreenX] = useState(0);
    const [screenY, setScreenY] = useState(0);
    const [angle, setAngle] = useState(0);
    const [endPoint, setEndPoint] = useState({w: 0, h: 100});
    const [flightPoint, setFlightPoint] = useState({w: 0, h:0});
    const trig1 = useRef(true);
    const screenXRef = useRef(screenX);
    const screenYRef = useRef(screenY);
    const lastAngle = useRef(0);

    useEffect(() => {
        if (trig1.current) {
            trig1.current = false;
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
            setScreenX(window.screenX);
            setScreenY(window.screenY);


            const handleMove = () => {
                setScreenX(window.screenX);
                setScreenY(window.screenY);
            }
            const handleResize = (event: any) => {
                setWidth(event.target.innerWidth);
                setHeight(event.target.innerHeight);
            };

            setInterval(()=>setFlightPoint({w:-17, h:0}), 3000);

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
            timeOutFunction();
            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('mouseup', handleMove);
            };
        }
    }, []);

    useEffect(()=>{
        const x1 = window.screenX;
        const y1 = window.screenY;
        const aangle = Math.atan(((y1+window.innerHeight/2)-endPoint.h)/((x1+window.innerWidth/2)-endPoint.w))||0;
        console.log(`W: ${width}, H: ${height}, X: ${screenX}, Y: ${screenY}, alpha: ${aangle*180/Math.PI}, last: ${lastAngle.current*180/Math.PI}`);
        screenXRef.current = screenX;
        screenYRef.current = screenY;

        if (flightPoint.w>=-17 && flightPoint.w<1000) 
            setTimeout((w: number, h: number)=>{
                setFlightPoint({w: w+5, h: h})
            }, 10, flightPoint.w, flightPoint.h)

        let canvas: any = document.getElementById("canvas");
        
        if (canvas.getContext) {
            var ctx = canvas.getContext("2d");
            ctx.clearRect(-100,100, width*2, height*2)
            ctx.translate(width/2, height/2)
            ctx.rotate(-aangle + lastAngle.current);//*Math.PI/180);
            ctx.beginPath();
            ctx.moveTo(-50, 0);
            ctx.arc(0, 0, 50, 0, Math.PI * 2, true);
            ctx.stroke();
            ctx.beginPath();
            if (flightPoint.w || flightPoint.h) ctx.arc(flightPoint.w, flightPoint.h, 10, 0, Math.PI * 2, true);
            ctx.stroke();
            ctx.translate(-width/2, -height/2);
            lastAngle.current = (aangle||0);
        }
    }, [screenX, screenY, flightPoint, endPoint])

    useEffect(()=>{
        const x1 = window.screenX;
        const y1 = window.screenY;
        const aangle = Math.atan(((y1+window.innerHeight/2)-endPoint.h)/((x1+window.innerWidth/2)-endPoint.w))||0;
        console.log(`W: ${width}, H: ${height}, X: ${screenX}, Y: ${screenY}, alpha: ${aangle*180/Math.PI}, last: ${lastAngle.current*180/Math.PI}`);
        screenXRef.current = screenX;
        screenYRef.current = screenY;

        if (flightPoint.w>=-17 && flightPoint.w<1000) 
            setTimeout((w: number, h: number)=>{
                setFlightPoint({w: w+5, h: h})
            }, 10, flightPoint.w, flightPoint.h)

        let canvas: any = document.getElementById("canvas");
        
        if (canvas.getContext) {
            var ctx = canvas.getContext("2d");
            ctx.clearRect(-100,100, width*2, height*2)
            ctx.translate(width/2, height/2)
            ctx.rotate(aangle);//*Math.PI/180);
            ctx.beginPath();
            ctx.moveTo(-50, 0);
            ctx.arc(0, 0, 50, 0, Math.PI * 2, true);
            ctx.stroke();
            ctx.beginPath();
            if (flightPoint.w || flightPoint.h) ctx.arc(flightPoint.w, flightPoint.h, 10, 0, Math.PI * 2, true);
            ctx.stroke();
            ctx.translate(-width/2, -height/2);
            lastAngle.current = (aangle||0);
        }
    }, [width, height])

    const pict = () => {
        
    }

    return (
        <canvas id={'canvas'} width={width} height={height} style={{position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, backgroundColor: 'aliceblue'}} />
    )
}