import mongoose from "mongoose";
import productModel from "../model/product.model.js";
import customerModel from "../model/customer.model.js";
import { json } from "express";



export const addToWishlist = async(req,res)=>{
    const productId = req.params.productId

    if(!mongoose.isValidObjectId(productId)){
        return res.status(400).json({message: "Invalid productId"})
    }
    
    const product = await productModel.findById(productId)
    if(!product){
        return res.status(404).json({message: "product not found"})
    }

    const wishlist = req.customer.wishlist;
    if(wishlist.some(product => product.toString() === productId)){
        return res.status(409).json({message: "product already in wishlist"})
    }

    wishlist.push(productId)

    await req.customer.save();

    res.status(200).json({message:"product added in wishlist"})


}  


export const getWishlist = async(req,res)=>{
    const customerid = req.customer._id;

    const customer = await customerModel.findById(customerid).populate("wishlist");
           
    if(!customer){
        return res.status(404).json({message:"customer not found"})
    }

    const wishlist =customer.wishlist;

    return res.status(200).json({
        success : true,
        count : wishlist.length,
        wishlist : wishlist
    })

}

export const removeFromWishlist = async (req, res) => {
    const productId = req.params.productId;


    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({
            message: "Invalid productId"
        });
    }

    const wishlist = req.customer.wishlist;


    const exists = wishlist.some(
        product => product.toString() === productId
    );

    if (!exists) {
        return res.status(404).json({
            message: "Product not in wishlist"
        });
    }


    req.customer.wishlist = wishlist.filter(
        product => product.toString() !== productId
    );

    // Save updated customer
    await req.customer.save();

    return res.status(200).json({
        success: true,
        message: "Product removed from wishlist"
    });
};

//  Toggle Wishlist
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid productId"
            });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (!req.customer.wishlist) {
            req.customer.wishlist = [];
        }

        const exists = req.customer.wishlist.some(
            (item) => (item._id || item).toString() === productId
        );

        let isAdded = false;
        if (exists) {
            req.customer.wishlist = req.customer.wishlist.filter(
                (item) => (item._id || item).toString() !== productId
            );
            isAdded = false;
        } else {
            req.customer.wishlist.push(productId);
            isAdded = true;
        }

        await req.customer.save();
        await req.customer.populate("wishlist");

        return res.status(200).json({
            success: true,
            message: isAdded
                ? "Product added to wishlist"
                : "Product removed from wishlist",
            isAdded,
            count: req.customer.wishlist.length,
            wishlist: req.customer.wishlist
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};



