import { loginApi, privateApi, getApi } from "./httpserv";
import {loginType, RegisterReqData} from './../types/api/types'

const askSimpleTok = () => {
    return loginApi().post('/secure', {act: 'simpleToken'});
}

const login = (data: loginType) => {
    return loginApi().post('/login', data);
}

const register = (data: RegisterReqData) => {
    return loginApi().post('/register', data);
}

const tokenUPD = (data: string, atoken: string) => {
    return privateApi(data).post('/tokenUpd', {atoken, oldToken: data});
}

const askLS = (data: string, location: string = '/', action: string = 'ls', name: string = '') => {
    return privateApi(data).post('/fs', {location, action, name});
}

const Api = {
    login,
    register,
    tokenUPD,
    askLS,
    askSimpleTok
}

export default Api;