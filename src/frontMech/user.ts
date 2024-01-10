import React, { useEffect, useState, useRef, createContext, useContext, useMemo } from 'react';

let stoken: string;
let satoken: string;
let auth = false;
export let userData: any;

const getAuth = () => {
    return auth;
}

const getToken = () => {
    return stoken;
}

const setToken = (token: string, atoken: string, decr?: any) => {
    localStorage.setItem('cloudToken', token);
    stoken = token;
    satoken = atoken;
    auth = true;
    if (decr) userData = decr;
}

const exit = () => {
    localStorage.clear();
    stoken = '';
    satoken = '';
    auth = false;
}

export const User = {
    getAuth,
    getToken,
    setToken,
    exit
}