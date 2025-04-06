jest.mock("ioredis", () => require("../__mocks__/redis.connection"));
jest.mock('moment', () => require('../__mocks__/moment'));