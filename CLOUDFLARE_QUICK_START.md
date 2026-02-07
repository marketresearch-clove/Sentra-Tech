# Cloudflare Workers Deployment - Quick Start

## 3-Minute Setup

### 1. Install & Login
```bash
npm install -g @cloudflare/wrangler
wrangler login
```

### 2. Set API Key
```bash
wrangler secret put OPENROUTER_API_KEY
```
(Paste your OpenRouter API key when prompted)

### 3. Deploy
```bash
wrangler deploy
```

### 4. Done!
Frontend already configured for: `https://veronica-sentra.workers.dev`

## That's it! 🎉

Your worker is now live and your chatbot will use the Cloudflare backend.

### Test It
```bash
curl -X POST https://veronica-sentra.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi, what is Sentra?"}'
```

## Need Help?
See `CLOUDFLARE_DEPLOYMENT.md` for detailed instructions.
