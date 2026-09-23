import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required : true
    },
    description:{
        type:String,
        required: true,
    },
    price:{
        type:Number,
        required : true,
        min: 0.01
    },
    category:{
        type:String,
        reqired: true
    },
    image: {
        type:String,
        required: true
    },

    stock : {
        type:Number,
        required : true,
        min: 0
    }
},
    {
        timestaps: true
    }

)

const productModel = mongoose.model('product' ,productSchema)

export default productModel
