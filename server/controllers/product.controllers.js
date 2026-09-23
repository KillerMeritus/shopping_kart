import productModel from "../model/product.model.js";

const createProduct = async (req, res) => {
    try {
        const product = await productModel.create(req.body);

        res.status(201).json(product);
    } catch (err) {
        res.status(400).json(err);
    }
};

const getProducts = async (req, res) => {
    try {
        const filter = {};

        const { search, category , sort } = req.query;

        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        if (category) {
            filter.category = category;
        }

        let query = productModel.find(filter);

        if (sort === "price_asc") {
            query = query.sort({ price: 1 });
        }

        if (sort === "price_desc") {
            query = query.sort({ price: -1 });
        }

        const products = await query;




        res.status(200).json(products);
    } catch (err) {
        res.status(500).json(err);
    }
};

const getProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (err) {
        res.status(400).json({
            message: "Invalid product ID"
        });
    }
};

export { createProduct, getProducts , getProduct};