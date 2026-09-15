import bcrypt from 'bcrypt'
import customerModel from "../model/customer.model.js";
import { getToken } from "../utils/generateToken.js";

const cookieOptions = {

    httpOnly: true

}




const register = async (req,res)=>{
    try{
    const {fullName,email,password,phone} = req.body

    if(!fullName || !email || !password || !phone){
        return res.status(400).json({message:'all fields are required'})
    }

    const exist = await customerModel.findOne({email})
    if(exist){
        return res.status(409).json({message:'customer already exists'})
    }

    if(password.length < 6){
        return res.status(400).json({message:'password is too short'})
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    // const hashedPassword = await bcrypt.hash(password, 1)

    const customer = await customerModel.create({
        fullName: fullName,
        email: email,
        password: hashedPassword,
        phone: phone
    })

    res.status(200).json({
        success: true,
        message: "Customer registered successfully",
        customer : customer
    })




    }catch(error) {
    res.status(500).json({
        
        message: "Internal server error",
        error: error.message
    })
}

}

const login = async (req,res)=>{
    try{
    const {email,password} = req.body
    if(!email || !password){
        res.status(400).json({message:'all fields are required'})
    }

    const customer = await customerModel.findOne({email})
    if(!customer){
        return res.status(401).json({message:'Invalid credentials'})
    }

    const isMatch = await bcrypt.compare(password, customer.password)

    if(!isMatch){
        return res.status(401).json({message:'Invalid credentials'})
    }

    const token = getToken(customer.id)
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
        success: true,
        message: "Login successful"

    });

    

    }catch(error){
        res.status(500).json({
            message: "Interval Server Error",
            error:error.message
        })
    }
    

}

const getMe = async (req, res) => {
    return res.status(200).json({ 
    customer : req.customer
    });
};

const logout = async (req, res) => {
    res.clearCookie("token");

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};

export { register, login, getMe,logout };

