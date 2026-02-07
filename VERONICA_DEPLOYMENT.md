# Deploying Veronica Sentra to Cloudflare Workers

## Quick Start (3 minutes)

### Prerequisites
- Cloudflare account (free tier works)
- OpenRouter API key

### Step 1: Install Wrangler CLI
```bash
npm install -g @cloudflare/wrangler
```

### Step 2: Authenticate with Cloudflare
```bash
wrangler login
```
This opens your browser to authenticate. Click "Allow" when prompted.

### Step 3: Set API Key Secret
```bash
wrangler secret put OPENROUTER_API_KEY
```
Paste your OpenRouter API key when prompted (it won't display on screen).

### Step 4: Deploy the Worker
From your project root directory:
```bash
wrangler deploy
```

**Output Example:**
```
✓ Uploaded veronica-sentra successfully to Cloudflare Workers
  https://veronica-sentra.workers.dev
```

## Step 5: Test Your Worker

### Test the Chatbot Endpoint
```bash
curl -X POST https://veronica-sentra.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi, what is Sentra?"}'
```

### View Live Logs
```bash
wrangler tail
```

## Step 6: Redeploy Frontend on Netlify
After deploying the Worker, redeploy Netlify to activate the new backend URL:
```bash
git add .
git commit -m "Deploy veronica-sentra Worker backend"
git push origin main
```
Netlify will automatically redeploy with the Worker URL already configured.

## Step 7: Verify It Works

1. Go to your Netlify site: `https://sentratech.netlify.app`
2. Open the chatbot
3. Send a message like "What is Sentra?"
4. Should get a response from your Cloudflare Worker

## Troubleshooting

### Error: "401 Unauthorized"
- Verify OPENROUTER_API_KEY secret was set: `wrangler secret list`
- Key may be invalid; get a new one from OpenRouter

### Error: "404 Not Found"
- Verify the Worker URL is correct in js/chatbot.js
- Check: `wrangler deployments list`

### Worker Timeout
- Check logs: `wrangler tail`
- OpenRouter API may be slow; Worker has 30s timeout

### CORS Errors
- Worker includes CORS headers for all origins
- Check browser console for detailed error

## Worker Information

- **Worker Name**: veronica-sentra
- **Configuration File**: [wrangler.toml](wrangler.toml)
- **Worker Code**: [src/index.js](src/index.js)
- **Environment**: Set in [wrangler.toml](wrangler.toml)

## Next Steps

After successful deployment:
- Monitor Worker performance in Cloudflare Dashboard
- Consider setting up KV storage for persistent user profiles
- Add custom domain (optional, requires paid Cloudflare plan)
- Set up email notifications for errors (Cloudflare Analytics)
