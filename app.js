const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const init = require("./init.js");
const { errorHandler } = require("./src/handlers/error.handler");
const authRoutes = require("./src/routes/auth.routes.js");
const productRoutes = require("./src/routes/product.routes.js");
const orderRoutes = require("./src/routes/order.routes.js");
const analyticsRoutes = require("./src/routes/analytics.routes.js");

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
init.connectAll();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;
