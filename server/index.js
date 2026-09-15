import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import customerRoutes from './routes/customer.routes.js'
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


app.use(express.json())
app.use(cookieParser());


const port = 1001

dotenv.config()


mongoose.connect(process.env.dbUrl).then(()=>{
    console.log("db connected")
}).catch((error)=>{
    console.log(error)
})


app.get('/',(req,res)=>{
    res.send("server is ok")
})

app.use('/customer',customerRoutes)


app.listen(port,()=>{
    console.log("app woking")
})