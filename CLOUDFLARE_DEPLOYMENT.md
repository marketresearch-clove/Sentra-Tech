# Cloudflare Workers Deployment Guide

This guide walks you through deploying the Sentra chatbot backend to Cloudflare Workers.

## Prerequisites

1. **Cloudflare Account**: Sign up at https://dash.cloudflare.com
2. **Node.js**: Installed on your local machine
3. **OpenRouter API Key**: Get it from https://openrouter.ai/keys
4. **Wrangler CLI**: Cloudflare's command-line tool

## Step-by-Step Deployment

### 1. Install Wrangler CLI

```bash
npm install -g @cloudflare/wrangler
```

Verify installation:
```bash
wrangler version
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate. Once authenticated, Wrangler will save your credentials locally.

### 3. Configure Your Worker

Edit `wrangler.toml` in your project root:

```toml
name = "sentra-chatbot-worker"
type = "javascript"
account_id = "your_account_id_here"
workers_dev = true

[env.production]
name = "sentra-chatbot-worker-prod"
route = "api.yourdomainhere.com/*"
zone_id = "your_zone_id_here"
```

**To find your Account ID and Zone ID:**
1. Go to https://dash.cloudflare.com
2. Select your account
3. Account ID is displayed in the URL bar or under Overview
4. If using a custom domain, Zone ID is in the DNS settings

### 4. Set Environment Variables

Create a `.env` file with your OpenRouter API key:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

To set the secret in Cloudflare:

```bash
wrangler secret put OPENROUTER_API_KEY
```

This will prompt you to enter your API key securely.

### 5. Deploy to Cloudflare Workers

Deploy using:

```bash
wrangler deploy
```

Or use a specific environment:

```bash
wrangler deploy --env production
```

The output will show your worker URL, e.g.:
```
✓ Uploaded sentra-chatbot-worker (X.XXs)
✓ Published sentra-chatbot-worker@XXXXX
  https://sentra-chatbot-worker.your-subdomain.workers.dev
```

### 6. Verify Deployment

Test your worker with a curl command:

```bash
curl -X POST https://sentra-chatbot-worker.your-subdomain.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what are Sentras products?"}'
```

### 7. Update Your Frontend

Update `js/chatbot.js` with your actual worker URL:

```javascript
const PRODUCTION_BACKEND_URL = 'https://sentra-chatbot-worker.your-subdomain.workers.dev/api/chat';
```

Or set it dynamically based on your domain:

```javascript
const getAPIEndpoint = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '/api/chat'; // For local development
  }
  
  // Production Cloudflare Worker
  return 'https://sentra-chatbot-worker.your-subdomain.workers.dev/api/chat';
};
```

## Using a Custom Domain

### Option 1: Cloudflare Managed Domain

If your domain is on Cloudflare:

1. Go to https://dash.cloudflare.com
2. Select your domain
3. Go to Workers > Routes
4. Create a route: `api.yourdomain.com/*` → `sentra-chatbot-worker`
5. Update wrangler.toml with zone_id
6. Redeploy: `wrangler deploy`

### Option 2: External Domain

If your domain is NOT on Cloudflare, you can still use Workers:

1. Create a custom subdomain on Cloudflare
2. Point your domain's DNS to Cloudflare nameservers
3. Set up the worker route as above

## Monitoring & Logs

### View Live Logs

```bash
wrangler tail
```

### View Deployment History

```bash
wrangler rollback
```

## Environment-Specific Configuration

The wrangler.toml includes development and production environments:

**Deploy to development:**
```bash
wrangler deploy --env development
```

**Deploy to production:**
```bash
wrangler deploy --env production
```

## Scaling & Pricing

- **Free Tier**: 100,000 requests/day
- **Paid Tier**: $0.50 per 10 million requests/month

Cloudflare Workers automatically scales based on traffic. No server management needed!

## Troubleshooting

### 401 Unauthorized Error
- Check your OPENROUTER_API_KEY is correctly set
- Verify: `wrangler secret list`

### 429 Rate Limited
- OpenRouter might be rate limiting. The worker includes retry logic.
- Check your OpenRouter quota at https://openrouter.ai/keys

### CORS Errors
- The worker includes proper CORS headers for all origins
- If issues persist, check browser console for specific errors

### Worker Not Found
- Verify deployment completed: `wrangler deployments list`
- Check worker is published in Cloudflare dashboard

## Advanced: Using Cloudflare KV for Storage

For persistent user profiles or chat history, use Cloudflare KV:

1. Create a KV namespace:
```bash
wrangler kv:namespace create "SENTRA_DATA"
```

2. Bind it in wrangler.toml:
```toml
[[kv_namespaces]]
binding = "SENTRA_DATA"
id = "your_namespace_id"
```

3. Use in worker:
```javascript
// Save data
await env.SENTRA_DATA.put('user:123', JSON.stringify(userData));

// Get data
const data = await env.SENTRA_DATA.get('user:123');
```

## Next Steps

1. ✅ Deploy to Cloudflare Workers
2. ✅ Test all API endpoints
3. ✅ Update frontend with worker URL
4. ✅ Monitor logs for errors
5. 📊 Consider adding analytics/KV storage for user data
6. 🔒 Add authentication if needed for admin endpoints

## Support

For issues:
- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- OpenRouter API Docs: https://openrouter.ai/docs
- File an issue in your repository

---

**Enjoy your serverless chatbot! 🚀**
