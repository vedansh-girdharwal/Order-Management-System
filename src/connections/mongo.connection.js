const mongoose = require("mongoose");
const config = require("../../config");
const logger = require("../../logger");

const url = config.get("mongo.url");

function connect() {
    mongoose
        .set("strictQuery", false)
        .connect(url)
        .then(() => {
            logger.info("MongoDB connected");
        })
        .catch((err) => {
            logger.error("Error connecting mongodb", err);
        });
}

exports.connect = connect;
