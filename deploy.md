# Deployment Guide (Netlify + Plesk) for Sentra Website

This project is a **static frontend + Node.js API backend** setup.

- Frontend: HTML/CSS/JS files from project root (`index.html`, `about.html`, etc.)
- Backend: `server.js` (Express API)

---

## 1) API Overview (Current)

From `server.js`, these API routes are available:

- `POST /api/chat` → Gemini AI chat
- `POST /api/fetch-web` → fetch webpage text content
- `POST /api/user-profile` → user profile capture
- `POST /api/contact` → contact form submission + Mailgun email

### Required Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Gemini API access for `/api/chat` |
| `MAILGUN_API_KEY` | Yes (for contact form) | Mailgun authentication |
| `MAILGUN_DOMAIN` | Yes (for contact form) | Mailgun sending domain |
| `PORT` | Optional | Runtime port (auto-set by Plesk/host) |

> Important: Do **not** expose API keys in frontend JS.

---

## 2) Netlify Deployment

Netlify is ideal for frontend hosting. For API, use one of these patterns:

1. **Recommended:** Frontend on Netlify + Backend on Plesk (or another Node host)
2. Advanced: Convert Express API to Netlify Functions

## 2.1 Deploy Frontend to Netlify

1. Push code to GitHub (already connected repo: `https://github.com/dev9944/sentra.git`).
2. In Netlify:
   - **Add new site** → **Import from Git**
   - Choose repository and branch
3. Build settings:
   - Build command: `npm run build` (or leave empty for static)
   - Publish directory: `.`
4. Deploy.

### Optional `netlify.toml`

Create `netlify.toml` in root (optional but recommended):

```toml
[build]
  command = "npm run build"
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
```

## 2.2 Connect Netlify Frontend to API

Since Netlify won’t run `server.js` directly in this setup, point frontend API calls to your backend domain.

Example:
- Frontend domain: `https://sentra-site.netlify.app`
- Backend domain (Plesk): `https://api.sentratech.netlify.app`

Update API usage in frontend where needed:

- Contact form currently uses relative path `/api/contact` in `js/submit-form.js`
- Keep relative path only if API is reverse-proxied on same domain
- Otherwise use full URL like `https://api.sentratech.netlify.app/api/contact`

Also configure CORS in backend (already enabled with `cors()` in `server.js`).

---

## 3) Plesk Deployment (Node.js App)

Use Plesk to host the Express backend (`server.js`).

## 3.1 Upload Code

1. Create domain/subdomain in Plesk (recommended API subdomain):
   - Example: `api.sentratech.netlify.app`
2. Upload project files to app directory (Git pull, Upload, or SFTP).

## 3.2 Enable Node.js in Plesk

In **Websites & Domains → Node.js**:

- Node.js version: 18+ recommended
- Application mode: `production`
- Application root: project folder
- Application startup file: `server.js`
- Document root: project folder (or static folder if split)

Click **NPM Install** in Plesk (or run manually):

```bash
npm install
```

## 3.3 Add Environment Variables in Plesk

Set these in Node.js app environment section:

- `GEMINI_API_KEY=...`
- `MAILGUN_API_KEY=...`
- `MAILGUN_DOMAIN=...`
- `NODE_ENV=production`

Then restart application.

## 3.4 SSL + Domain

1. Enable Let’s Encrypt SSL in Plesk.
2. Ensure API is reachable at:
   - `https://api.sentratech.netlify.app/api/contact`
   - `https://api.sentratech.netlify.app/api/chat`

---

## 4) Recommended Production Architecture

- **Frontend:** Netlify (`*.netlify.app` or custom domain)
- **API:** Plesk Node.js app (`api.sentratech.netlify.app`)

This gives easy CDN/static hosting + stable Node backend for Express APIs.

---

## 5) Post-Deployment Checklist

- [ ] Netlify frontend deployed and loads all pages
- [ ] API domain on Plesk is live with SSL
- [ ] Env vars configured (Gemini + Mailgun)
- [ ] Contact form works (`/api/contact`)
- [ ] Chat endpoint works (`/api/chat`)
- [ ] CORS validated from Netlify domain
- [ ] Remove hardcoded Gemini key from `js/chatbot.js`

---

## 6) Quick Test Commands

### Local API start

```bash
npm run start
```

### Contact API test (replace URL for production)

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@company.com\",\"subject\":\"Hello\",\"message\":\"Deployment test\"}"
```

### Chat API test

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Hi\",\"history\":[] }"
```

---

If you want, I can next add:

1. a ready-to-use `netlify.toml`,
2. a production-safe frontend API base URL config,
3. and migration of chatbot calls to backend `/api/chat` only.