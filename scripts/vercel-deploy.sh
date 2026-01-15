#!/usr/bin/env bash
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI is not installed. Install with: npm i -g vercel"
  exit 1
fi

if [ ! -f "config/fly.env" ]; then
  echo "Missing config/fly.env. Copy config/fly.env.example to config/fly.env and fill values."
  exit 1
fi

set -a
source config/fly.env
set +a

echo "Setting Vercel environment variables..."

# Set all secrets from fly.env (skip FLY_APP_NAME and FLY_REGION)
while IFS='=' read -r key value; do
  # Skip empty lines, comments, and Fly-specific vars
  [[ -z "$key" || "$key" =~ ^#.*$ || "$key" == "FLY_APP_NAME" || "$key" == "FLY_REGION" ]] && continue
  
  # Remove quotes if present
  value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//')
  
  if [ -n "$value" ]; then
    echo "Setting $key..."
    vercel env add "$key" production <<< "$value" 2>/dev/null || vercel env rm "$key" production --yes 2>/dev/null && vercel env add "$key" production <<< "$value"
  fi
done < config/fly.env

echo ""
echo "Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  Don't forget to set Discord Interaction Endpoint URL to:"
echo "https://<your-vercel-domain>/api/discord/interactions"
echo ""
echo "You can find your domain in the Vercel dashboard or run: vercel ls"

