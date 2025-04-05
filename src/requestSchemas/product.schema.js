const createProductSchema = {
  name: {
    type: "string",
    trim: true,
    empty: false,
    min: 2,
    max: 100,
    label: "name"
  },
  price: {
    type: "number",
    positive: true,
    empty: false,
    label: "price"
  },
  stock: {
    type: "number",
    integer: true,
    min: 0,
    empty: false,
    label: "stock"
  },
  category: {
    type: "string",
    trim: true,
    empty: false,
    label: "category"
  }
};

const updateProductSchema = {
  name: {
    type: "string",
    trim: true,
    empty: false,
    min: 2,
    max: 100,
    optional: true,
    label: "name"
  },
  price: {
    type: "number",
    positive: true,
    optional: true,
    label: "price"
  },
  stock: {
    type: "number",
    integer: true,
    min: 0,
    optional: true,
    label: "stock"
  },
  category: {
    type: "string",
    trim: true,
    optional: true,
    label: "category"
  }
};

module.exports = {
  createProductSchema,
  updateProductSchema
};