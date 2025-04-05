const jwt = require('jsonwebtoken');
const {AppError} = require('../handlers/error.handler');
const User = require('../models/user.model');
const config = require('../../config');
const {redis} = require("../connections/redis.connection");

const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, config.get('jwt.secret'));

        // Check if user still exists
        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new AppError('User no longer exists', 401);
        }

        const checkSession = await redis.get(user.email);
        if (!checkSession) {
            throw new AppError('User session expired. Please log in first', 401);
        }
        // Grant access
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(new AppError('Invalid token', 401));
        } else {
            next(error);
        }
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

module.exports = {
    authenticate,
    authorize
}