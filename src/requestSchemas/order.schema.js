const createOrderSchema = {
    items: {
        type: "array",
        empty: false,
        items: {
            type: "object",
            props: {
                productId: {
                    type: "string",
                    empty: false,
                    label: "product id"
                },
                quantity: {
                    type: "number",
                    integer: true,
                    positive: true,
                    empty: false,
                    label: "quantity"
                }
            }
        },
        label: "items"
    }
};

const updateOrderStatusSchema = {
    status: {
        type: "string",
        enum: ["pending", "processing", "completed", "cancelled"],
        empty: false,
        label: "status"
    }
};

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema
};