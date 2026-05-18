# EcoMarche Backend

NestJS backend for the EcoMarche dress item e-commerce website.

## Tech Stack

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT authentication
- Swagger API docs

## Backend Modules

- Health
- Auth
- Users
- Categories
- Products
- Carts
- Orders
- Payments
- Coupons
- Wishlists
- Addresses
- Admin dashboard

## Setup Instructions

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

Default API URL:

```txt
http://localhost:5000/api
```

Swagger docs:

```txt
http://localhost:5000/api/docs
```

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecomarche
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=ecomarche-secret
JWT_EXPIRES_IN=1d
```

For Neon PostgreSQL, use the full Neon connection string as `DATABASE_URL`.

## NPM Commands

```bash
npm run start:dev
npm run build
npm run seed
npm run start:prod
```

## Seed Data

Run seed data:

```bash
npm run seed
```

Seed login accounts:

```txt
Admin: admin@ecomarche.com
User:  user@ecomarche.com
Password for both: Password123
```

The seed script is safe to run multiple times. It checks existing users by email, categories by slug, and products by slug.

## Authentication Flow

1. Register or login.
2. Copy the `accessToken` from the response.
3. Send protected requests with this header:

```txt
Authorization: Bearer your_access_token
```

Admin routes require an authenticated user with `role: "admin"`.

## API Route Summary

All routes start with `/api`.

### Health

```txt
GET /health
```

### Auth

```txt
POST /auth/register
POST /auth/login
GET  /auth/profile
```

### Users

```txt
POST   /users
GET    /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
```

### Categories

```txt
POST   /categories
GET    /categories
GET    /categories/slug/:slug
GET    /categories/:id
PATCH  /categories/:id
DELETE /categories/:id
```

### Products

```txt
POST  /products
GET   /products
GET   /products/slug/:slug
GET   /products/category/:categoryId
GET   /products/:id
PATCH /products/:id
PATCH /products/:id/thumbnail
POST  /products/:id/gallery
DELETE /products/:id
```

Product query examples:

```txt
GET /products?search=dress
GET /products?categorySlug=saree
GET /products?minPrice=500&maxPrice=3000
GET /products?sort=price_asc&page=1&limit=10
```

### Cart

Requires user token.

```txt
GET    /carts/my
POST   /carts/add
PATCH  /carts/update/:itemId
DELETE /carts/remove/:itemId
DELETE /carts/clear
```

### Orders

```txt
POST  /orders/checkout
GET   /orders/my
GET   /orders/my/:id
GET   /orders
GET   /orders/:id
PATCH /orders/:id/status
```

Admin token is required for all-order routes and status updates.

### Payments

```txt
POST  /payments
GET   /payments/order/:orderId
GET   /payments/:id
PATCH /payments/:id/status
```

Admin token is required to manually create payments, get payment by payment ID, and update payment status.

### Coupons

```txt
POST   /coupons
GET    /coupons
POST   /coupons/apply
PATCH  /coupons/:id
DELETE /coupons/:id
```

Admin token is required for coupon CRUD. User token is required to apply a coupon.

### Wishlist

Requires user token.

```txt
POST   /wishlist
GET    /wishlist
DELETE /wishlist/:productId
```

### Addresses

Requires user token.

```txt
POST   /addresses
GET    /addresses
GET    /addresses/:id
PATCH  /addresses/:id
PATCH  /addresses/:id/default
DELETE /addresses/:id
```

### Admin

Requires admin token.

```txt
GET   /admin/users
GET   /admin/orders
PATCH /admin/orders/:id/status
GET   /admin/products
GET   /admin/dashboard
```

## Postman or Thunder Client Checklist

Use this order for manual testing:

1. `GET /api/health`
2. `POST /api/auth/login` with seed admin
3. `POST /api/auth/login` with seed user
4. Create or list categories
5. Create or list products
6. Add product to cart with user token
7. View cart
8. Create coupon with admin token
9. Apply coupon with user token
10. Checkout with user token
11. Get payment by order ID
12. Update payment status with admin token
13. Get my orders with user token
14. Update order status with admin token
15. Add and remove wishlist item
16. Create, update, set default, and delete address

## Example Request Bodies

### Register

```json
{
  "name": "Ayesha Rahman",
  "email": "ayesha@example.com",
  "password": "Password123",
  "phone": "01700000000"
}
```

### Login

```json
{
  "email": "user@ecomarche.com",
  "password": "Password123"
}
```

### Create Category

```json
{
  "name": "Women Dress",
  "slug": "women-dress",
  "description": "Stylish dresses for women"
}
```

### Create Product

```json
{
  "name": "Rose Midi Dress",
  "slug": "rose-midi-dress",
  "description": "A soft midi dress for everyday style.",
  "price": 2450,
  "discountPrice": 2190,
  "stock": 12,
  "size": "S, M, L, XL",
  "color": "Rose, White",
  "thumbnail": "https://example.com/rose-midi.jpg",
  "categoryId": "category-uuid",
  "imageUrls": [
    "https://example.com/rose-midi-1.jpg",
    "https://example.com/rose-midi-2.jpg"
  ]
}
```

### Add Cart Item

```json
{
  "productId": "product-uuid",
  "quantity": 2,
  "size": "M",
  "color": "Rose"
}
```

### Update Cart Item

```json
{
  "quantity": 3
}
```

### Create Coupon

```json
{
  "code": "ECO20",
  "type": "percentage",
  "value": 20,
  "minOrderAmount": 1000,
  "expiryDate": "2026-12-31T23:59:59.000Z",
  "isActive": true
}
```

### Apply Coupon

```json
{
  "code": "ECO20",
  "orderAmount": 2500
}
```

### Checkout

```json
{
  "customerName": "Ayesha Rahman",
  "customerEmail": "ayesha@example.com",
  "customerPhone": "01700000000",
  "shippingAddress": "Dhaka, Bangladesh",
  "deliveryCharge": 80,
  "couponCode": "ECO20",
  "paymentMethod": "cash_on_delivery"
}
```

### Update Order Status

```json
{
  "orderStatus": "confirmed",
  "deliveryStatus": "processing",
  "paymentStatus": "paid"
}
```

### Create Payment Manually

```json
{
  "method": "cash_on_delivery",
  "orderId": "order-uuid",
  "amount": 2580,
  "transactionId": "COD-001"
}
```

### Update Payment Status

```json
{
  "status": "paid"
}
```

### Add Wishlist Item

```json
{
  "productId": "product-uuid"
}
```

### Create Address

```json
{
  "fullName": "Ayesha Rahman",
  "phone": "01700000000",
  "division": "Dhaka",
  "district": "Dhaka",
  "upazila": "Dhanmondi",
  "addressLine": "House 10, Road 5",
  "postalCode": "1209",
  "isDefault": true
}
```

## Order and Payment Flow

1. User adds products to cart.
2. User optionally applies a coupon.
3. User checks out with shipping information and payment method.
4. Backend creates the order.
5. Backend creates a pending payment record.
6. Backend reduces product stock.
7. Backend clears the cart.
8. Admin updates payment status when payment is confirmed.
9. Admin updates order and delivery status.

Supported payment methods:

```txt
cash_on_delivery
bkash
nagad
sslcommerz
```

Only Cash on Delivery is supported now. Other methods are enum values for future gateway work.

Supported payment statuses:

```txt
pending
paid
failed
refunded
```

## Full API Testing Checklist

### Modules

- [ ] Health module returns API status.
- [ ] Auth module registers, logs in, and returns profile with JWT.
- [ ] Users module creates, lists, updates, and deletes users.
- [ ] Categories module creates and lists dress categories.
- [ ] Products module creates products with size, color, price, stock, thumbnail, and images.
- [ ] Cart module adds, updates, removes, clears, and totals cart items.
- [ ] Coupon module creates, updates, deletes, lists, and applies coupons.
- [ ] Order module checks out from cart and lists user/admin orders.
- [ ] Payment module creates payment records and updates status.
- [ ] Wishlist module adds, lists, and removes products.
- [ ] Address module creates, updates, sets default, lists, and deletes addresses.
- [ ] Admin module returns users, products, orders, and dashboard stats.

### Validation

- [ ] Required DTO fields reject empty values.
- [ ] UUID fields reject invalid IDs.
- [ ] Email fields reject invalid emails.
- [ ] Number fields reject negative values.
- [ ] Enum fields reject unsupported values.
- [ ] Unknown request fields are rejected by global validation.

### Relationships

- [ ] Product belongs to category.
- [ ] Product has many images.
- [ ] User has one cart.
- [ ] Cart has many cart items.
- [ ] Order belongs to user.
- [ ] Order has many order items.
- [ ] Order has one payment.
- [ ] User has many addresses.
- [ ] User has many wishlist items.

### Guards

- [ ] User-only routes reject missing token.
- [ ] Admin routes reject normal user token.
- [ ] Admin routes allow admin token.
- [ ] Public routes work without token.

## Common Error Fixes

### Database connection error

Check `DATABASE_URL` in `.env`.

### JWT unauthorized

Make sure the request has:

```txt
Authorization: Bearer your_access_token
```

### Validation failed

Check required fields, UUID values, enum values, and number fields.

### Coupon rejected

Check that the coupon is active, not expired, and the order amount meets `minOrderAmount`.

### Empty cart checkout error

Add at least one product to the cart before checkout.

### Product stock error

Reduce cart quantity or increase product stock.

### Image upload error

Use `multipart/form-data` and the correct field names:

```txt
thumbnail
images
```

## Final Backend Health Check

Run these commands:

```bash
npm run build
npm run seed
npm run start:dev
```

Then test:

```txt
GET http://localhost:5000/api/health
GET http://localhost:5000/api/docs
```

Expected health response:

```json
{
  "success": true,
  "statusCode": 200,
  "path": "/api/health",
  "data": {
    "status": "ok",
    "message": "EcoMarche API is running"
  }
}
```
