const authService = require('../services/auth.service');
const { AppError } = require('../handlers/error.handler');

const registerUser = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      status: 'success',
      message: `User with email id: ${user.email} is registered`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    res.status(200).json({
      status: 'success',
      data: { accessToken, refreshToken, user }
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    await authService.logout(req.body.refreshToken);
    res.status(200).json({
      status: 'success',
      message: 'Successfully logged out'
    });
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const { accessToken } = await authService.refresh(req.body.refreshToken);
    res.status(200).json({
      status: 'success',
      data: { accessToken }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}