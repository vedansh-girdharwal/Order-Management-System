const productService = require('../services/product.service.js');

const createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct({
            ...req.body,
            alias: req.body.name.replace(/\s+/g, '_').toLowerCase(),
            vendorId: req.user._id,
            vendorName: req.user.name,
        }, req.user.email);
        res.status(201).json({
            status: 'success',
            data: {product}
        });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const product = await productService.updateProduct(
            req.params.id,
            req.body,
            {
                vendorId: req.user._id,
                vendorName: req.user.name,
                vendorEmail: req.user.email
            }
        );
        res.status(200).json({
            status: 'success',
            data: {product}
        });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        await productService.deleteProduct(req.params.id, req.user._id, req.user.email);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

const getProduct = async (req, res, next) => {
    try {
        const product = await productService.getProduct(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {product}
        });
    } catch (error) {
        next(error);
    }
};

const getAllProducts = async (req, res, next) => {
    try {
        const products = await productService.getAllProducts(req.query);
        res.status(200).json({
            status: 'success',
            data: {products}
        });
    } catch (error) {
        next(error);
    }
};

const getVendorProducts = async (req, res, next) => {
    try {
        const products = await productService.getVendorProducts(req.user._id);
        res.status(200).json({
            status: 'success',
            data: {products}
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getAllProducts,
    getVendorProducts
}