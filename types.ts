#!/usr/bin/env bash
# OpenClaw Architect — Config Validation (doctor.sh)
# Mirrors what `openclaw doctor` checks, as a standalone script

set -e

PASS=0
WARN=0
FAIL=0

pass() { echo "  ✅ $1"; ((PASS++)) || true; }
warn() { echo "  ⚠️  $1"; ((WARN++)) || true; }
fail() { echo "  ❌ $1"; ((FAIL++)) || true; }

echo ""
echo "🦞 OpenClaw Architect — Doctor"
echo "=============================="
echo ""

# ── Gateway Config ──────────────────────────────────────────────────────────

echo "Gateway:"

# Check .env exists
if [ -f ".env" ]; then
  source .env 2>/dev/null || true
  pass ".env file found"
else
  warn ".env file not found — using environment variables only"
fi

# Check auth token
if [ -n "$OPENCLAW_TOKEN" ] && [ ${#OPENCLAW_TOKEN} -ge 32 ]; then
  pass "Auth token set (${#OPENCLAW_TOKEN} chars)"
elif [ -n "$OPENCLAW_TOKEN" ]; then
  warn "Auth token set but short — use at least 32 chars (openssl rand -hex 32)"
else
  fail "Auth token not set — set OPENCLAW_TOKEN in .env"
fi

echo ""

# ── Channel Tokens ──────────────────────────────────────────────────────────

echo "Channels:"

channels_configured=0

if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  pass "Telegram token set"
  ((channels_configured++)) || true
fi

if [ -n "$SLACK_BOT_TOKEN" ]; then
  pass "Slack token set"
  ((channels_configured++)) || true
fi

if [ -n "$DISCORD_BOT_TOKEN" ]; then
  pass "Discord token set"
  ((channels_configured++)) || true
fi

if [ "$channels_configured" -eq 0 ]; then
  warn "No channel tokens configured — set at least one in .env"
fi

echo ""

# ── OpenClaw CLI ────────────────────────────────────────────────────────────

echo "OpenClaw CLI:"

if command -v openclaw &> /dev/null; then
  pass "openclaw CLI found"
  
  # Run the real openclaw doctor if available
  echo ""
  echo "Running openclaw doctor..."
  echo "─────────────────────────"
  openclaw doctor 2>/dev/null || warn "openclaw doctor failed — Gateway may not be running"
else
  warn "openclaw CLI not found — run 'npx openclaw onboard' to install"
fi

echo ""

# ── Summary ─────────────────────────────────────────────────────────────────

echo "─────────────────────────"
echo "Results: ✅ $PASS passed  ⚠️  $WARN warnings  ❌ $FAIL failed"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "❌ Fix the failed checks before going live."
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo "⚠️  Review the warnings above before exposing to the network."
  exit 0
else
  echo "🎉 All checks passed!"
  exit 0
fi
