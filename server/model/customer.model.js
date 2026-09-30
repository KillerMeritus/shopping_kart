import mongoose from "mongoose";

const customerSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    wishlist:{ 
    type : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }],
    default : []
    }
},
    {
        timestaps: true
    }
)

const customerModel = mongoose.model('customer', customerSchema)




export default customerModel;