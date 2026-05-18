# FastLain Frontend Setup

Next.js 16.2 frontend for the FastLain premium fashion e-commerce website.

## 1. Installation Commands

```bash
cd frontend
npm install
npm run dev
```

Useful commands:

```bash
npm run build
npm run lint
```

## 2. Folder Setup

```txt
frontend/
  app/
  components/
  constants/
  hooks/
  lib/
  public/
  services/
```

## 3. Global Layout

The global layout is here:

```txt
app/layout.tsx
```

It includes:

```txt
Header
main page content
Footer
```

## 4. Tailwind Setup

Tailwind CSS is loaded in:

```txt
app/globals.css
```

PostCSS config is here:

```txt
postcss.config.mjs
```

## 5. Common Folders

```txt
components/layout/
components/products/
components/cart/
components/checkout/
components/ui/
components/common/
hooks/
services/
constants/
lib/
```

## 6. Path Alias Setup

Use this import style:

```ts
import { Button } from "@/components/ui/Button";
```

The alias is configured in:

```txt
tsconfig.json
```

## 7. Basic Reusable Components

```txt
components/layout/Header.tsx
components/layout/Footer.tsx
components/ui/Button.tsx
components/ui/Input.tsx
components/products/ProductCard.tsx
components/products/ProductGrid.tsx
components/cart/CartItem.tsx
components/cart/CartSummary.tsx
components/checkout/CheckoutForm.tsx
```

## 8. Environment File Example

Copy the example file:

```bash
cp .env.example .env.local
```

Example:

```txt
NEXT_PUBLIC_API_URL=http://localhost:4000
```
