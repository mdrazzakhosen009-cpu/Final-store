# SR STYLE BD — Premium Full-Stack Clothing Store

A client-ready fashion storefront with a separate secure admin CMS, real order API, optional PostgreSQL persistence, local JSON fallback, image uploads, product/category/review management, cart + checkout, and a Bangla/English/Banglish shopping assistant.

## Included
- SR STYLE BD logo and dark navy/gold premium theme
- Header WhatsApp: 01351063332
- Responsive storefront and mobile drawer
- Demo clothing catalog with distinct raster product images
- Product details: size, color, stock, description, cart, order now
- Reviews with horizontal auto-scroll
- Admin sidebar: Dashboard, Products, Categories, Reviews, Orders, FAQ, Store Settings, Assistant, Security
- Landing Page admin tab removed
- Direct image upload from admin
- Admin password change endpoint (8+ chars)
- Bangla + English + Banglish local shopping concierge with product cards and actions
- PostgreSQL via DATABASE_URL; JSON fallback for development

## Run
```bash
npm install
npm start
```
Open `/` for the store and `/admin` for the private CMS.

## Environment
`PORT=10000`
`ADMIN_PASSWORD=change-this-password`
`JWT_SECRET=use-a-long-random-secret`
`DATABASE_URL=`

For production, set a strong ADMIN_PASSWORD and JWT_SECRET and use a persistent PostgreSQL database.
