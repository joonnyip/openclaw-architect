#!/usr/bin/env bash
# OpenClaw Architect — Dev Environment Setup
set -e

echo "🦞 OpenClaw Architect Setup"
echo "==========================="

# Check Node version
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
if [[ "$NODE_VERSION" == "not found" ]]; then
  echo "❌ Node.js not found. Please install Node 24: https://nodejs.org"
  exit 1
fi

MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')
if [ "$MAJOR" -lt 22 ]; then
  echo "❌ Node.js $NODE_VERSION is too old. OpenClaw requires Node 22.16+ (Node 24 recommended)"
  exit 1
fi

echo "✅ Node.js $NODE_VERSION"

# Check if openclaw is installed
if ! command -v openclaw &> /dev/null; then
  echo ""
  echo "ℹ️  OpenClaw CLI not found."
  echo "   To install: npx openclaw onboard"
  echo "   (This sets up the Gateway daemon and walks you through channel config)"
  echo ""
else
  echo "✅ OpenClaw CLI found: $(openclaw --version 2>/dev/null || echo 'version unknown')"
fi

# Install npm dependencies if package.json exists
if [ -f "package.json" ]; then
  echo ""
  echo "📦 Installing dependencies..."
  npm install
  echo "✅ Dependencies installed"
fi

# Check for .env file
if [ ! -f ".env" ]; then
  echo ""
  echo "📝 Creating .env from template..."
  cat > .env << 'EOF'
# OpenClaw Architect Environment Variables

# Gateway auth token (generate with: openssl rand -hex 32)
OPENCLAW_TOKEN=

# Channel tokens (add the ones you need)
TELEGRAM_BOT_TOKEN=
SLACK_BOT_TOKEN=
DISCORD_BOT_TOKEN=
EOF
  echo "✅ .env created — fill in your tokens before starting"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Fill in your tokens in .env"
echo "  2. Run: npm run dev"
echo "  3. Or start directly: openclaw start --config examples/basic-agent/config.yaml"
echo ""
echo "Run 'openclaw doctor' at any time to check your config."
