import productModel from "../model/product.model.js";

const createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };

        if (req.file) {
            productData.image = req.file.path || req.file.secure_url;
        }

        if (productData.price !== undefined) {
            productData.price = Number(productData.price);
        }

        if (productData.stock !== undefined) {
            productData.stock = Number(productData.stock);
        }

        if (!productData.image) {
            return res.status(400).json({
                message: "Product image is required (either file upload or image URL)"
            });
        }

        const product = await productModel.create(productData);
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({
            message: err.message || "Failed to create product",
            error: err
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (req.file) {
            updateData.image = req.file.path || req.file.secure_url;
        }

        if (updateData.price !== undefined) {
            updateData.price = Number(updateData.price);
        }

        if (updateData.stock !== undefined) {
            updateData.stock = Number(updateData.stock);
        }

        const product = await productModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (err) {
        res.status(400).json({
            message: err.message || "Failed to update product",
            error: err
        });
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

export { createProduct, getProducts, getProduct, updateProduct };