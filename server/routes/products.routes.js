import express from "express"
import { createProduct,getProducts ,getProduct} from "../controllers/product.controllers.js"
const productsRoutes = express.Router()

productsRoutes.post('/',createProduct)
productsRoutes.get('/',getProducts)
productsRoutes.get('/:id',getProduct)


export default productsRoutes