const conf = require("../../config");
const logger = require("../../logger");

const Redis = require("ioredis");

let redis;

if (!redis) {
  redis = new Redis(conf.get("redis.url"));
}

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (err) => {
  logger.error(err);
});

async function disconnect() {
  return redis.disconnect();
}

module.exports = {
  redis,
  disconnect,
};
