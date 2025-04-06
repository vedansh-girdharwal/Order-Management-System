const momentMock = jest.fn(() => {
    return {
        subtract: jest.fn().mockReturnValue(jest.fn().mockReturnThis()),
        isAfter: jest.fn().mockReturnValue(true),
    };
});

module.exports = momentMock;