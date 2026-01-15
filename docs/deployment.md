# Deployment Guide

This project can be deployed to either **Vercel** (recommended for Next.js) or **Fly.io**.

## Quick Comparison

| Feature | Vercel | Fly.io |
|---------|--------|--------|
| Setup | ✅ Easiest | ⚠️ Requires Docker |
| Next.js | ✅ Optimized | ✅ Works |
| Free Tier | ✅ Generous | ✅ Available |
| Cron Jobs | ✅ Built-in | ⚠️ Need setup |

## Option 1: Vercel (Recommended)

### Prerequisites
```bash
npm i -g vercel
```

### Deploy
1. Fill in `config/fly.env` with your values
2. Run:
```bash
bash scripts/vercel-deploy.sh
```
3. First time? Login with `vercel login`

The script will:
- Set all environment variables
- Deploy to production
- Show you the deployment URL

### Discord Interaction Endpoint
After deployment, set in Discord Developer Portal:
```
https://<your-vercel-domain>/api/discord/interactions
```

---

## Option 2: Fly.io

### Prerequisites
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh
```

### Deploy
1. Fill in `config/fly.env` (app name auto-generated if empty)
2. Run:
```bash
bash scripts/fly-deploy.sh
```

The script will:
- Auto-create app if it doesn't exist
- Set all secrets
- Deploy to Fly.io

### Discord Interaction Endpoint
After deployment, set in Discord Developer Portal:
```
https://<your-app-name>.fly.dev/api/discord/interactions
```

---

## Environment Variables

Both scripts use `config/fly.env`. Required variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `DISCORD_BOT_TOKEN` - Discord bot token
- `DISCORD_PUBLIC_KEY` - Discord bot public key
- `DISCORD_GUILD_ID` - Discord server ID
- `DISCORD_CHANNEL_ID` - Channel for approval messages
- `DISCORD_INNER_CIRCLE_ROLE_ID` - Role ID for auto-approval

**Note:** `config/fly.env` is gitignored - never commit it!

