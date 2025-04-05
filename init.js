const mongo = require("./src/connections/mongo.connection");
const { redis } = require("./src/connections/redis.connection");

exports.connectAll = () => {
    mongo.connect();
    redis;
};
