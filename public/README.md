# Made by Nexora WEB — All-in-One Premium Store

A universal, client-demo-ready full-stack storefront that does not require a pack of image assets. The UI creates premium category/product visuals with CSS. Only the logo is optional: put `logo.png` inside `public/assets/`.

## Included
- Premium dark + gold editorial design
- Universal catalog with 16 business categories
- Product search, filters, cart, product modal and checkout
- Conversational shopping assistant (Bangla / English / Banglish)
- Assistant can collect name, phone, address, payment and transaction ID through order flow
- Orders persisted to `data.json`
- Separate admin panel at `/admin`
- Admin dashboard, products, categories, reviews, orders, FAQ, settings, assistant and security
- No storefront login button
- WhatsApp header number `01753519603`
- Phone-style auto-scrolling review section
- Optional OpenAI integration through `OPENAI_API_KEY`
- No external image assets required

## Run
`node server.js`

## Admin
Default password is `ADMIN_PASSWORD` if set; otherwise `nexora-admin-123` for local testing. Change it from Security after login.

## Render
Build Command: leave empty (or `npm install`)
Start Command: `node server.js`
Root Directory: leave empty

## OpenAI
Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL`. The local assistant remains available as fallback.
