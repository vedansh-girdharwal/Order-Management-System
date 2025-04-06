const mongoose = require('mongoose');
const Product = require('../../../src/models/product.model');
const { AppError } = require('../../../src/handlers/error.handler');
const { createAudit } = require('../../../src/services/analytics.service');
const productService = require('../../../src/services/product.service');

jest.mock('../../../src/models/product.model');
jest.mock('../../../src/services/analytics.service');

describe('Product Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createProduct', () => {
        it('should create a product successfully', async () => {
            const mockProductData = { alias: 'product1', vendorId: 'vendor1', category: 'category1' };
            const mockProduct = { _id: 'product1', ...mockProductData };
            Product.findOne.mockResolvedValue(null);
            Product.create.mockResolvedValue(mockProduct);

            const result = await productService.createProduct(mockProductData, 'vendor@example.com');

            expect(result).toEqual(mockProduct);
            expect(Product.findOne).toHaveBeenCalledTimes(1);
            expect(Product.create).toHaveBeenCalledTimes(1);
            expect(createAudit).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if product already exists', async () => {
            const mockProductData = { alias: 'product1', vendorId: 'vendor1', category: 'category1' };
            Product.findOne.mockResolvedValue(mockProductData);

            await expect(productService.createProduct(mockProductData, 'vendor@example.com')).rejects.toThrow(AppError);
            expect(Product.findOne).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateProduct', () => {
        it('should update a product successfully', async () => {
            const mockProduct = { _id: 'product1', vendorId: 'vendor1', save: jest.fn() };
            Product.findOne.mockResolvedValue(mockProduct);

            const updateData = { name: 'Updated Product' };
            const vendor = { vendorId: 'vendor1', vendorEmail: 'vendor@example.com', vendorName: 'Vendor 1' };
            const result = await productService.updateProduct('product1', updateData, vendor);

            expect(result).toEqual(mockProduct);
            expect(Product.findOne).toHaveBeenCalledTimes(1);
            expect(mockProduct.save).toHaveBeenCalledTimes(1);
            expect(createAudit).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if product is not found', async () => {
            Product.findOne.mockResolvedValue(null);

            const updateData = { name: 'Updated Product' };
            const vendor = { vendorId: 'vendor1', vendorEmail: 'vendor@example.com', vendorName: 'Vendor 1' };

            await expect(productService.updateProduct('product1', updateData, vendor)).rejects.toThrow(AppError);
            expect(Product.findOne).toHaveBeenCalledTimes(1);
        });
    });

    describe('deleteProduct', () => {
        it('should delete a product successfully', async () => {
            const mockProduct = { _id: 'product1', vendorId: 'vendor1' };
            Product.findOneAndDelete.mockResolvedValue(mockProduct);

            const result = await productService.deleteProduct('product1', 'vendor1', 'vendor@example.com');

            expect(result).toEqual(mockProduct);
            expect(Product.findOneAndDelete).toHaveBeenCalledTimes(1);
            expect(createAudit).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if product is not found', async () => {
            Product.findOneAndDelete.mockResolvedValue(null);

            await expect(productService.deleteProduct('product1', 'vendor1', 'vendor@example.com')).rejects.toThrow(AppError);
            expect(Product.findOneAndDelete).toHaveBeenCalledTimes(1);
        });
    });

    describe('getProduct', () => {
        it('should return a product successfully', async () => {
            const mockProduct = { _id: 'product1', vendorId: { _id: 'vendor1', name: 'Vendor 1' } };
            const populateMock = jest.fn().mockResolvedValue(mockProduct);
            Product.findById.mockReturnValue({ populate: populateMock });

            const result = await productService.getProduct('product1');

            expect(result).toEqual(mockProduct);
            expect(Product.findById).toHaveBeenCalledTimes(1);
            expect(populateMock).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if product is not found', async () => {
            const populateMock = jest.fn().mockResolvedValue(null);
            Product.findById.mockReturnValue({ populate: populateMock });

            await expect(productService.getProduct('product1')).rejects.toThrow(AppError);
            expect(Product.findById).toHaveBeenCalledTimes(1);
            expect(populateMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('getAllProducts', () => {
        it('should return all products based on query', async () => {
            const mockProducts = [{ _id: 'product1' }];
            const populateMock = jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue(mockProducts) }) }) });
            Product.find.mockReturnValue({ populate: populateMock });

            const query = { category: 'category1', sort: 'name', limit: 10, page: 1 };
            const result = await productService.getAllProducts(query);

            expect(result).toEqual(mockProducts);
            expect(Product.find).toHaveBeenCalledTimes(1);
            expect(populateMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('getVendorProducts', () => {
        it('should return products for a vendor', async () => {
            const mockProducts = [{ _id: 'product1', vendorId: 'vendor1' }];
            Product.find.mockResolvedValue(mockProducts);

            const result = await productService.getVendorProducts('vendor1');

            expect(result).toEqual(mockProducts);
            expect(Product.find).toHaveBeenCalledTimes(1);
        });
    });
});