const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const {
  validateRequest,
} = require("../middlewares/requestValidator.middleware");
const {
  createOrderSchema,
  updateOrderStatusSchema,
} = require("../requestSchemas/order.schema.js");
const orderController = require("../controllers/order.controller.js");

router.use(authenticate);

// Customer routes
router.post(
  "/",
  authorize("customer"),
  validateRequest(createOrderSchema),
  orderController.createOrder
);
router.get(
  "/my-orders",
  authorize("customer"),
  orderController.getCustomerOrders
);

// Vendor routes
router.get(
  "/vendor-orders",
  authorize("vendor"),
  orderController.getVendorOrders
);
router.patch(
  "/vendor-orders/:orderId",
  authorize("vendor"),
  validateRequest(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

// Admin routes
router.get("/all", authorize("admin"), orderController.getAllOrders);

// Common routes
router.get("/:id", orderController.getOrder);

module.exports = router;
