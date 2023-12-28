import { loginApi, privateApi, getApi } from "./httpserv";
import {loginType, RegisterReqData} from './../types/api/types'

const login = (data: loginType) => {
    return loginApi().post('/login', data);
}

const register = (data: RegisterReqData) => {
    return loginApi().post('/register', data);
}

const Api = {
    login,
    register
}

export default Api;