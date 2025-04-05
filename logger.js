const conf = require("./config");
const winston = require("winston");

const logger = winston.createLogger({
    level: conf.get("logger.level") || "info",
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            handleRejections: true,
        }),
    ],
});

module.exports = logger;
