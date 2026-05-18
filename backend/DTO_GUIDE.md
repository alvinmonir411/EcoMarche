# EcoMarche DTO Guide

This backend keeps DTOs inside each feature module.

## DTO Folder Structure

```txt
src/
  auth/
    dto/
      login.dto.ts
      register.dto.ts
  users/
    dto/
      create-user.dto.ts
      update-user.dto.ts
  categories/
    dto/
      create-category.dto.ts
      update-category.dto.ts
  products/
    dto/
      create-product.dto.ts
      update-product.dto.ts
  carts/
    dto/
      create-cart.dto.ts
      update-cart.dto.ts
      add-cart-item.dto.ts
      update-cart-item.dto.ts
  orders/
    dto/
      create-order.dto.ts
      update-order.dto.ts
      create-order-item.dto.ts
      update-order-status.dto.ts
  wishlists/
    dto/
      create-wishlist.dto.ts
      update-wishlist.dto.ts
  addresses/
    dto/
      create-address.dto.ts
      update-address.dto.ts
```

## Global ValidationPipe

Validation is enabled in `src/main.ts`.

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

## Example Request Bodies

### Auth Register

```json
{
  "name": "Ayesha Rahman",
  "email": "ayesha@example.com",
  "password": "password123",
  "phone": "+8801712345678"
}
```

### Auth Login

```json
{
  "email": "ayesha@example.com",
  "password": "password123"
}
```

### Create User

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "phone": "+8801712345678",
  "role": "ADMIN"
}
```

### Create Category

```json
{
  "name": "Dresses",
  "slug": "dresses",
  "description": "Modern dress items for EcoMarche."
}
```

### Create Product

```json
{
  "name": "Floral Summer Dress",
  "slug": "floral-summer-dress",
  "description": "A light floral dress for everyday summer styling.",
  "price": 2490,
  "discountPrice": 2190,
  "stock": 20,
  "size": "M",
  "color": "Pink",
  "thumbnail": "https://example.com/images/floral-dress.jpg",
  "categoryId": "11111111-1111-1111-1111-111111111111",
  "imageUrls": [
    "https://example.com/images/floral-dress-1.jpg",
    "https://example.com/images/floral-dress-2.jpg"
  ]
}
```

### Create Cart

```json
{
  "userId": "22222222-2222-2222-2222-222222222222"
}
```

### Add Cart Item

```json
{
  "productId": "33333333-3333-3333-3333-333333333333",
  "quantity": 2,
  "size": "M",
  "color": "Pink"
}
```

### Create Order

```json
{
  "customerName": "Ayesha Rahman",
  "customerEmail": "ayesha@example.com",
  "customerPhone": "+8801712345678",
  "shippingAddress": "House 12, Road 4, Dhaka",
  "totalPrice": 4380,
  "userId": "22222222-2222-2222-2222-222222222222",
  "items": [
    {
      "productId": "33333333-3333-3333-3333-333333333333",
      "quantity": 2,
      "productName": "Floral Summer Dress",
      "price": 2190,
      "size": "M",
      "color": "Pink"
    }
  ]
}
```

### Update Order Status

```json
{
  "paymentStatus": "PAID",
  "deliveryStatus": "PROCESSING",
  "orderStatus": "CONFIRMED"
}
```

### Create Wishlist Item

```json
{
  "userId": "22222222-2222-2222-2222-222222222222",
  "productId": "33333333-3333-3333-3333-333333333333"
}
```

### Create Address

```json
{
  "userId": "22222222-2222-2222-2222-222222222222",
  "fullName": "Ayesha Rahman",
  "phone": "+8801712345678",
  "street": "House 12, Road 4",
  "city": "Dhaka",
  "postalCode": "1207",
  "country": "Bangladesh",
  "isDefault": true
}
```
