import jwt from "jsonwebtoken";
import customerModel from "../model/customer.model.js";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const decoded = jwt.verify(token, process.env.jwt_secret);

        const customer = await customerModel.findById(decoded.customerId);

        if (!customer) {
            return res.status(401).json({
                message: "Customer not found"
            });
        }

        req.customer = customer;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

export default authMiddleware;