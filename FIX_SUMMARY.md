# Form Submission Fix - Implementation Summary

## Problem Analysis

Your form was throwing a **404 Not Found** error on `https://sentratech.netlify.app/api/contact` because:

1. **Architecture Mismatch**: Your frontend (HTML/CSS/JS) is deployed to Netlify, but your backend (Node.js Express server in `server.js`) is designed to run separately
2. **Relative Path Issue**: The form submission used `/api/contact` (relative path), which on Netlify becomes `https://sentratech.netlify.app/api/contact`
3. **Missing Backend**: Netlify static hosting cannot run Node.js servers - only the backend API endpoints

## What Was Fixed

### 1. **Dynamic API URL Configuration** 
   - Created [js/submit-form.js](js/submit-form.js) to use configurable API URL
   - Updated [index.html](index.html) to set `window.__API_URL__` based on environment
   - Now supports different backends for dev and production

### 2. **Mailgun Email Integration**
   - Enhanced [server.js](server.js) with proper Mailgun email sending function `sendMailgunEmail()`
   - Sends contact form data as emails to your inbox
   - Includes proper error handling and logging

### 3. **Netlify Configuration**
   - Created [netlify.toml](netlify.toml) with:
     - API endpoint redirects to your backend domain
     - Security headers (X-Frame-Options, Content-Security-Policy, etc.)
     - Cache control for static assets
   - Ready for Netlify deployment

### 4. **Comprehensive Setup Guide**
   - Created [SETUP_GUIDE.md](SETUP_GUIDE.md) with:
     - Architecture diagrams
     - Step-by-step deployment instructions
     - Mailgun configuration steps
     - Troubleshooting guide
     - Environment variables reference

## What You Need to Do

### Step 1: Deploy Backend Server (Choose One Option)

Your backend needs to run on a separate domain. Choose ONE:

**Option A: Plesk (Recommended if you own sentratech.in/yourdomain.com)**
```
1. Create subdomain: api.yourdomain.com
2. Upload server.js and project files
3. Enable Node.js in Plesk control panel
4. Set environment variables (see SETUP_GUIDE.md)
```

**Option B: Render.com (Free tier available)**
```
1. Go to render.com
2. Create new Web Service
3. Connect your GitHub repo
4. Set environment variables
5. Deploy (automatic)
```

**Option C: Railway.app (Easy setup)**
```
1. Go to railway.app
2. Create new project
3. Connect GitHub
4. Deploy
```

### Step 2: Get Mailgun Credentials

1. Visit [mailgun.com](https://mailgun.com)
2. Create account and go to API section
3. Copy your API Key and Domain
4. Add to your backend environment variables:
   ```
   MAILGUN_API_KEY=your_key_here
   MAILGUN_DOMAIN=sandboxdomain.mailgun.org
   ```

### Step 3: Update Configuration Files

**Update `index.html` (line ~1609):**
```javascript
window.__API_URL__ = 'https://api.yourdomain.com';  // Replace with your backend URL
```

**Update `netlify.toml` (line ~10):**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://api.yourdomain.com/api/:splat"  // Replace with your backend URL
```

**Update `server.js` (line ~234):**
```javascript
formData.append('to', 'your-email@example.com');  // Set your email address
```

### Step 4: Deploy Frontend to Netlify

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Fix form submission with proper API configuration"
   git push origin main
   ```

2. In Netlify Dashboard:
   - Ensure auto-deploy is enabled
   - Site will deploy automatically
   - Set environment variable: `REACT_APP_API_URL=https://api.yourdomain.com`

### Step 5: Test the Setup

**Local Testing (before deploy):**
```bash
npm install
npm start
```
Visit `http://localhost:3000` and test form

**Production Testing (after deploy):**
1. Visit `https://sentratech.netlify.app`
2. Fill out contact form
3. Should see success message
4. Check your email for the submission

## File Changes Made

| File | Changes |
|------|---------|
| [server.js](server.js) | Added Mailgun email sending function, enhanced contact endpoint |
| [js/submit-form.js](js/submit-form.js) | Updated to use configurable API URL instead of relative path |
| [index.html](index.html) | Added API URL configuration script before form submission |
| [netlify.toml](netlify.toml) | NEW - Netlify configuration with API redirects |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | NEW - Comprehensive deployment guide |
| [config.js](config.js) | NEW - Reusable API configuration module (optional) |

## Key Environment Variables

Add these to your backend deployment:

```env
# Required for Mailgun emails
MAILGUN_API_KEY=your_api_key_here
MAILGUN_DOMAIN=sandboxdomain.mailgun.org

# Required for chatbot
GEMINI_API_KEY=your_gemini_key

# Server config
NODE_ENV=production
PORT=3000
```

## Testing Checklist

- [ ] Deploy backend to separate domain (api.yourdomain.com)
- [ ] Configure Mailgun API credentials
- [ ] Update API URL in index.html
- [ ] Update backend domain in netlify.toml
- [ ] Update recipient email in server.js
- [ ] Push to GitHub
- [ ] Wait for Netlify auto-deploy
- [ ] Test form on production
- [ ] Verify email is received

## Architecture After Fix

```
User's Browser (Netlify)          Backend Server
https://sentratech.netlify.app    https://api.yourdomain.com
         |                               |
         | Form Submit                   |
         |---> https://api.yourdomain.com/api/contact
         |                               |
         |                        Process & Email
         |                        (via Mailgun)
         |                               |
         |<--- Success Response ---------|
         |
      Display "Thank You"
```

## Next Steps

1. Read [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
2. Choose and set up backend hosting (Plesk/Render/Railway)
3. Configure Mailgun account
4. Update configuration files with your URLs
5. Deploy and test

## Support

If you encounter issues:

1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md) Troubleshooting section
2. Review server logs using `npm start`
3. Check browser DevTools → Network tab
4. Verify Mailgun credentials and domain
5. Ensure CORS is properly configured for your domain

---

**Last Updated**: February 6, 2026
**Status**: Ready for deployment
