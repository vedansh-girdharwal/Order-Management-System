const mongoose = require('mongoose');
            const Order = require('../../../src/models/order.model');
            const Product = require('../../../src/models/product.model');
            const Audit = require('../../../src/models/audit.model');
            const analyticsService = require('../../../src/services/analytics.service');

            jest.mock('../../../src/models/order.model');
            jest.mock('../../../src/models/product.model');
            jest.mock('../../../src/models/audit.model');

            describe('Analytics Service', () => {
                afterEach(() => {
                    jest.clearAllMocks();
                });

                describe('getVendorRevenue', () => {
                    it('should return vendor revenue for the last 30 days', async () => {
                        const mockRevenue = [
                            { vendorId: 'vendor1', vendorName: 'Vendor 1', totalRevenue: 1000 }
                        ];
                        Order.aggregate.mockResolvedValue(mockRevenue);

                        const result = await analyticsService.getVendorRevenue();
                        expect(result).toEqual(mockRevenue);
                        expect(Order.aggregate).toHaveBeenCalledTimes(1);
                    });
                });

                describe('getTopProducts', () => {
                    it('should return top 5 products by sales', async () => {
                        const mockProducts = [
                            { productId: 'product1', productName: 'Product 1', totalSales: 50 }
                        ];
                        Order.aggregate.mockResolvedValue(mockProducts);

                        const result = await analyticsService.getTopProducts();
                        expect(result).toEqual(mockProducts);
                        expect(Order.aggregate).toHaveBeenCalledTimes(1);
                    });
                });

                describe('getAverageOrderValue', () => {
                    it('should return the average order value', async () => {
                        const mockAverage = [{ averageValue: 200 }];
                        Order.aggregate.mockResolvedValue(mockAverage);

                        const result = await analyticsService.getAverageOrderValue();
                        expect(result).toEqual(200);
                        expect(Order.aggregate).toHaveBeenCalledTimes(1);
                    });

                    it('should return 0 if no orders are found', async () => {
                        Order.aggregate.mockResolvedValue([]);

                        const result = await analyticsService.getAverageOrderValue();
                        expect(result).toEqual(0);
                        expect(Order.aggregate).toHaveBeenCalledTimes(1);
                    });
                });

                describe('getDailySales', () => {
                    it('should return daily sales for the last 7 days', async () => {
                        const mockSales = [
                            { _id: '2023-10-01', totalSales: 500 }
                        ];
                        Order.aggregate.mockResolvedValue(mockSales);

                        const result = await analyticsService.getDailySales('vendor1');
                        expect(result).toEqual(mockSales);
                        expect(Order.aggregate).toHaveBeenCalledTimes(1);
                    });
                });

                describe('getLowStockItems', () => {
                    it('should return items with stock less than 10', async () => {
                        const mockItems = [
                            { name: 'Product 1', stock: 5 }
                        ];
                        const selectMock = jest.fn().mockResolvedValue(mockItems);
                        Product.find.mockReturnValue({ select: selectMock });

                        const result = await analyticsService.getLowStockItems('vendor1');
                        expect(result).toEqual(mockItems);
                        expect(Product.find).toHaveBeenCalledTimes(1);
                        expect(selectMock).toHaveBeenCalledTimes(1);
                    });
                });

                describe('createAudit', () => {
                    it('should create an audit entry', async () => {
                        const mockAudit = { entityType: 'ORDER', entityId: 'order1', action: 'CREATE', userEmail: 'test@example.com', count: 1 };
                        Audit.create.mockResolvedValue(mockAudit);

                        await analyticsService.createAudit('ORDER', 'order1', 'CREATE', 'test@example.com', 1);
                        expect(Audit.create).toHaveBeenCalledWith(mockAudit);
                        expect(Audit.create).toHaveBeenCalledTimes(1);
                    });
                });
            });