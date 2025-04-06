const jwt = require('jsonwebtoken');
const User = require('../../../src/models/user.model');
const {AppError} = require('../../../src/handlers/error.handler');
const {createAudit} = require('../../../src/services/analytics.service');
const {EntityType} = require('../../../src/enums/entity.enum');
const {Actions} = require('../../../src/enums/action.enum');
const config = require('../../../config');
const {redis} = require('../../../src/connections/redis.connection');
const moment = require('moment');
const authService = require('../../../src/services/auth.service');

jest.mock('moment');
jest.mock('jsonwebtoken');
jest.mock('../../../src/models/user.model');
jest.mock('../../../src/services/analytics.service');
jest.mock('../../../src/connections/redis.connection');

describe('Auth Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const mockUserData = {name: 'Test User', email: 'test@example.com', password: 'password123'};
            const mockUser = {_id: 'user1', ...mockUserData, toObject: jest.fn().mockReturnValue(mockUserData)};
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue(mockUser);

            const result = await authService.register(mockUserData);

            expect(result).toEqual(mockUserData);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.create).toHaveBeenCalledTimes(1);
            expect(createAudit).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if email already exists', async () => {
            const mockUserData = {name: 'Test User', email: 'test@example.com', password: 'password123'};
            User.findOne.mockResolvedValue(mockUserData);

            await expect(authService.register(mockUserData)).rejects.toThrow(AppError);
            expect(User.findOne).toHaveBeenCalledTimes(1);
        });
    });

    describe('login', () => {
        it('should login a user successfully', async () => {
            const mockUser = {
                _id: 'user1',
                email: 'test@example.com',
                comparePassword: jest.fn().mockResolvedValue(true),
                toObject: jest.fn().mockReturnValue({ email: 'test@example.com' })
            };
            const mockToken = 'mockToken';
            User.findOne.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValue(mockToken);
            redis.get.mockResolvedValue(null);
            redis.set.mockResolvedValue(true);

            const result = await authService.login({ email: 'test@example.com', password: 'password123' });

            expect(result).toEqual({
                message: 'User logged in successfully',
                data: {
                    token: mockToken,
                    user: {
                        _id: 'user1',
                        email: 'test@example.com',
                        comparePassword: expect.any(Function),
                        toObject: expect.any(Function)
                    }
                }
            });
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(mockUser.comparePassword).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenCalledTimes(1);
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(redis.set).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if email or password is invalid', async () => {
            User.findOne.mockResolvedValue(null);

            await expect(authService.login({
                email: 'test@example.com',
                password: 'password123'
            })).rejects.toThrow(AppError);
            expect(User.findOne).toHaveBeenCalledTimes(1);
        });

        it('should return a message if user is already logged in', async () => {
            const mockUser = {
                _id: 'user1',
                email: 'test@example.com',
                comparePassword: jest.fn().mockResolvedValue(true)
            };
            const mockSession = {createdAt: new Date().toISOString()};
            User.findOne.mockResolvedValue(mockUser);
            redis.get.mockResolvedValue(JSON.stringify(mockSession));

            const result = await authService.login({email: 'test@example.com', password: 'password123'});

            expect(result).toEqual({message: 'User already logged in. Please logout first.', data: null});
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(mockUser.comparePassword).toHaveBeenCalledTimes(1);
            expect(redis.get).toHaveBeenCalledTimes(1);
        });
    });

    describe('logout', () => {
        it('should logout a user successfully', async () => {
            const mockReq = {user: {email: 'test@example.com'}};
            redis.get.mockResolvedValue(true);

            await authService.logout(mockReq);

            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(redis.del).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if user is not logged in', async () => {
            const mockReq = {user: {email: 'test@example.com'}};
            redis.get.mockResolvedValue(null);

            await expect(authService.logout(mockReq)).rejects.toThrow(AppError);
            expect(redis.get).toHaveBeenCalledTimes(1);
        });
    });

    describe('isLessThan24HoursOld', () => {
        it('should return true if the date is less than 24 hours old', () => {
            const mockDate = '2023-10-01T12:00:00Z';
            const mockMoment = {
                subtract: jest.fn().mockReturnThis(),
                isAfter: jest.fn().mockReturnValue(true)
            };
            moment.mockReturnValueOnce(mockMoment).mockReturnValueOnce(mockMoment);

            const result = authService.isLessThan24HoursOld(mockDate);

            expect(result).toBe(true);
            expect(moment).toHaveBeenCalledTimes(2);
            expect(mockMoment.subtract).toHaveBeenCalledWith(24, 'hours');
            expect(mockMoment.isAfter).toHaveBeenCalledWith(mockMoment);
        });

        it('should return false if the date is more than 24 hours old', () => {
            const mockDate = '2023-10-01T12:00:00Z';
            const mockMoment = {
                subtract: jest.fn().mockReturnThis(),
                isAfter: jest.fn().mockReturnValue(false)
            };
            moment.mockReturnValueOnce(mockMoment).mockReturnValueOnce(mockMoment);

            const result = authService.isLessThan24HoursOld(mockDate);

            expect(result).toBe(false);
            expect(moment).toHaveBeenCalledTimes(2);
            expect(mockMoment.subtract).toHaveBeenCalledWith(24, 'hours');
            expect(mockMoment.isAfter).toHaveBeenCalledWith(mockMoment);
        });
    });
});