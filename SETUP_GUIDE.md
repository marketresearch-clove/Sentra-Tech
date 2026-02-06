# Sentra Website - Setup & Deployment Guide

## Quick Start

### Local Development
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file with required variables:**
   ```
   GEMINI_API_KEY=your_gemini_api_key
   MAILGUN_API_KEY=your_mailgun_api_key
   MAILGUN_DOMAIN=your_mailgun_domain
   PORT=3000
   NODE_ENV=development
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access the website:**
   - Frontend: `http://localhost:3000` or use Live Server for static HTML
   - API endpoints: `http://localhost:3000/api/*`

---

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐
│  Netlify CDN    │         │  Your Backend   │
│  (Frontend)     │◄────────►(Plesk/Render/Railway)
│  HTML/CSS/JS    │  API    │  Express Server │
└─────────────────┘ Calls   └─────────────────┘
      |                           |
      |                           |
  sentratech.              api.yourdomain.
  netlify.app              com
```

### Components:
- **Frontend**: Static HTML/CSS/JS deployed to Netlify
- **Backend**: Node.js Express server with Mailgun integration
- **Communication**: Frontend calls backend via configured API URL

---

## Deployment Options

### Option 1: Separate Backend + Frontend (Recommended)

#### 1.1 Deploy Frontend to Netlify

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update API configuration"
   git push origin main
   ```

2. **Configure in Netlify:**
   - Go to Netlify Dashboard
   - Connect your GitHub repository
   - Set Build command: `npm install` (or leave empty for static)
   - Set Publish directory: `.`
   - Add Environment Variables:
     - `REACT_APP_API_URL`: https://api.yourdomain.com
     - `GEMINI_API_KEY`: your_gemini_key (optional, if chatbot enabled)

3. **Important:** Update `netlify.toml`:
   - Replace `https://api.yourdomain.com` with your actual backend domain

#### 1.2 Deploy Backend (Node.js Server)

**Option A: Deploy to Plesk (Using cPanel/Plesk panel)**

1. Create a subdomain (e.g., `api.yourdomain.com`)
2. Upload project files to the directory
3. Enable Node.js in Plesk control panel:
   - Node.js version: 18+
   - App mode: production
   - Startup file: `server.js`
4. Set environment variables in Plesk panel:
   - `MAILGUN_API_KEY`
   - `MAILGUN_DOMAIN`
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`

**Option B: Deploy to Render.com**

1. Push code to GitHub
2. Create new Web Service on Render:
   - Connect GitHub repo
   - Start command: `npm install && npm start`
   - Environment variables:
     ```
     MAILGUN_API_KEY=xxx
     MAILGUN_DOMAIN=xxx
     GEMINI_API_KEY=xxx
     NODE_ENV=production
     ```
3. Deploy

**Option C: Deploy to Railway.app**

1. Push code to GitHub
2. New Project → GitHub repo
3. Add environment variables
4. Deploy

#### 1.3 Update Frontend Configuration

After deploying backend, update the API URL in two places:

**File 1: `index.html` (line ~1609)**
```html
<script>
    window.__API_URL__ = 'https://api.yourdomain.com';  // Update this
</script>
```

**File 2: `netlify.toml`**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://api.yourdomain.com/api/:splat"
  status = 200
```

---

### Option 2: All-in-One Backend Service

If you want a simpler setup with everything on one domain:

1. Deploy Node.js server to your domain: `sentratech.yourdomain.com`
2. The relative path `/api/contact` will work automatically
3. No need to change the frontend configuration

---

## Email Configuration (Mailgun)

### 1. Get Mailgun Credentials

1. Go to [mailgun.com](https://mailgun.com)
2. Sign up / Login
3. Go to Dashboard → API
4. Copy API Key and Domain:
   ```
   MAILGUN_API_KEY=xxxxxxxxxxxxx
   MAILGUN_DOMAIN=sandboxyouuuuuu.mailgun.org
   ```

### 2. Configure Sandbox Domain (Testing)

For testing, use the default sandbox domain:
```
MAILGUN_DOMAIN=sandboxyourdomain.mailgun.org
MAILGUN_EMAIL_TO=your-email@example.com
```

**Note:** Sandbox domain only sends to authorized recipients. Add email addresses in Mailgun Dashboard → Sandbox Domain → Authorized Recipients.

### 3. Upgrade to Production Domain

For production, add your own domain:
1. In Mailgun Dashboard → Domains → Add Domain
2. Add DNS records provided by Mailgun
3. Use the domain in `.env`:
   ```
   MAILGUN_DOMAIN=mail.yourdomain.com
   ```

### 4. Update Contact Email Recipient

Edit `server.js` line ~195:
```javascript
formData.append('to', 'your-email@example.com');  // Change this
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Google Gemini API (for chatbot)
GEMINI_API_KEY=AIzaSy...

# Mailgun (for contact form emails)
MAILGUN_API_KEY=36bc45...
MAILGUN_DOMAIN=sandboxd4d666c90b674e6481d918e121b92e8f.mailgun.org

# Server Config
PORT=3000
NODE_ENV=development

# API URL (Netlify environment variable)
REACT_APP_API_URL=https://api.yourdomain.com
```

### Environment Variables Scope:
- **Local Dev**: Use `.env` file
- **Netlify**: Set in Netlify Dashboard → Site Settings → Build & Deploy → Environment
- **Backend Server**: Set in your hosting control panel or deployment platform

---

## Testing the Setup

### 1. Test Locally

```bash
# Start server
npm start

# Open browser
http://localhost:3000
```

Test form submission - should see success message.

### 2. Test API Endpoint Directly

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "Test message"
  }'
```

### 3. Test Mailgun Email

Check your email inbox (the one configured in `server.js`).

### 4. Test on Netlify Production

1. Push changes to GitHub
2. Wait for Netlify deploy (automatic)
3. Visit `https://sentratech.netlify.app`
4. Test form submission
5. Check network tab (DevTools) to verify API calls go to `https://api.yourdomain.com/api/contact`

---

## Troubleshooting

### Issue: 404 on `/api/contact`

**Cause:** Backend not deployed or API URL not configured.

**Fix:**
1. Ensure backend is deployed to a real domain (not Netlify)
2. Update `window.__API_URL__` in `index.html`
3. Update `netlify.toml` redirect rules

### Issue: Form submits but no email received

**Cause:** Mailgun not configured or sandbox domain restrictions.

**Fix:**
1. Check Mailgun credentials in `.env`
2. If using sandbox domain, add recipient email in Mailgun Dashboard
3. Check server logs for Mailgun errors

### Issue: CORS errors

**Cause:** Backend not allowing requests from Netlify domain.

**Fix:** Update CORS in `server.js` (already configured for `sentratech.netlify.app`):
```javascript
const corsOptions = {
  origin: [
    'https://sentratech.netlify.app',
    'https://yourdomain.com',
    // Add more domains here
  ],
  credentials: true
};
```

---

## File Structure

```
project-root/
├── index.html                 # Main page
├── server.js                  # Express backend
├── .env                       # Environment variables (gitignore this!)
├── netlify.toml              # Netlify configuration
├── package.json              # Dependencies
├── js/
│   ├── submit-form.js        # Form submission logic
│   └── ...
├── css/
│   └── style.css
└── [other files]
```

---

## Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **API keys in environment variables** - Not in code
3. **Use HTTPS** everywhere - Required for forms
4. **Validate input** on both frontend and backend
5. **CORS properly configured** - Whitelist specific domains

---

## Additional Resources

- [Mailgun Documentation](https://documentation.mailgun.com/)
- [Netlify Docs](https://docs.netlify.com/)
- [Express.js Guide](https://expressjs.com/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

---

## Support

For issues, check:
1. Server console logs
2. Browser DevTools (Network tab)
3. Mailgun Dashboard → Logs
4. Netlify site analytics & deploy logs
