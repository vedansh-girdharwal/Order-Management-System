const analyticsService = require('../services/analytics.service.js');

const getVendorRevenue = async (req, res, next) => {
  try {
    const revenue = await analyticsService.getVendorRevenue();
    res.status(200).json({
      status: 'success',
      data: { revenue }
    });
  } catch (error) {
    next(error);
  }
};

const getTopProducts = async (req, res, next) => {
  try {
    const products = await analyticsService.getTopProducts();
    res.status(200).json({
      status: 'success',
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

const getAverageOrderValue = async (req, res, next) => {
  try {
    const average = await analyticsService.getAverageOrderValue();
    res.status(200).json({
      status: 'success',
      data: { average }
    });
  } catch (error) {
    next(error);
  }
};

const getDailySales = async (req, res, next) => {
  try {
    const sales = await analyticsService.getDailySales(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { sales }
    });
  } catch (error) {
    next(error);
  }
};

const getLowStockItems = async (req, res, next) => {
  try {
    const items = await analyticsService.getLowStockItems(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { items }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVendorRevenue,
  getTopProducts,
  getAverageOrderValue,
  getDailySales,
  getLowStockItems
};