# EcoMarche Authentication Guide

This backend uses NestJS, TypeORM, PostgreSQL, JWT, and bcrypt.

## Installation Commands

For PowerShell:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

## Environment Variables

Add these to `backend/.env`:

```env
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=1d
```

## Auth Files

```txt
src/
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    jwt.strategy.ts
    dto/
      login.dto.ts
      register.dto.ts
    types/
      auth-user.type.ts
  common/
    decorators/
      current-user.decorator.ts
      roles.decorator.ts
    guards/
      jwt-auth.guard.ts
      roles.guard.ts
    enums/
      user-role.enum.ts
```

## API Routes

```txt
POST /auth/register
POST /auth/login
GET  /auth/profile
```

`GET /auth/profile` needs this header:

```txt
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Example Request Bodies

### Register

```json
{
  "name": "Ayesha Rahman",
  "email": "ayesha@example.com",
  "password": "password123",
  "phone": "+8801712345678"
}
```

Public registration always creates a `USER` account.

### Login

```json
{
  "email": "ayesha@example.com",
  "password": "password123"
}
```

### Register/Login Response

```json
{
  "user": {
    "id": "22222222-2222-2222-2222-222222222222",
    "name": "Ayesha Rahman",
    "email": "ayesha@example.com",
    "phone": "+8801712345678",
    "role": "USER"
  },
  "accessToken": "jwt-token-here"
}
```

## Role Guard Example

Use `JwtAuthGuard` first, then `RolesGuard`.

```ts
import { Controller, Get, UseGuards } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";

@Controller("admin")
export class AdminController {
  @Get("dashboard")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getDashboard() {
    return { message: "Admin dashboard" };
  }
}
```

## How It Works

Register:

```txt
User sends name, email, password
Password is hashed with bcrypt
User is saved in PostgreSQL
API returns user data and a JWT access token
```

Login:

```txt
User sends email and password
Backend finds the user by email
bcrypt compares the password
API returns user data and a JWT access token
```

Profile:

```txt
User sends JWT in Authorization header
JwtStrategy validates the token
JwtAuthGuard allows the request
Controller returns the logged-in user profile
```
