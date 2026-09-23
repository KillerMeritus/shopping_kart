// address - 1001
//json
// cookies ,credentails

import axios from "axios";

export const axiosInstance = axios.create({
    baseURL : 'http://localhost:1001/',
    withCredentials : true,
    headers:{
        "Content-Type":"application/json"
    }

})