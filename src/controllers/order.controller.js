const orderService = require("../services/order.service.js");

const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder({
      ...req.body,
      customerId: req.user._id,
    });
    res.status(201).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrder(req.params.id, req.user);
    res.status(200).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getCustomerOrders(req.user._id);
    res.status(200).json({
      status: "success",
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

const getVendorOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getVendorOrders(req.user._id);
    res.status(200).json({
      status: "success",
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.orderId,
      req.user._id,
      req.body.status
    );
    res.status(200).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders(req.query);
    res.status(200).json({
      status: "success",
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrder,
  getCustomerOrders,
  getVendorOrders,
  updateOrderStatus,
  getAllOrders,
};
