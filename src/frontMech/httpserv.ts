import axios from 'axios';

const baseURL = "https://cloud.spamigor.ru/api";//"http://localhost:8799/api";//"https://cloud.spamigor.ru/api";//
console.log(baseURL)
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