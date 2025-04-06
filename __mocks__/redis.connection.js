class Redis {
    constructor() {
        this.get = jest.fn();
        this.set = jest.fn();
        this.del = jest.fn();
        this.on = jest.fn();
        this.disconnect = jest.fn();
    }
}

module.exports = Redis;