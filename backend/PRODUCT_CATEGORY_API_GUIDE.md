# EcoMarche Product and Category API Guide

## Category Routes

```txt
POST   /categories
GET    /categories
GET    /categories/:id
GET    /categories/slug/:slug
PATCH  /categories/:id
DELETE /categories/:id
```

## Product Routes

```txt
POST   /products
GET    /products
GET    /products/:id
GET    /products/slug/:slug
GET    /products/category/:categoryId
PATCH  /products/:id
DELETE /products/:id
```

## Category Request Body

### Create Category

```json
{
  "name": "Dresses",
  "slug": "dresses",
  "description": "Dress items for EcoMarche customers."
}
```

### Update Category

```json
{
  "name": "Party Dresses",
  "slug": "party-dresses"
}
```

## Product Request Body

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

### Update Product

```json
{
  "price": 2290,
  "stock": 15,
  "imageUrls": [
    "https://example.com/images/new-floral-dress-1.jpg"
  ]
}
```

When `imageUrls` is sent during update, old product images are replaced with the new list.

## Example Category Response

```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "name": "Dresses",
  "slug": "dresses",
  "description": "Dress items for EcoMarche customers.",
  "products": [],
  "createdAt": "2026-05-15T08:00:00.000Z",
  "updatedAt": "2026-05-15T08:00:00.000Z"
}
```

## Example Product Response

```json
{
  "id": "33333333-3333-3333-3333-333333333333",
  "name": "Floral Summer Dress",
  "slug": "floral-summer-dress",
  "description": "A light floral dress for everyday summer styling.",
  "price": "2490.00",
  "discountPrice": "2190.00",
  "stock": 20,
  "size": "M",
  "color": "Pink",
  "thumbnail": "https://example.com/images/floral-dress.jpg",
  "category": {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "Dresses",
    "slug": "dresses"
  },
  "images": [
    {
      "id": "44444444-4444-4444-4444-444444444444",
      "imageUrl": "https://example.com/images/floral-dress-1.jpg"
    }
  ],
  "createdAt": "2026-05-15T08:00:00.000Z",
  "updatedAt": "2026-05-15T08:00:00.000Z"
}
```

PostgreSQL decimal values may come back as strings, such as `"2490.00"`.

## Paginated Product Response

`GET /products?page=1&limit=10`

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  }
}
```

## Search and Filter Examples

```txt
GET /products?search=floral
GET /products?categoryId=11111111-1111-1111-1111-111111111111
GET /products?categorySlug=dresses
GET /products?size=M
GET /products?color=Pink
GET /products?minPrice=1000&maxPrice=3000
GET /products?search=dress&categorySlug=dresses&size=M&page=1&limit=12
GET /products/slug/floral-summer-dress
GET /products/category/11111111-1111-1111-1111-111111111111
```

## DTO Files

```txt
src/categories/dto/create-category.dto.ts
src/categories/dto/update-category.dto.ts

src/products/dto/create-product.dto.ts
src/products/dto/update-product.dto.ts
src/products/dto/find-products-query.dto.ts
```
