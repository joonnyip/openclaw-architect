# OpenClaw Tool Layer

## Overview

Tools are what transform OpenClaw from a chat interface into an agent that acts. The tool layer sits between the Pi agent runtime and the outside world.

---

## Core Tools

### Browser

Full Chrome/Chromium control via a dedicated OpenClaw browser instance.

```typescript
// Snapshot — read-only view of a page
const snapshot = await tools.browser.snapshot({ url: "https://example.com" });

// Action — click, type, scroll
await tools.browser.action({ type: "click", selector: "#submit-button" });

// Upload — attach a file to a file input
await tools.browser.upload({ selector: "#file-input", path: "/tmp/doc.pdf" });

// Profile — switch browser profiles
await tools.browser.profile({ name: "work" });
```

**Permissions required:** `browser:control` or `browser:read`

---

### Canvas (A2UI)

Agent-driven visual workspace. The agent pushes UI components; they render in macOS app or WebChat.

```typescript
// Push a component
await tools.canvas.push({
  type: "table",
  data: rows,
  title: "Results",
});

// Reset canvas
await tools.canvas.reset();

// Evaluate JavaScript in canvas context
await tools.canvas.eval("document.title = 'Updated'");

// Capture snapshot
const snap = await tools.canvas.snapshot();
```

**Permissions required:** `canvas:push`

---

### Nodes

Physical world integration via companion apps (macOS, iOS, Android).

```typescript
// Camera snapshot
const photo = await tools.nodes.camera.snap();

// Screen recording (5 seconds)
const clip = await tools.nodes.screen.record({ duration: 5 });

// Get device location
const loc = await tools.nodes.location.get();

// Send notification
await tools.nodes.notify({ title: "Done", body: "Task complete" });
```

**Permissions required:** Companion app installed + node connected

---

### Cron

Schedule recurring tasks and one-time wakeups.

```typescript
// Schedule recurring task
await tools.cron.schedule({
  name: "daily-brief",
  expression: "0 8 * * *",   // Every day at 8am
  action: "summarize-inbox",
});

// One-time wakeup
await tools.cron.wakeup({
  in: "30 minutes",
  message: "Remind me about the meeting",
});

// List scheduled jobs
const jobs = await tools.cron.list();
```

---

### Sessions

Session management and context injection.

```typescript
// Get current session info
const session = await tools.sessions.current();

// Inject context into session
await tools.sessions.inject({
  role: "system",
  content: "The user prefers concise responses",
});

// Switch workspace
await tools.sessions.workspace({ name: "work" });
```

---

### Files

Filesystem access (scoped to allowed directories).

```typescript
// Read a file
const content = await tools.files.read({ path: "~/Documents/notes.md" });

// Write a file
await tools.files.write({ path: "~/Documents/output.txt", content: "..." });

// List directory
const files = await tools.files.list({ path: "~/Downloads" });

// Search files
const results = await tools.files.search({ query: "invoice", path: "~/Documents" });
```

**Permissions required:** `files:read` and/or `files:write`

---

### Shell

Execute shell commands. **High risk — disable unless needed.**

```typescript
// Run a command
const result = await tools.shell.exec({ command: "ls -la ~/Documents" });

// Run with timeout
const result = await tools.shell.exec({
  command: "npm test",
  cwd: "~/projects/myapp",
  timeout: 30000,
});
```

**Permissions required:** `shell:exec` — explicitly enabled in `AGENTS.md`

---

## Gmail / Webhook Tools

```typescript
// Gmail via Pub/Sub integration
await tools.gmail.send({ to: "user@example.com", subject: "Hello", body: "..." });
const emails = await tools.gmail.fetch({ query: "is:unread", limit: 10 });

// Webhooks — inbound triggers
// Configure in config.yaml → channels.webhooks
```

---

## Discord & Slack Actions

Beyond just reading/sending messages, the agent can take rich actions:

**Discord:** create channels, manage roles, pin messages, react with emoji, create threads

**Slack:** create channels, invite users, set status, add reactions, create reminders

---

## Tool Configuration in AGENTS.md

```markdown
# AGENTS.md — Tool Permissions

## Enabled Tools
- browser: read-only (no actions, no uploads)
- canvas: full access
- cron: enabled
- files:
  - read: ~/Documents, ~/Downloads
  - write: ~/Documents/agent-output
- shell: DISABLED
- nodes: camera (disabled), screen (disabled), location (enabled), notify (enabled)

## Disabled Tools
- shell (too risky for this workspace)
- gmail (not needed)
```
