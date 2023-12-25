import { loginApi, privateApi, getApi } from "./httpserv";
import {login} from './../types/api/types'

const login = (data: login) => {
    return loginApi().post('/login', data);
}

const Api = {
    login
}

export default Api;