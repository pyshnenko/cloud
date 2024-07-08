import { useProgressBar } from "../frontDesign/progress";
import axios from 'axios';
import { User, userData } from "./user";
import { useLoading } from "../hooks/useLoading";
import { useAlarm } from "../frontDesign/alarm";

const progress = useProgressBar;
const loading = useLoading;
const alarm = useAlarm;

export async function attFile({notVerify, path, folder}: {notVerify: boolean, path: string, folder: (vr: string)=>void}) {
    console.log(path)
    let input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e: any) => {
        console.log(path)
        attFileSend(e.target.files, path, folder);
    } 
    loading(false, 'attFile');        
    input.click();
}

export async function attFileSend(files: any[], path: string, folder: (p: string)=>void, notVerify?:boolean) {
    let map1: any = {};
    console.log(files)
    for (let i = 0; i<files.length; i++) {
        let data = new FormData();
        data.append('file',  files[i].hasOwnProperty('file')?files[i].file:files[i]);       
        map1[files[i].filePath||files[i].name] = 0;
        progress(map1);
        console.log(userData.login+'/'+(files[i].path||path))
        try {
            const response = axios.post((window.location.href.slice(0,22)==='http://localhost:8799/')?
                'http://localhost:8801/upload':
                '/upload', data, {
                    onUploadProgress: (e: any) => {
                        if (files[i].fileName||files[i].name){
                            map1 = {...map1, [files[i].filePath||files[i].name]: Math.round(e.loaded * 100 / e.total)};
                            progress(map1);
                        }
                    },
                    headers: {
                        folder: encodeURI((notVerify?'':(userData.login+'/'))+(path==='/'?'':(files[i].path||path))),
                        fname: encodeURI(files[i].fileName||files[i].name),
                        user: encodeURI(userData.login),
                        token: encodeURI(User.getToken())
                    }
                });
            response.then((res: any)=>{
                //console.log(res);
                if (res.data.res==='error')
                    alarm('ошибка при передаче', 'error')
                else alarm('Файл загружен')

            })
            response.catch((e: any) => {
                console.log(e);
                console.log(decodeURI(e.config.headers.fname));
                map1 = {...map1, [decodeURI(e.config.headers.fname)]: -1};
                progress(map1);
                alarm('ошибка при передаче', 'error')
            })
            response.finally(()=>{      
                //console.log('done')   
                //alarm('Файл загружен')
            })
        }
        catch(e: any) {console.log(e)}
    }
    //console.log(path);
    setTimeout((path: string)=>folder(path+'/'), 500, path);  
}

export async function readEntryContentAsync(entry: any, folderPath: {current: string}) {
    console.log(entry);
    return new Promise((resolve, reject) => {
        let reading = 0;
        const contents: any[] = [];

        readEntry(entry);

        function readEntry(entry: any) {
            //console.log(entry)
            if (entry.isFile) {
                reading++;                    
                entry.file((file: any) => {
                    reading--;
                    const newFileName = entry.fullPath.slice(1);
                    //file.name = entry.fullPath;
                    contents.push({file, fileName: file.name, path: folderPath.current+entry.fullPath.slice(0, entry.fullPath.length-file.name.length-1), filePath: newFileName});
                    if (reading === 0) {
                        resolve(contents);
                    }
                });
            } else if (entry.isDirectory) {
                readReaderContent(entry.createReader());
            }
        };
      
        function readReaderContent(reader: any) {
            reading++;
            reader.readEntries(function(entries: any) {
                reading--;
                for (const entry of entries) {
                    readEntry(entry);
                }
                if (reading === 0) {
                    resolve(contents);
                }
            });
        };
    });
};

export async function getFileAsync(dataTranfer: any, folderPath: {current: string}) {
    const files = [];
    let itemInp = [];
    let itemL = dataTranfer.items.length;
    console.log(itemL);
    for (var i = 0; i < dataTranfer.items.length; i++) 
        itemInp.push(dataTranfer.items[i]);
    console.log(itemInp);
    for (var i = 0; i < itemInp.length; i++) {
        const item = itemInp[i];
        if (item.kind === 'file') {
            if (typeof item.webkitGetAsEntry === 'function'){
                const entry = item.webkitGetAsEntry();
                console.log(entry);
                const entryContent: any = await readEntryContentAsync(entry, folderPath);
                console.log(entryContent)
                files.push(...entryContent);

                continue;
            }

            const file = item.getAsFile();
            console.log(file)
            if (file) { files.push(file); }
        }
        else console.log(item.kind)
    }
    console.log(files)
    return files;
};