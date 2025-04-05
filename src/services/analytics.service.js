const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Audit = require('../models/audit.model');
const { AppError } = require('../handlers/error.handler');

const getVendorRevenue = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $unwind: '$subOrders'
    },
    {
      $group: {
        _id: '$subOrders.vendorId',
        totalRevenue: { $sum: '$subOrders.totalAmount' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'vendor'
      }
    },
    {
      $project: {
        vendor: { $arrayElemAt: ['$vendor.name', 0] },
        totalRevenue: 1
      }
    }
  ]);
};

const getTopProducts = async () => {
  return await Order.aggregate([
    { $unwind: '$subOrders' },
    { $unwind: '$subOrders.items' },
    {
      $group: {
        _id: '$subOrders.items.product',
        totalSales: { $sum: '$subOrders.items.quantity' }
      }
    },
    { $sort: { totalSales: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $project: {
        product: { $arrayElemAt: ['$product.name', 0] },
        totalSales: 1
      }
    }
  ]);
};

const getAverageOrderValue = async () => {
  const result = await Order.aggregate([
    {
      $group: {
        _id: null,
        averageValue: { $avg: '$totalAmount' }
      }
    }
  ]);
  return result[0]?.averageValue || 0;
};

const getDailySales = async (vendorId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return await Order.aggregate([
    {
      $match: {
        'subOrders.vendorId': vendorId,
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    { $unwind: '$subOrders' },
    {
      $match: {
        'subOrders.vendorId': vendorId
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        totalSales: { $sum: '$subOrders.totalAmount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const getLowStockItems = async (vendorId) => {
  return await Product.find({
    vendorId,
    stock: { $lt: 10 }
  }).select('name stock');
};

// Audit tracking functions
const createAudit = async (entityType, entityId, action, userEmail, count = 1) => {
  await Audit.create({
    entityType,
    entityId,
    action,
    userEmail,
    count
  });
};

module.exports = {
  getVendorRevenue,
  getTopProducts,
  getAverageOrderValue,
  getDailySales,
  getLowStockItems,
  createAudit
};