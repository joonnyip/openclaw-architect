# 🦞 OpenClaw Architect

> A visual architecture explorer and documentation toolkit for the [OpenClaw](https://github.com/openclaw/openclaw) personal AI assistant platform.

## What Is This?

This repo is an **architecture reference and visualization tool** for OpenClaw — the open-source, self-hosted personal AI agent that connects to WhatsApp, Telegram, Slack, Discord, iMessage, and 20+ other channels.

Use it to:
- Understand how OpenClaw's hub-and-spoke Gateway works
- Visualize the multi-agent routing, session model, and tool layer
- Reference channel adapters, plugin structure, and skill configs
- Onboard teammates or contributors faster

---

## Architecture Overview

```
Channels (WhatsApp / Telegram / Slack / Discord / iMessage / ...)
                          │
                          ▼
          ┌───────────────────────────────┐
          │       Gateway (Daemon)        │
          │    ws://127.0.0.1:18789       │
          │  Sessions · Auth · Routing    │
          └──────────────┬────────────────┘
                         │
        ┌────────────────┼─────────────────┐
        ▼                ▼                 ▼
   Pi Agent         Live Canvas        CLI / WebChat
   Runtime          (A2UI)             Control UI
        │
   ┌────┴──────┐
   │  Tools    │
   │ Browser   │
   │ Files     │
   │ Cron      │
   │ Skills    │
   └───────────┘
```

The **Gateway** is the always-on control plane — a WebSocket server managing sessions, routing messages, dispatching tools, and handling state. It never touches the LLM directly. That separation is the core architectural principle.

---

## Repo Structure

```
openclaw-architect/
├── README.md                  ← You are here
├── docs/
│   ├── architecture.md        ← Deep-dive: Gateway, sessions, agents
│   ├── channels.md            ← All supported channel adapters
│   ├── tools.md               ← Tool layer: browser, canvas, cron, etc.
│   ├── security.md            ← Security model and hardening guide
│   └── skills.md              ← Skills platform and plugin system
├── packages/
│   ├── core/                  ← Gateway core types and schemas
│   ├── channels/              ← Per-channel adapter stubs
│   └── plugins/               ← Plugin/skill interface definitions
├── src/
│   ├── gateway/               ← Gateway bootstrap and WS server
│   ├── agents/                ← Pi agent runtime (RPC)
│   ├── tools/                 ← Tool execution layer
│   └── canvas/                ← A2UI canvas integration
├── examples/
│   ├── basic-agent/           ← Minimal working agent config
│   ├── multi-channel/         ← WhatsApp + Telegram dual setup
│   └── skill-template/        ← Custom skill boilerplate
└── scripts/
    ├── setup.sh               ← Dev environment bootstrap
    └── doctor.sh              ← Config validation script
```

---

## Getting Started

### Prerequisites

- Node.js 24 (recommended) or Node 22.16+
- An OpenClaw installation: `npx openclaw onboard`

### Clone & Install

```bash
git clone https://github.com/joonnyip/openclaw-architect.git
cd openclaw-architect
npm install
```

### Run the Architecture Viewer

```bash
npm run dev
# Opens interactive diagram at http://localhost:3000
```

---

## Key Concepts

| Concept | Description |
|---|---|
| **Gateway** | WebSocket daemon — control plane for all sessions and routing |
| **Pi Agent** | LLM-powered agent runtime, communicates via RPC |
| **Channels** | Adapters for WhatsApp, Telegram, Slack, Discord, iMessage, etc. |
| **Skills** | Bundled/managed/workspace plugins that extend agent capabilities |
| **Canvas** | Agent-driven visual workspace rendered via A2UI |
| **Tools** | Browser, file, cron, nodes — what turns conversation into action |
| **Sessions** | `main` for direct chats, group isolation, activation + queue modes |

---

## Security Notes

⚠️ **OpenClaw is powerful — and that cuts both ways.**

- Run `openclaw doctor` to check for misconfigurations
- The Gateway binds to `ws://127.0.0.1:18789` by default — **do not expose this to 0.0.0.0**
- Audit skills before installing from ClawHub
- Use Tailscale or SSH tunnels for remote access — never raw port forwarding

See [`docs/security.md`](./docs/security.md) for the full hardening guide.

---

## Attribution

Built on top of the [OpenClaw](https://github.com/openclaw/openclaw) open-source project (MIT License).  
Architecture diagrams and documentation by **Joon Nyip Koh**.

---

*The lobster way. 🦞*
