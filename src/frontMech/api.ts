import { loginApi, privateApi, getApi } from "./httpserv";
import {loginType, RegisterReqData} from './../types/api/types'

const login = (data: loginType) => {
    return loginApi().post('/login', data);
}

const register = (data: RegisterReqData) => {
    return loginApi().post('/register', data);
}

const tokenUPD = (data: string) => {
    return privateApi(data).post('/tokenUpd');
}

const askLS = (data: string, location: string = '/') => {
    return privateApi(data).post('/fs', {location});
}

const Api = {
    login,
    register,
    tokenUPD,
    askLS
}

export default Api;