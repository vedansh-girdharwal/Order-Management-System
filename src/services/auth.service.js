const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const {AppError} = require('../handlers/error.handler');
const {createAudit} = require('./analytics.service');
const {EntityType} = require('../enums/entity.enum');
const {Actions} = require("../enums/action.enum");
const config = require("../../config");
const {redis} = require("../connections/redis.connection");
const moment = require("moment");

const generateTokens = (userId) => {
    return jwt.sign(
        {userId},
        config.get("jwt.secret"),
        {expiresIn: config.get("jwt.expiry_time")}
    );
};

const register = async (userData) => {
    const existingUser = await User.findOne({email: userData.email});
    if (existingUser) {
        throw new AppError('Email already exists', 400);
    }
    const newUser = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
    }
    let user = await User.create(newUser);
    user = user.toObject();
    await createAudit(
        EntityType.USER,
        user._id,
        Actions.CREATE,
        user.email,
        1,
    );
    delete user.password;
    delete user._id;
    return user;
};

const login = async ({email, password}) => {
    const user = await User.findOne({email});
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Invalid email or password', 401);
    }
    const isUserLoggedIn = await redis.get(email);
    if (isUserLoggedIn && isLessThan24HoursOld(isUserLoggedIn.createdAt)) {
        return {message: "User already logged in. Please logout first.", data: null};
    }
    const token = generateTokens(user._id);
    const saveTokenToRedis = await redis.set(email, JSON.stringify({token, createdAt: new Date().toISOString()}));
    delete user.password;
    return {message: "User logged in successfully", data: {token, user}};
};

const isLessThan24HoursOld = (isoDate) => {
    const date = moment(isoDate);
    const now = moment();
    const twentyFourHoursAgo = now.subtract(24, 'hours');
    return date.isAfter(twentyFourHoursAgo);
};

const logout = async (req) => {
    const redisSession = await redis.get(req.user.email);
    if (!redisSession) {
        throw new AppError('User has not logged in. Please log in first', 401);
    }
    redis.del(req.user.email);
};

module.exports = {
    register,
    login,
    logout,
}