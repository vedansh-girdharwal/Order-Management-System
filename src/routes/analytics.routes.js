const express = require("express");
const router = express.Router();
const {authenticate, authorize} = require("../middlewares/auth.middleware");
const analyticsController = require("../controllers/analytics.controller.js");

// Admin routes
router.use(authenticate);
router.get(
    "/vendor-revenue",
    authorize("admin"),
    analyticsController.getVendorRevenue
);
router.get(
    "/top-products",
    authorize("admin"),
    analyticsController.getTopProducts
);
router.get(
    "/average-order-value",
    authorize("admin"),
    analyticsController.getAverageOrderValue
);

// Vendor routes
router.get(
    "/daily-sales",
    authorize("vendor"),
    analyticsController.getDailySales
);
router.get(
    "/low-stock-items",
    authorize("vendor"),
    analyticsController.getLowStockItems
);

module.exports = router;
