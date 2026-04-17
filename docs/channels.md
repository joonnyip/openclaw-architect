# OpenClaw Channel Adapters

## Overview

OpenClaw supports 20+ messaging platforms via channel adapters. Each adapter handles platform-specific authentication, message parsing, media handling, and group routing — so the Gateway sees a unified message format regardless of source.

---

## Supported Channels

### Tier 1 — Core Channels (Most Stable)

| Channel | Adapter Library | Notes |
|---|---|---|
| WhatsApp | Baileys | No official API — uses WhatsApp Web protocol |
| Telegram | grammY | Official Bot API |
| Slack | Bolt | Official Slack SDK |
| Discord | discord.js | Official Discord API |
| iMessage (BlueBubbles) | BlueBubbles REST | Recommended iMessage method |
| iMessage (legacy) | imsg | macOS only — direct AppleScript bridge |
| Google Chat | Chat API | Requires Google Workspace |
| Microsoft Teams | Teams API | App registration required |
| Signal | signal-cli | Java CLI wrapper |
| WebChat | Built-in | Served directly from Gateway |

### Tier 2 — Extended Channels

| Channel | Notes |
|---|---|
| Matrix | Federation-ready |
| IRC | Classic protocol support |
| Feishu / Lark | Bytedance enterprise |
| LINE | Popular in Asia |
| Mattermost | Self-hosted Slack alternative |
| Nextcloud Talk | Open-source collaboration |
| Nostr | Decentralized protocol |
| Synology Chat | NAS-hosted |
| Tlon | Urbit-based |
| Twitch | Streaming chat |
| Zalo | Vietnamese market |
| Zalo Personal | Personal Zalo accounts |
| WeChat | Via `@tencent-weixin/openclaw-weixin` plugin |
| QQ | Via plugin |

---

## Installing a Channel

```bash
# List available channels
openclaw channels list

# Add a channel (guided setup)
openclaw channels add --channel telegram

# Login / authenticate
openclaw channels login --channel telegram

# Check channel status
openclaw channels status
```

---

## Channel Configuration

Each channel has its own config block in `config.yaml`:

```yaml
channels:
  telegram:
    enabled: true
    token: "YOUR_BOT_TOKEN"
    workspace: default
    activation: mention-gated
    
  whatsapp:
    enabled: true
    workspace: personal
    activation: always-on
    group_mode: mention-gated
    
  slack:
    enabled: true
    token: "xoxb-..."
    workspace: work
    activation: mention-gated
```

---

## Group Routing

For group chats, OpenClaw supports:

- **Mention gating** — only responds when `@botname` is used
- **Reply tags** — responds when replying to the bot's messages
- **Per-channel chunking** — respects platform-specific message length limits
- **Isolated sessions** — each group gets its own session context

---

## Media Pipeline

All channels feed through a unified media pipeline:

```
Raw media (image/audio/video)
        │
        ▼
   Media Processor
   ├── Image → base64 + description prompt
   ├── Audio → transcription (Whisper)
   └── Video → frame extraction + transcription
        │
        ▼
   Agent context injection
```

**Size caps** and temp file lifecycle are managed per-channel.

---

## macOS App & Companion Apps

- **macOS menu bar app** — control plane, Voice Wake/PTT, Talk Mode overlay, WebChat, debug tools
- **iOS/Android nodes** — remote camera, screen, location, notifications
- **Windows node** — System Tray app, PowerToys Command Palette extension

---

## Voice Channels

**Voice Wake + Talk Mode:**
- macOS/iOS: Wake word detection (always-on listening)
- Android: Continuous voice with wake word
- TTS: ElevenLabs (primary) → system TTS (fallback)
- STT: Whisper-based transcription

---

## Adding a Custom Channel

See `packages/channels/` for the adapter interface:

```typescript
interface ChannelAdapter {
  name: string;
  connect(config: ChannelConfig): Promise<void>;
  disconnect(): Promise<void>;
  onMessage(handler: MessageHandler): void;
  send(message: OutboundMessage): Promise<void>;
  sendMedia(media: MediaMessage): Promise<void>;
}
```
