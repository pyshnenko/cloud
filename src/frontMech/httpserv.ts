import axios from 'axios';
const path = require('path');

const baseURL = path.sep!=='/'?"http://127.0.0.1:8799/api":"https://cloud.spamigor.ru/api";
const jsonHeader = {
  "Content-type": "application/json"
};

export const loginApi = () => axios.create({
    baseURL,
    headers: jsonHeader
});
  
export const privateApi = (token: string) => axios.create({
    baseURL,
    headers: {
      ...jsonHeader,
      "Authorization": `Bearer ${token}`
    }
});
  
export const getApi = (value: string)=> axios.get(`${baseURL}/register?name=${value}`)