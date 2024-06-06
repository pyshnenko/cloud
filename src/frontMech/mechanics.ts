import { useProgressBar } from "../frontDesign/progress";
import axios from 'axios';
import { User, userData } from "./user";
import { useLoading } from "../hooks/useLoading";
import { useAlarm } from "../frontDesign/alarm";

const progress = useProgressBar;
const loading = useLoading;
const alarm = useAlarm;

export async function attFile({notVerify, path, folder}: {notVerify: boolean, path: string, folder: (vr: string)=>void}) {
    let input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e: any) => {
        let files = e.target.files;
        let map1: any = {};
        for (let i = 0; i<files.length; i++) {
            let data = new FormData();
            data.append('file', files[i]);       
            map1[files[i].name] = 0;
            progress(map1);
            const response = axios.post((window.location.href.slice(0,22)==='http://localhost:8799/')?
                'http://localhost:8800/upload':
                '/upload', data, {
                    onUploadProgress: (e: any) => {
                        let val = Math.round(e.loaded * 100 / e.total);
                        console.log(e);
                        if (files[i].name){
                            map1 = {...map1, [files[i].name]: Math.round(e.loaded * 100 / e.total)};
                            console.log(map1)
                            progress(map1);
                        }
                        console.log('map set');
                    },
                    headers: {
                        folder: encodeURI((notVerify?'':(userData.login+'/'))+(path==='/'?'':path)),
                        fname: encodeURI(files[i].name),
                        user: encodeURI(userData.login),
                        token: encodeURI(User.getToken())
                    }
                });
            response.then((res: any)=>{
                console.log(res);
                if (res.data.res==='error')
                    alarm('ошибка при передаче', 'error')

            })
            response.catch((e: any) => {
                console.log(e);
                alarm('ошибка при передаче', 'error')
            })
            response.finally(()=>{      
                console.log('done')   
                alarm('Файл загружен')
            })
        }
        setTimeout((path: string)=>folder(path+'/'), 500, path);
    } 
    loading(false, 'attFile');        
    input.click();
}
