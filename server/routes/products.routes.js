import express from "express";
import {
    createProduct,
    getProducts,
    getProduct,
    updateProduct
} from "../controllers/product.controllers.js";
import { uploadSingleImage } from "../middleware/upload.middleware.js";

const productsRoutes = express.Router();

productsRoutes.post('/', uploadSingleImage, createProduct);
productsRoutes.get('/', getProducts);
productsRoutes.get('/:id', getProduct);
productsRoutes.put('/:id', uploadSingleImage, updateProduct);
productsRoutes.patch('/:id', uploadSingleImage, updateProduct);

export default productsRoutes;