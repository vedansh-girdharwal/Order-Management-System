const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const {
  validateRequest,
} = require("../middlewares/requestValidator.middleware");
const {
  createProductSchema,
  updateProductSchema,
} = require("../requestSchemas/product.schema");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getAllProducts,
  getVendorProducts,
} = require("../controllers/product.controller.js");

// Vendor only routes
router.use(authenticate, authorize("vendor"));
router.post("/", validateRequest(createProductSchema), createProduct);
router.put("/:id", validateRequest(updateProductSchema), updateProduct);
router.delete("/:id", deleteProduct);
router.get("/vendor-products", getVendorProducts);

// Public routes
router.get("/:id", getProduct);
router.get("/", getAllProducts);

module.exports = router;
