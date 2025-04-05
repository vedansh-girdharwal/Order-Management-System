"use strict";

const _ = require("lodash");
const convict = require("convict");
require("dotenv").config();

const conf = convict({
  // Server Configuration
  port: {
    doc: "The port to bind",
    format: "port",
    default: "3000",
    env: "PORT",
    arg: "port",
  },
  // Databases Credentials
  mongo: {
    url: {
      doc: "mongo url of sigma",
      format: String,
      default: process.env.MONGODB_URI,
      env: "MONGO_URI",
      arg: "mongo_uri",
    },
  },
  redis: {
    url: {
      doc: "redis url of sigma",
      format: String,
      default: process.env.REDIS_URI,
      env: "REDIS_URI",
      arg: "redis_uri",
    },
  },
  // JWT Credentials
  jwt: {
    secret: {
      doc: "jwt secret",
      format: String,
      default: process.env.JWT_SECRET,
      env: "JWT_SECRET",
      arg: "jwt_secret",
    },
    expiry_time: {
      doc: "jwt expiry time",
      format: String,
      default: process.env.JWT_EXPIRY_TIME,
      env: "JWT_EXPIRY_TIME",
      arg: "jwt_expiry_time",
    },
  },
  logger: {
    level: {
      doc: "Logger level",
      format: ["error", "warn", "info", "debug"],
      default: "info",
      env: "LOG_LEVEL",
      arg: "log_level",
    },
  },
});

// Perform validation
conf.validate({
  allowed: "strict",
});
_.extend(conf, conf.get());

module.exports = conf;
