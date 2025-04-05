const express = require("express");
const router = express.Router();
const { validateRequest } = require("../middlewares/requestValidator.middleware");
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema
} = require("../requestSchemas/auth.schema.js");
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} = require("../controllers/auth.controller.js");
const {authenticate} = require("../middlewares/auth.middleware");

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);
router.post('/logout', authenticate,logoutUser);
router.post('/refresh-token', validateRequest(refreshTokenSchema), refreshAccessToken);

module.exports = router;