const mongoose = require("mongoose");
const uuid = require("uuid");

const productSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuid.v4,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    alias: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    vendorId: {
        type: String,
        ref: "User",
        required: true,
    },
    vendorName: {
        type: String,
        ref: "User",
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: new Date().toISOString(),
    },
});

module.exports = mongoose.model("Product", productSchema);
