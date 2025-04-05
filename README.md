I'll help you create a comprehensive README.md file for your Order Management System project along with a sample .env file.

```markdown:/Users/vedanshgirdharwal/private/Order-Management-System/README.md
# Order Management System

A Multi-Vendor Order Management System built with Node.js, Express, and MongoDB.

## Features

- Multi-vendor support
- Role-based access control (Customer, Vendor, Admin)
- Product management
- Order processing with automatic vendor splitting
- Analytics and reporting
- Audit logging for all operations

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Order-Management-System
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory (see Environment Variables section)

4. Start the server
```bash
npm start
```

For development:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3000

# MongoDB
MONGO_URL=mongodb://localhost:27017/order-management

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_EXPIRES_IN=1h
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- POST `/api/auth/refresh-token` - Refresh access token

### Products
- POST `/api/products` - Create product (Vendor)
- PUT `/api/products/:id` - Update product (Vendor)
- DELETE `/api/products/:id` - Delete product (Vendor)
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get product details
- GET `/api/products/vendor-products` - Get vendor's products

### Orders
- POST `/api/orders` - Create order (Customer)
- GET `/api/orders/my-orders` - Get customer's orders
- GET `/api/orders/vendor-orders` - Get vendor's orders
- PATCH `/api/orders/vendor-orders/:orderId` - Update order status (Vendor)
- GET `/api/orders/all` - Get all orders (Admin)

### Analytics
- GET `/api/analytics/vendor-revenue` - Get vendor revenue (Admin)
- GET `/api/analytics/top-products` - Get top products (Admin)
- GET `/api/analytics/average-order-value` - Get average order value (Admin)
- GET `/api/analytics/daily-sales` - Get daily sales (Vendor)
- GET `/api/analytics/low-stock-items` - Get low stock items (Vendor)

## Project Structure

```
src/
├── connections/     # Database connections
├── controllers/     # Route controllers
├── enums/          # Enums and constants
├── handlers/       # Error handlers
├── middlewares/    # Custom middlewares
├── models/         # Database models
├── requestSchemas/ # Request validation schemas
├── routes/         # API routes
├── services/       # Business logic
└── utils/         # Utility functions
```

## Error Handling

The system uses a centralized error handling mechanism with custom AppError class and error handler middleware.

## Authentication

JWT-based authentication with access and refresh tokens. Protected routes require a valid Bearer token.

## Request Validation

Uses fastest-validator for request payload validation with predefined schemas.

## Audit Logging

All major operations (create, update, delete) are logged in the audit collection for tracking and monitoring.
