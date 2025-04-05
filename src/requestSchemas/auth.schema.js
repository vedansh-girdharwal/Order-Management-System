const registerSchema = {
    name: {
        type: "string",
        trim: true,
        empty: false,
        min: 2,
        max: 50,
        label: "name"
    },
    email: {
        type: "email",
        trim: true,
        empty: false,
        label: "email"
    },
    password: {
        type: "string",
        min: 6,
        empty: false,
        label: "password"
    },
    role: {
        type: "string",
        optional: true,
        enum: ["customer", "vendor", "admin"],
        default: "customer",
        label: "role"
    }
};

const loginSchema = {
    email: {
        type: "email",
        trim: true,
        empty: false,
        label: "email"
    },
    password: {
        type: "string",
        empty: false,
        label: "password"
    }
};

module.exports = {
    registerSchema,
    loginSchema,
};