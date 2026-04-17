# OpenClaw Basic Agent Example

This is a minimal working agent configuration — the simplest way to get an OpenClaw agent running with one channel.

## Files

- `config.yaml` — Gateway configuration
- `SOUL.md` — Agent personality and instructions
- `AGENTS.md` — Tool permissions

---

## config.yaml

```yaml
gateway:
  host: 127.0.0.1
  port: 18789
  auth:
    enabled: true
    token: "${OPENCLAW_TOKEN}"  # Set in .env

channels:
  telegram:
    enabled: true
    credentials:
      token: "${TELEGRAM_BOT_TOKEN}"
    workspace: default
    activation: always-on

workspaces:
  default:
    name: default
    model: claude-sonnet-4-20250514
    soul: ./SOUL.md
    agents: ./AGENTS.md
```

---

## SOUL.md

```markdown
You are a helpful personal assistant named Claw.

You are concise, friendly, and action-oriented. When asked to do something,
you do it — you don't ask unnecessary clarifying questions.

You have access to the following tools:
- Web search and browsing
- Reading and writing files in ~/Documents/agent
- Scheduled reminders via cron
- Canvas for visual output

When you're not sure about something, say so clearly rather than guessing.
```

---

## AGENTS.md

```markdown
# Tool Permissions

## Browser
- Mode: read-only (snapshots only, no actions)
- Profiles: default only

## Files
- Read: ~/Documents, ~/Downloads
- Write: ~/Documents/agent-output
- Search: ~/Documents

## Shell
- DISABLED

## Cron
- Enabled
- Max jobs: 10

## Canvas
- Enabled

## Nodes
- Camera: DISABLED
- Screen: DISABLED
- Location: DISABLED
- Notifications: enabled
```

---

## Running This Example

```bash
# 1. Copy this example
cp -r examples/basic-agent ~/my-openclaw-agent
cd ~/my-openclaw-agent

# 2. Set your tokens
echo "OPENCLAW_TOKEN=$(openssl rand -hex 32)" >> .env
echo "TELEGRAM_BOT_TOKEN=your_bot_token_here" >> .env

# 3. Start the gateway
openclaw start --config ./config.yaml

# 4. Verify it's running
openclaw doctor
```

---

## Next Steps

- See `examples/multi-channel/` for WhatsApp + Telegram dual setup
- See `examples/skill-template/` to write your first custom skill
- See `docs/architecture.md` for the full architectural deep-dive
