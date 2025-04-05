class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((el) => el.message);
        return res.status(400).json({
            status: "fail",
            message: "Validation Error",
            errors,
        });
    }

    // Handle Mongoose duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            status: "fail",
            message: `Duplicate field value: ${field}. Please use another value.`,
        });
    }

    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            status: "fail",
            message: "Invalid token. Please log in again.",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            status: "fail",
            message: "Token expired. Please log in again.",
        });
    }

    // Development error response (include stack trace)
    if (process.env.NODE_ENV === "development") {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }

    // Production error response (hide error details)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    // Programming or unknown errors
    console.error("ERROR 💥:", err);
    return res.status(500).json({
        status: "error",
        message: "Something went wrong!",
    });
};

module.exports = {
    AppError,
    errorHandler,
};
