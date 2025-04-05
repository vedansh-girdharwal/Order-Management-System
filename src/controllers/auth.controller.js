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
    const loginResult = await authService.login(req.body);
    res.status(200).json({
      status: 'success',
      ...loginResult,
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    await authService.logout(req);
    res.status(200).json({
      status: 'success',
      message: 'Successfully logged out'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
}