const mongoose = require('mongoose');
const Order = require('../../../src/models/order.model');
const Product = require('../../../src/models/product.model');
const {AppError} = require('../../../src/handlers/error.handler');
const {createAudit} = require('../../../src/services/analytics.service');
const orderService = require('../../../src/services/order.service');

jest.mock('../../../src/models/order.model');
jest.mock('../../../src/models/product.model');
jest.mock('../../../src/services/analytics.service');

describe('Order Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        it('should create an order successfully', async () => {
            const session = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn()
            };
            mongoose.startSession = jest.fn().mockResolvedValue(session);

            const mockProduct = {
                _id: 'product1',
                name: 'Product 1',
                stock: 10,
                price: 100,
                vendorId: 'vendor1',
                vendorName: 'Vendor 1',
                save: jest.fn()
            };
            Product.findById.mockResolvedValue(mockProduct);

            const mockOrder = [{
                _id: 'order1',
                subOrders: [{
                    vendorId: 'vendor1',
                    vendorName: 'Vendor 1',
                    items: [{product: 'product1', productName: 'Product 1', quantity: 1, price: 100}],
                    totalAmount: 1000
                }]
            }];
            Order.create.mockResolvedValue(mockOrder);

            const orderData = {
                customerId: 'customer1',
                items: [{productId: 'product1', quantity: 1}],
                userEmail: 'test@example.com'
            };
            const result = await orderService.createOrder(orderData);

            expect(result).toEqual(mockOrder[0]);
            expect(Product.findById).toHaveBeenCalledTimes(1);
            expect(Order.create).toHaveBeenCalledTimes(1);
            expect(createAudit).toHaveBeenCalledTimes(1);
            expect(session.commitTransaction).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if product is not found', async () => {
            const session = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn()
            };
            mongoose.startSession = jest.fn().mockResolvedValue(session);

            Product.findById.mockResolvedValue(null);

            const orderData = {
                customerId: 'customer1',
                items: [{productId: 'product1', quantity: 1}],
                userEmail: 'test@example.com'
            };

            await expect(orderService.createOrder(orderData)).rejects.toThrow(AppError);
            expect(Product.findById).toHaveBeenCalledTimes(1);
            expect(session.abortTransaction).toHaveBeenCalledTimes(1);
        });
    });

    describe('getOrder', () => {
        it('should return an order for the current user', async () => {
            const mockOrder = {
                _id: 'order1',
                customerId: {_id: 'customer1', name: 'Customer 1', email: 'customer1@example.com'},
                subOrders: [{
                    vendorId: {_id: 'vendor1', name: 'Vendor 1', email: 'vendor1@example.com'},
                    items: [{product: {_id: 'product1', name: 'Product 1'}}]
                }]
            };
            const populateMock = jest.fn().mockReturnValue({populate: jest.fn().mockReturnValue({populate: jest.fn().mockResolvedValue(mockOrder)})});
            Order.findOne.mockReturnValue({populate: populateMock});

            const result = await orderService.getOrder('order1', {_id: 'customer1', role: 'customer'});

            expect(result).toEqual(mockOrder);
            expect(Order.findOne).toHaveBeenCalledTimes(1);
            expect(populateMock).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if order is not found', async () => {
            const populateMock = jest.fn().mockReturnValue({populate: jest.fn().mockReturnValue({populate: jest.fn().mockResolvedValue(null)})});
            Order.findOne.mockReturnValue({populate: populateMock});

            await expect(orderService.getOrder('order1', {
                _id: 'customer1',
                role: 'customer'
            })).rejects.toThrow(AppError);
            expect(Order.findOne).toHaveBeenCalledTimes(1);
            expect(populateMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('getCustomerOrders', () => {
        it('should return orders for a customer', async () => {
            const mockOrders = [{_id: 'order1', customerId: 'customer1'}];
            const populateMock = jest.fn().mockReturnValue({populate: jest.fn().mockResolvedValue(mockOrders)});
            Order.find.mockReturnValue({populate: populateMock});

            const result = await orderService.getCustomerOrders('customer1');

            expect(result).toEqual(mockOrders);
            expect(Order.find).toHaveBeenCalledTimes(1);
            expect(populateMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('getVendorOrders', () => {
        it('should return orders for a vendor', async () => {
            const mockOrders = [{_id: 'order1', subOrders: [{vendorId: 'vendor1'}]}];
            const populateMock = jest.fn().mockReturnValue(mockOrders);
            Order.find.mockReturnValue({populate: populateMock});

            const result = await orderService.getVendorOrders('vendor1');

            expect(result).toEqual(mockOrders);
            expect(Order.find).toHaveBeenCalledTimes(1);
            expect(populateMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateOrderStatus', () => {
        it('should update the order status', async () => {
            const mockOrder = {_id: 'order1', subOrders: [{vendorId: 'vendor1', status: 'completed'}]};
            Order.findOneAndUpdate.mockResolvedValue(mockOrder);

            const result = await orderService.updateOrderStatus('order1', 'vendor1', 'completed', 'vendor@example.com');

            expect(result).toEqual(mockOrder);
            expect(Order.findOneAndUpdate).toHaveBeenCalledTimes(1);
            expect(createAudit).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if order is not found', async () => {
            Order.findOneAndUpdate.mockResolvedValue(null);

            await expect(orderService.updateOrderStatus('order1', 'vendor1', 'completed', 'vendor@example.com')).rejects.toThrow(AppError);
            expect(Order.findOneAndUpdate).toHaveBeenCalledTimes(1);
        });
    });

    describe('getAllOrders', () => {
        it('should return all orders based on query', async () => {
            const mockOrders = [{_id: 'order1'}];
            const populateMock = jest.fn().mockReturnValue({populate: jest.fn().mockReturnValue({skip: jest.fn().mockReturnValue({limit: jest.fn().mockResolvedValue(mockOrders)})})});
            Order.find.mockReturnValue({populate: populateMock});

            const query = {status: 'completed', startDate: '2023-01-01', endDate: '2023-01-31', limit: 10, page: 1};
            const result = await orderService.getAllOrders(query);

            expect(result).toEqual(mockOrders);
            expect(Order.find).toHaveBeenCalledTimes(1);
            expect(populateMock).toHaveBeenCalledTimes(1);
        });
    });
});