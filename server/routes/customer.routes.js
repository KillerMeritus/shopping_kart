import express from "express";
import {register,login,getMe, logout} from "../controllers/customer.controllers.js";
import authMiddleware from "../middleware/auth.middleware.js";

const customerRoutes = express.Router()

customerRoutes.post('/register',register)
customerRoutes.post('/login',login)
customerRoutes.get('/me',authMiddleware,getMe)
customerRoutes.post('/logout',logout)

// module.exports(userRoutes)
export default customerRoutes
