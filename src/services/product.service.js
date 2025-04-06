const Product = require('../models/product.model');
const {AppError} = require('../handlers/error.handler.js');
const {createAudit} = require('./analytics.service.js');
const {EntityType} = require('../enums/entity.enum.js');
const {Actions} = require('../enums/action.enum.js');

const createProduct = async (productData, vendorEmail) => {
    const fetchProduct = await Product.findOne({
        alias: productData.alias,
        vendorId: productData.vendorId,
        category: productData.category
    });
    if (fetchProduct) {
        throw new AppError('Product already exists', 400);
    }
    const product = await Product.create(productData);
    await createAudit(
        EntityType.PRODUCT,
        product._id,
        Actions.CREATE,
        vendorEmail,
        1);
    return product;
};

const updateProduct = async (productId, updateData, vendor) => {
    const {vendorId, vendorEmail, vendorName} = vendor;
    const product = await Product.findOne({_id: productId, vendorId});
    if (!product) {
        throw new AppError('Product not found or unauthorized', 404);
    }

    Object.assign(product, updateData);
    if (updateData.hasOwnProperty('name')) {
        product.alias = updateData.name.replace(/\s+/g, '_').toLowerCase();
    }
    await product.save();
    await createAudit(
        EntityType.PRODUCT,
        product._id,
        Actions.UPDATE,
        vendorEmail,
        1);
    return product;
};

const deleteProduct = async (productId, vendorId, vendorEmail) => {
    const product = await Product.findOneAndDelete({_id: productId, vendorId});
    if (!product) {
        throw new AppError('Product not found or unauthorized', 404);
    }
    await createAudit(
        EntityType.PRODUCT,
        product._id,
        Actions.DELETE,
        vendorEmail,
        1);
    return product;
};

const getProduct = async (productId) => {
    const product = await Product.findById(productId).populate('vendorId', 'name');
    if (!product) {
        throw new AppError('Product not found', 404);
    }
    return product;
};

const getAllProducts = async (query) => {
    const {category, sort, limit = 10, page = 1} = query;

    const queryObj = {};
    if (category) queryObj.category = category;

    let productsQuery = Product.find(queryObj).populate('vendorId', 'name');

    if (sort) {
        productsQuery = productsQuery.sort(sort.replace(',', ' '));
    }

    const skip = (page - 1) * limit;
    productsQuery = productsQuery.skip(skip).limit(Number(limit));

    return await productsQuery;
};

const getVendorProducts = async (vendorId) => {
    return await Product.find({vendorId});
};

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getAllProducts,
    getVendorProducts
}