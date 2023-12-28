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