# OpenClaw Architecture Deep-Dive

## Overview

OpenClaw follows a **hub-and-spoke architecture** with the Gateway at the center. There are three distinct layers:

1. **Channel Layer** — inbound adapters for every messaging platform
2. **Gateway Layer** — the control plane: sessions, routing, auth, state
3. **Agent + Tool Layer** — the Pi runtime, tool execution, canvas, skills

---

## The Gateway

The Gateway is a **WebSocket server** that acts as the single control plane between all inputs (channels, CLI, WebChat, macOS app) and the agent runtime.

```
ws://127.0.0.1:18789
```

**What the Gateway does:**
- Accepts inbound connections from channel adapters
- Authenticates and sessions every connection
- Routes messages to the correct agent workspace
- Dispatches tool calls and collects results
- Manages presence, typing indicators, and streaming
- Hosts the WebChat UI and Control UI
- Runs cron jobs and handles webhooks

**What the Gateway does NOT do:**
- It never calls the LLM directly
- It never stores conversation history itself — agents do
- It does not parse channel-specific message formats — adapters do

This separation between orchestration and intelligence is the foundational architectural principle.

---

## Sessions

OpenClaw's session model has three modes:

| Mode | Description |
|---|---|
| `main` | Default direct message session — one per channel account |
| `group` | Isolated sessions per group chat — mention gating applies |
| `workspace` | Named agent workspaces — for multi-agent routing |

### Activation Modes

- **Always-on**: Agent responds to every message
- **Mention-gated**: Agent only activates when `@mentioned`
- **Keyword-gated**: Trigger phrase required

### Queue Modes

- **Serial**: One message processed at a time
- **Parallel**: Concurrent tool calls allowed
- **Priority**: Urgent messages jump the queue

---

## Pi Agent Runtime

The Pi agent is the LLM-powered reasoning engine. It communicates with the Gateway via **RPC** (not direct WebSocket). This keeps the intelligence layer decoupled from the transport layer.

```
Gateway ──RPC──▶ Pi Agent ──▶ LLM (Claude / GPT-4o / Gemini / Ollama)
                    │
                    ▼
               Tool Executor
```

**Model-agnostic:** OpenClaw works with Claude, GPT-4o, Gemini, and locally-hosted models via Ollama. You pick the model. OpenClaw handles routing.

### The Seven-Stage Agentic Loop

1. **Receive** — Gateway delivers message to agent session
2. **Context** — Agent assembles conversation history + system prompt
3. **Reason** — LLM generates response or tool call
4. **Dispatch** — Tool executor runs the requested tool
5. **Observe** — Result returned to agent context
6. **Iterate** — Agent loops until no more tool calls pending
7. **Respond** — Final message streamed back through Gateway to channel

---

## Multi-Agent Routing

OpenClaw supports routing different channels and accounts to different isolated agent workspaces.

```
WhatsApp (personal)  ──▶  Workspace A  (Claude Sonnet, personal assistant)
Slack (work)         ──▶  Workspace B  (GPT-4o, work assistant)
Telegram (dev)       ──▶  Workspace C  (local Ollama, code helper)
```

Each workspace has:
- Its own `SOUL.md` (personality + instructions)
- Its own `AGENTS.md` (tool permissions and config)
- Its own `TOOLS.md` (available tool definitions)
- Isolated session history

---

## Tool Layer

Tools are what turn conversation into action. The tool executor runs inside the agent process with sandboxing controlled via `AGENTS.md` configuration.

### Core Tools

| Tool | Capability |
|---|---|
| `browser` | Full Chrome/Chromium control — snapshots, actions, uploads |
| `canvas` | A2UI push/reset, eval, snapshot |
| `nodes` | Camera, screen record, location, notifications |
| `cron` | Scheduled tasks and wakeups |
| `sessions` | Session management and context injection |
| `files` | Read/write filesystem access (scoped) |
| `shell` | Execute shell commands (requires explicit permission) |

---

## Live Canvas (A2UI)

The Canvas is an agent-driven visual workspace. The agent can push arbitrary UI components to the Canvas, which renders in the macOS app or WebChat.

**A2UI** = Agent-to-UI — the protocol by which the agent drives the canvas.

Operations:
- `canvas.push(component)` — render a component
- `canvas.reset()` — clear the canvas
- `canvas.eval(code)` — run JavaScript in the canvas context
- `canvas.snapshot()` — capture current state

---

## Security Architecture

See [`security.md`](./security.md) for the full hardening guide.

**Key principles:**
- Gateway binds to `127.0.0.1` by default — local only
- All tool access is gated by `AGENTS.md` policy
- `openclaw doctor` surfaces misconfigurations
- Audit log: all agent actions are logged and traceable
- Skills run in-process — verify ClawHub skills before installing

---

## Configuration Files

| File | Purpose |
|---|---|
| `SOUL.md` | Agent personality, instructions, and system prompt |
| `AGENTS.md` | Tool permissions, model selection, routing rules |
| `TOOLS.md` | Tool definitions available to the agent |
| `config.yaml` | Gateway config: ports, auth, channel bindings |
