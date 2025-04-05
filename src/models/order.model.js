const mongoose = require("mongoose");
const uuid = require("uuid");

const orderItemSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuid.v4,
    },
    product: {
        type: String,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
    },
});

const subOrderSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuid.v4,
    },
    vendorId: {
        type: String,
        ref: "User",
        required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "cancelled"],
        default: "pending",
    },
});

const orderSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuid.v4,
    },
    customerId: {
        type: String,
        ref: "User",
        required: true,
    },
    subOrders: [subOrderSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "cancelled"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: new Date().toISOString(),
    },
});

module.exports = mongoose.model("Order", orderSchema);
