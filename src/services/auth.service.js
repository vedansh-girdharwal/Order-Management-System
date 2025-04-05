const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const {AppError} = require('../handlers/error.handler');
const {createAudit} = require('./analytics.service');
const {EntityType} = require('../enums/entity.enum');
const {Actions} = require("../enums/action.enum");
const config = require("../../config");

const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        {userId},
        config.get("jwt.secret"),
        {expiresIn: config.get("jwt.expiry_time")}
    );

    const refreshToken = jwt.sign(
        {userId},
        config.get("jwt.secret"),
        {expiresIn: config.get("jwt.expiry_time")}
    );

    refreshTokens.add(refreshToken);
    return {accessToken, refreshToken};
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

    const tokens = generateTokens(user._id);
    return {...tokens, user: {...user.toObject(), password: undefined}};
};

const logout = async (refreshToken) => {
    if (!refreshTokens.has(refreshToken)) {
        throw new AppError('Invalid refresh token', 401);
    }
    refreshTokens.delete(refreshToken);
};

const refresh = async (refreshToken) => {
    if (!refreshTokens.has(refreshToken)) {
        throw new AppError('Invalid refresh token', 401);
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const accessToken = jwt.sign(
            {userId: decoded.userId},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_ACCESS_EXPIRES_IN}
        );
        return {accessToken};
    } catch (error) {
        refreshTokens.delete(refreshToken);
        throw new AppError('Invalid refresh token', 401);
    }
};

module.exports = {
    register,
    login,
    logout,
    refresh,
}