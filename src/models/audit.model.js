const mongoose = require("mongoose");
const uuid = require("uuid");

const auditSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
  },
  entityType: {
    type: String,
    enum: ["User", "Product", "Order"],
    required: true,
  },
  entityId: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ["CREATE", "UPDATE", "DELETE"],
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: new Date().toISOString(),
  },
});

module.exports = mongoose.model("Audit", auditSchema);
