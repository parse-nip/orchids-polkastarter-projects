#!/usr/bin/env bash
set -euo pipefail

if ! command -v flyctl >/dev/null 2>&1; then
  echo "flyctl is not installed. Install from https://fly.io/docs/flyctl/install/"
  exit 1
fi

if [ ! -f "config/fly.env" ]; then
  echo "Missing config/fly.env. Copy config/fly.env.example to config/fly.env and fill values."
  exit 1
fi

set -a
source config/fly.env
set +a

# Auto-generate app name if not provided
if [ -z "${FLY_APP_NAME:-}" ]; then
  FLY_APP_NAME="orchids-polkastarter-$(openssl rand -hex 4)"
  echo "Auto-generated app name: $FLY_APP_NAME"
fi

# Default region if not provided
FLY_REGION="${FLY_REGION:-iad}"

# Check if app exists
if ! flyctl apps list | grep -q "^$FLY_APP_NAME$"; then
  echo "Creating new Fly.io app: $FLY_APP_NAME in region $FLY_REGION"
  flyctl apps create "$FLY_APP_NAME" --org personal || true
fi

# Create fly.toml if it doesn't exist
if [ ! -f "fly.toml" ]; then
  echo "Creating fly.toml..."
  flyctl launch --name "$FLY_APP_NAME" --region "$FLY_REGION" --no-deploy --copy-config
fi

# Import secrets (skip FLY_APP_NAME and FLY_REGION)
echo "Setting secrets..."
grep -v '^[[:space:]]*#' config/fly.env | grep -v '^[[:space:]]*$' | grep -v '^FLY_APP_NAME=' | grep -v '^FLY_REGION=' | flyctl secrets import -a "$FLY_APP_NAME"

echo "Deploying to Fly.io..."
flyctl deploy -a "$FLY_APP_NAME"

echo ""
echo "✅ Deployment complete!"
echo "Your app URL: https://$FLY_APP_NAME.fly.dev"
echo ""
echo "⚠️  Don't forget to set Discord Interaction Endpoint URL to:"
echo "https://$FLY_APP_NAME.fly.dev/api/discord/interactions"

