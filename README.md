# Zenova Agency — Backend

Production-ready Node.js + Express backend for the Zenova Agency contact form.

**What it does on every submission:**
1. Validates & sanitizes input (with localized error messages).
2. Blocks bots via honeypot + rate-limiting.
3. Persists the lead to `data/submissions.jsonl` (swap for a DB later).
4. Sends **you** an email notification (HTML + plaintext).
5. Sends the **client** an auto-reply email **in their language** (EN / FR / AR — Arabic uses RTL).
6. Sends a **WhatsApp** notification to your business number.
7. Returns a localized success/error JSON to the frontend.

---

## 1. Folder structure

```
backend/
├── server.js                       # HTTP entry point + graceful shutdown
├── package.json
├── .env.example                    # Template — copy to .env and fill in
├── .gitignore
├── README.md
├── data/                           # Auto-created — stores submissions.jsonl
└── src/
    ├── app.js                      # Express composition (helmet, cors, routes…)
    ├── config/
    │   └── env.js                  # .env loader + validator
    ├── controllers/
    │   └── contactController.js    # Orchestrates validate → save → notify → respond
    ├── routes/
    │   └── contactRoutes.js        # POST /api/contact, GET /api/health
    ├── middleware/
    │   ├── errorHandler.js         # 404 + global error handler (localized)
    │   ├── honeypot.js             # Silent bot trap
    │   ├── rateLimiter.js          # Per-IP rate limiter
    │   └── sanitize.js             # Strips HTML & control chars from req.body
    ├── services/
    │   ├── emailService.js         # Nodemailer + Gmail SMTP
    │   ├── whatsappService.js      # Meta Cloud API (or Twilio fallback)
    │   ├── storageService.js       # Append-only JSONL persistence
    │   └── templates.js            # HTML + text email/WhatsApp builders
    ├── locales/
    │   ├── en.js                   # English strings
    │   ├── fr.js                   # French strings
    │   ├── ar.js                   # Arabic strings (RTL)
    │   └── index.js                # t(lang, key) translator + helpers
    └── utils/
        ├── logger.js
        └── validators.js           # express-validator rules (emit translation keys)
```

Adding a 4th language is a 2-step change: copy `locales/en.js` → `locales/<code>.js`, translate the values, then register it in `locales/index.js` (`LOCALES = { en, fr, ar, <code> }`). No other file needs to change.

---

## 2. Run locally

### 2.1 Install
```powershell
cd backend
npm install
```

### 2.2 Configure
Copy `.env.example` → `.env` and fill in:

```powershell
Copy-Item .env.example .env
notepad .env
```

Minimum to receive emails (WhatsApp can be added later):
- `SMTP_USER` = `zenova.digital1@gmail.com`
- `SMTP_PASS` = your 16-char Gmail **App Password** (NOT your normal password)
- `NOTIFY_EMAIL` = `zenova.digital1@gmail.com`
- `CORS_ORIGINS` = your frontend URL(s), comma-separated

### 2.3 Generate a Gmail App Password
1. Go to https://myaccount.google.com/security and enable **2-Step Verification**.
2. Go to https://myaccount.google.com/apppasswords
3. App: *Mail*, Device: *Other ("Zenova Backend")* → **Generate**.
4. Copy the 16-character password (without spaces) into `SMTP_PASS`.

### 2.4 Start the server
```powershell
npm run dev      # nodemon (auto-reload)
# or
npm start        # plain node
```

Server starts on `http://localhost:5000`. Test it:
```powershell
curl http://localhost:5000/api/health
```

### 2.5 Send a test submission
```powershell
$body = @{
  fullName = "Oussama Talibi"
  email    = "test@example.com"
  phone    = "+212650133502"
  company  = "Test Co"
  service  = "website"
  message  = "Hello from PowerShell"
  language = "en"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/contact `
  -Method POST -ContentType 'application/json' -Body $body
```

Expected response:
```json
{ "success": true, "language": "en", "message": "Thank you for contacting Zenova Agency...", "id": "..." }
```

You should receive both the admin notification email and the auto-reply (sent to `test@example.com` in this example — swap it for your own to verify).

---

## 3. WhatsApp setup (pick ONE provider)

### Option A — Meta WhatsApp Cloud API (recommended, free tier)

1. Create a Meta developer account: https://developers.facebook.com/
2. Create an app → *Business* → add the **WhatsApp** product.
3. Under **WhatsApp → API Setup**:
   - Note your **Phone number ID** → `META_WA_PHONE_NUMBER_ID`
   - Generate a permanent System User access token → `META_WA_TOKEN`
4. Add `+212650133502` as a verified test recipient (for sandbox use), or get your business phone approved for production.
5. Create a **message template** in WhatsApp Manager (because we initiate messages outside any 24h customer window):
   - Name: `lead_notification` (or any name → put it in `META_WA_TEMPLATE_NAME`)
   - Category: *Utility*
   - Language: `en_US` (or the code in `META_WA_TEMPLATE_LANG`)
   - Body (must have **7 variables** matching the order in `whatsappService.js`):
     ```
     New Website Lead 🚀

     Name: {{1}}
     Email: {{2}}
     Phone: {{3}}
     Company: {{4}}
     Service: {{5}}
     Message: {{6}}
     Language: {{7}}
     ```
6. Wait for Meta to approve the template, then set `WHATSAPP_PROVIDER=meta` in `.env`.

The service automatically falls back to plain text if the template send fails (useful while the template is still pending review and your number is in the 24h window).

### Option B — Twilio WhatsApp

1. Create a Twilio account: https://www.twilio.com/
2. Activate the WhatsApp sandbox (Console → Messaging → Try it out → WhatsApp).
3. From your dashboard get `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`.
4. `TWILIO_WHATSAPP_FROM` will look like `whatsapp:+14155238886` (the sandbox number).
5. Set `WHATSAPP_PROVIDER=twilio` in `.env`.

---

## 4. Connect the Netlify-hosted frontend

The frontend (`zenova final.html`) sends a JSON `POST` to `${API_BASE}/api/contact`.

### 4.1 Set the API base URL
Open `zenova final.html` and find:
```js
const API_BASE = (window.ZENOVA_API_BASE) || 'http://localhost:5000';
```
For production, either:
- Edit it directly to your deployed backend URL, e.g. `'https://zenova-backend.onrender.com'`, **or**
- Inject it at build/deploy time by adding before the script:
  ```html
  <script>window.ZENOVA_API_BASE = 'https://zenova-backend.onrender.com';</script>
  ```

### 4.2 Whitelist the frontend on the backend
In your backend `.env`:
```
CORS_ORIGINS=https://zenova.netlify.app,https://www.zenova.agency,https://zenova.agency
```
Restart the backend after editing `.env`.

### 4.3 Optional: Netlify redirect (cleaner URLs)
If you want the frontend to call `/api/contact` directly (same-origin), add a Netlify redirect in `netlify.toml`:
```toml
[[redirects]]
  from = "/api/*"
  to   = "https://zenova-backend.onrender.com/api/:splat"
  status = 200
  force = true
```
Then change `API_BASE` to an empty string (`''`) in the HTML.

---

## 5. Deploy the backend

### Best free hosting options
| Platform | Free tier | Cold start | Recommended? |
|---|---|---|---|
| **Render** | 750 hrs/mo, sleeps after 15 min idle | ~30 s | ✅ Easiest, picked below |
| **Railway** | $5 trial credit | None | ✅ Great DX |
| **Fly.io** | 3 small VMs free | None | ✅ Most flexible |
| **Cyclic / Vercel (functions)** | Generous | None / cold | ⚠️ Architecture differs |

### Deploy to Render (recommended)

1. Push the `backend/` folder to a **new GitHub repository**:
   ```powershell
   cd backend
   git init
   git add .
   git commit -m "Initial Zenova backend"
   git branch -M main
   git remote add origin https://github.com/<your-user>/zenova-backend.git
   git push -u origin main
   ```
2. Go to https://render.com → **New → Web Service** → connect the repo.
3. Settings:
   - **Environment:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Plan:** Free
4. **Environment Variables** — add every key from `.env.example` (without quotes):
   - `NODE_ENV=production`
   - `PORT=10000` (Render injects its own; this is harmless)
   - `SMTP_HOST`, `SMTP_PORT=465`, `SMTP_SECURE=true`
   - `SMTP_USER`, `SMTP_PASS` (your Gmail App Password)
   - `NOTIFY_EMAIL`, `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS`
   - `CORS_ORIGINS` (your Netlify + custom domain URLs)
   - `WHATSAPP_PROVIDER`, `WHATSAPP_TO`, plus the meta-or-twilio block
   - `RATE_LIMIT_MAX=5`, `RATE_LIMIT_WINDOW_MINUTES=10`
5. Click **Create Web Service**. Render gives you a URL like `https://zenova-backend.onrender.com`.
6. Test the live endpoint:
   ```powershell
   curl https://zenova-backend.onrender.com/api/health
   ```

### Deploy to Railway (alternative)
1. https://railway.app → **New project → Deploy from GitHub repo**
2. Add the same env vars under **Variables**.
3. Railway autodetects Node and runs `npm start`. Done.

---

## 6. Connect a custom domain (later)

Once you own e.g. `zenova.agency` (Namecheap, Cloudflare, etc.):

**Frontend (Netlify)**
1. Netlify → Site settings → Domain management → **Add custom domain** → `zenova.agency`.
2. Add the DNS records Netlify shows (an `A` record + `CNAME` for `www`).

**Backend (api.zenova.agency)**
1. Render → your service → **Settings → Custom domains** → add `api.zenova.agency`.
2. In your DNS provider, add the `CNAME` Render gives you.
3. Update the frontend:
   ```js
   const API_BASE = 'https://api.zenova.agency';
   ```
4. Update `CORS_ORIGINS` on Render to include `https://zenova.agency` and `https://www.zenova.agency`.

---

## 7. Future CRM integration

`storageService.saveSubmission()` is the single integration point. To push leads to a CRM (HubSpot, Pipedrive, Notion, Airtable, Google Sheets, Supabase…) edit ONE file:

```js
// src/services/storageService.js
const saveSubmission = async (data) => {
  // existing JSONL append…
  await axios.post('https://api.hubapi.com/crm/v3/objects/contacts', { /* ... */ }, {
    headers: { Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}` }
  });
  return record;
};
```
Add the new secret to `.env.example` and your hosting provider's env vars.

---

## 8. Security recap

- **Helmet** sets safe HTTP headers.
- **CORS** explicit allow-list — no `*` in production.
- **express-rate-limit** — 5 requests / 10 min / IP on `/api/contact` (configurable).
- **express-validator** — strict per-field validation, with localized error messages.
- **sanitize-html** — strips HTML and control chars from every string field before validation.
- **hpp** — blocks HTTP parameter pollution (`?foo=1&foo=2` attacks).
- **Honeypot** — invisible `website` field; bots fill it and get a fake 200.
- **Body limit** — 32 KB max payload.
- **Trust-proxy** — set so rate-limiting works correctly behind Render/Railway.
- **No secrets in code** — every credential lives in `.env` (gitignored).
- **Graceful shutdown** — handles SIGTERM/SIGINT cleanly.
- **Non-blocking failures** — if WhatsApp or one email fails, the user still gets a clean response and the failure is logged.

---

## 9. Endpoints

### `POST /api/contact`
**Request body (JSON):**
```json
{
  "fullName": "string (2-100, required)",
  "email":    "string (email, required)",
  "phone":    "string (6-25 chars, required)",
  "company":  "string (optional, max 120)",
  "service":  "website | social | branding | full | chat | other (required)",
  "message":  "string (5-4000, required)",
  "language": "en | fr | ar (optional, default en)",
  "website":  "honeypot — leave empty"
}
```

**Success (200):**
```json
{ "success": true, "language": "fr", "message": "Merci d'avoir contacté…", "id": "uuid" }
```

**Validation error (400):**
```json
{
  "success": false,
  "language": "fr",
  "message": "Veuillez vérifier vos informations et réessayer.",
  "errors": { "email": "Veuillez saisir une adresse e-mail valide." }
}
```

**Rate limited (429):**
```json
{ "success": false, "error": "Too many requests. Please try again later." }
```

### `GET /api/health`
```json
{ "ok": true, "service": "zenova-backend", "time": "2026-..." }
```

---

## 10. Troubleshooting

| Symptom | Fix |
|---|---|
| `Invalid login: 535 Username and Password not accepted` | Use a Gmail **App Password**, not your regular password. Enable 2FA first. |
| Frontend gets `CORS error` | Add the exact frontend origin (scheme + host, no trailing slash) to `CORS_ORIGINS`, restart server. |
| `Meta template send failed` | Template not yet approved or variable count mismatch — service falls back to plain text inside the 24h window. Approve the template in WhatsApp Manager. |
| Auto-reply lands in spam | Set up SPF/DKIM/DMARC on your custom sending domain, or use a transactional provider (Resend, SendGrid, Postmark) by swapping `transporter` in `emailService.js`. |
| `429 Too many requests` while testing | Bump `RATE_LIMIT_MAX` in `.env` or restart the server (the limiter is in-memory). |

---

Built for Zenova Agency — fast to ship, easy to scale.
