# Made by Nexora WEB — Premium Universal Store

A premium dark-luxury universal ecommerce storefront with a separate admin panel.

## Included
- Responsive editorial black / charcoal / gold storefront
- 16 universal business categories
- 16 photorealistic demo product images (no SVG assets)
- Product search, category filtering, product details, bag and order flow
- bKash / Nagad / Rocket / Cash on Delivery fields
- WhatsApp contact: 01753519603
- Separate `/admin` panel with dashboard, products, categories, orders, reviews, FAQ, settings and security
- Human-style Bangla / Banglish / English shopping assistant
- Optional OpenAI Responses API integration
- Optional Google Custom Search verification for questions such as “eita kemon?”, “check online”, reviews and current information
- JSON persistence for simple deployment
- No external database is required for the demo build

## Run
```bash
npm install
npm start
```

Open:
- Store: `/`
- Admin: `/admin`

## Environment variables
Copy `.env.example` values into your hosting provider. At minimum set a strong `ADMIN_PASSWORD`.

For the AI assistant set `OPENAI_API_KEY`. The OpenAI assistant can use web search when supported by the configured Responses API model.

For direct Google Custom Search verification, set:
- `GOOGLE_SEARCH_API_KEY`
- `GOOGLE_SEARCH_CX`

## Render
Build Command: `npm install`
Start Command: `npm start`
Root Directory: leave blank when `package.json` is at repository root.
