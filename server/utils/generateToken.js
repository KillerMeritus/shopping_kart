import jwt from "jsonwebtoken";


const getToken = (customerId) =>{
    return jwt.sign({customerId},
        process.env.jwt_secret,
        {expiresIn:'5d'}
    )
}

export {getToken}