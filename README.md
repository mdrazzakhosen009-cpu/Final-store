# SAREE Premium — Turso Production Store

A production-ready Node.js + Express + Turso + Groq saree store. The customer Store, Admin Panel and API all use the same Turso database.

## What is fixed in this build
- Premium black/gold storefront recreated to closely match the supplied SAREE design reference.
- Default logo and hero artwork are bundled with the deployment; no upload is required for the initial design.
- Five polished demo products are automatically seeded into **Turso on the first empty deployment** and then marked as seeded so they do not return after deletion.
- Demo support agents are also seeded on the first setup so the Contact section is useful immediately.
- Admin product add/edit/delete is real CRUD and immediately appears on the Store after save.
- Product uploads are stored as base64 data in Turso, not on Render's ephemeral disk.
- Admin logo upload is stored in Turso and immediately replaces the default Store logo.
- Store/payment/delivery/theme/chatbot settings are stored in Turso and read live by the Store.
- Orders are written to Turso and receive SAR-000001 style order IDs.
- Order tracking reads directly from Turso.
- Password changes update the Turso password hash and invalidate active admin sessions.
- API responses are marked no-store to avoid stale admin/store data.
- Checkout only shows payment methods configured by Admin.
- Groq chatbot uses the live catalog and store settings.
- Customer image matching validates AI results against the live Turso catalog.

## Render
Root Directory: **blank**
Build Command: `npm install`
Start Command: `npm start`

## Environment Variables
Required:
- `TURSO_DATABASE_URL` — your `libsql://...` Turso database URL
- `TURSO_AUTH_TOKEN` — a fresh Turso auth token
- `ADMIN_PASSWORD` — initial admin password when the database has no admin row yet
- `GROQ_API_KEY` — Groq API key

Optional:
- `GROQ_MODEL` — defaults to `meta-llama/llama-4-scout-17b-16e-instruct`

## Important password behavior
`ADMIN_PASSWORD` is used only when the Turso database is initialized for the first time. After that, the admin password is stored as a hash in Turso and should be changed from **Admin → Security**. Changing the environment variable later does not overwrite an existing database password.

## Persistent data
Products, product images, agents, orders, tracking data, store/payment/delivery settings, chatbot quick options, custom logo data and admin password hash are persisted in Turso. Render's local filesystem is not used for application data.

The bundled default design assets are part of the deployed application, while uploaded product/logo images are stored in Turso.

## Security
Never commit Turso tokens, Groq keys or passwords to GitHub. If an old Turso token was exposed, revoke it and create a fresh token before deployment.
