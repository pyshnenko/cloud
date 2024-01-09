let stoken: string;
let satoken: string;
let auth = false;

const getAuth = () => {
    return auth;
}

const getToken = () => {
    return stoken;
}

const setToken = (token: string, atoken: string) => {
    localStorage.setItem('cloudToken', token);
    stoken = token;
    satoken = atoken;
    auth = true;
}

const exit = () => {
    localStorage.clear();
    stoken = '';
    satoken = '';
    auth = false;
}

const User = {
    getAuth,
    getToken,
    setToken,
    exit
}

export default User