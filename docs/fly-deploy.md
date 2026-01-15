## Fly.io deployment

### 1) Install flyctl
https://fly.io/docs/flyctl/install/

### 2) Configure secrets
Copy `config/fly.env.example` to `config/fly.env`, then fill values.

Required keys:
- `FLY_APP_NAME`
- `FLY_REGION`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DISCORD_BOT_TOKEN`
- `DISCORD_PUBLIC_KEY`
- `DISCORD_GUILD_ID`
- `DISCORD_CHANNEL_ID`
- `DISCORD_INNER_CIRCLE_ROLE_ID`

### 3) Deploy
Run:
```
bash scripts/fly-deploy.sh
```

If `fly.toml` does not exist, the script will create it with `flyctl launch`.

### 4) Discord interaction endpoint
Set the Interaction Endpoint URL in Discord Developer Portal to:
```
https://<your-app-domain>/api/discord/interactions
```

