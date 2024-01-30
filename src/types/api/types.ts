export interface loginType {
    pass: string, 
    email?: string,
    login?: string
}

export interface RegisterReqData { 
    first_name: String,
    last_name: String,
    login: String,
    email: String,
    password: String
}

export interface RegisterReqSucc { 
    token: String, 
    atoken: String,
    first_name: String, 
    last_name: String, 
    id: Number, 
    login: String, 
    email: String 
}

export interface TokenLocalData {
    email: string,
    first_name: string,
    gold: number,
    iat: number,
    id: number,
    last_name: string,
    login: string
}

export interface ReqSecType {
    act: string
}

export interface FSType {
    location: string, 
    token?: string, 
    action: string, 
    name?: string, 
    incognit?: boolean
}