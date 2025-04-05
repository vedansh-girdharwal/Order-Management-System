const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const {AppError} = require('../handlers/error.handler');
const {EntityType} = require('../enums/entity.enum');
const {Actions} = require('../enums/action.enum');
const {createAudit} = require('./analytics.service');

const createOrder = async (orderData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {items} = orderData;
        const groupedItems = {};

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new AppError(`Product ${item.productId} not found`, 404);
            }
            if (product.stock < item.quantity) {
                throw new AppError(`Insufficient stock for product ${product.name}`, 400);
            }

            const vendorId = product.vendorId.toString();
            if (!groupedItems[vendorId]) {
                groupedItems[vendorId] = [];
            }
            groupedItems[vendorId].push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });

            product.stock -= item.quantity;
            await product.save({session});
        }

        const subOrders = Object.entries(groupedItems).map(([vendorId, items]) => ({
            vendorId,
            items,
            totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }));

        const totalAmount = subOrders.reduce((sum, subOrder) => sum + subOrder.totalAmount, 0);

        const order = await Order.create([{
            customerId: orderData.customerId,
            subOrders,
            totalAmount
        }], {session});
        if (!order || order.length === 0) {
            throw new AppError('Failed to create order', 500);
        }

        await createAudit(
            EntityType.ORDER,
            order[0]._id,
            Actions.CREATE,
            orderData.userEmail,
            order.length);
        await session.commitTransaction();

        return order[0];
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const getOrder = async (orderId, user) => {
    const order = await Order.findOne({_id: orderId, customerId: user._id})
        .populate('customerId', 'name email')
        .populate('subOrders.vendorId', 'name email')
        .populate('subOrders.items.product');

    if (!order) {
        throw new AppError('Order not found for current user', 404);
    }

    if (user.role === 'customer' && order.customerId._id.toString() !== user._id.toString()) {
        throw new AppError('Not authorized to view this order', 403);
    }

    return order;
};

const getCustomerOrders = async (customerId) => {
    return await Order.find({customerId})
        .populate('subOrders.vendorId', 'name')
        .populate('subOrders.items.product');
};

const getVendorOrders = async (vendorId) => {
    return await Order.find({
        'subOrders.vendorId': vendorId
    }).populate('customerId', 'name email');
};

const updateOrderStatus = async (orderId, vendorId, status, vendorEmail) => {
    const order = await Order.findOneAndUpdate(
        {
            _id: orderId,
            'subOrders.vendorId': vendorId
        },
        {
            $set: {
                'subOrders.$.status': status
            }
        },
        {new: true}
    );

    if (!order) {
        throw new AppError('Order not found or unauthorized', 404);
    }
    await createAudit(EntityType.ORDER, orderId, Actions.UPDATE, vendorEmail, 1);

    return order;
};

const getAllOrders = async (query) => {
    const {status, startDate, endDate, limit = 10, page = 1} = query;

    const queryObj = {};
    if (status) queryObj.status = status;
    if (startDate && endDate) {
        queryObj.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const skip = (page - 1) * limit;
    return await Order.find(queryObj)
        .populate('customerId', 'name email')
        .populate('subOrders.vendorId', 'name')
        .skip(skip)
        .limit(Number(limit));
};

module.exports = {
    createOrder,
    getOrder,
    getCustomerOrders,
    getVendorOrders,
    updateOrderStatus,
    getAllOrders
};