# OpenClaw Skills Platform

## Overview

Skills extend your agent's capabilities beyond the built-in tools. They're the plugin system for OpenClaw — ranging from simple utility functions to full integrations with external services.

---

## Types of Skills

| Type | Location | Who manages it |
|---|---|---|
| **Bundled** | Ships with OpenClaw | Core team |
| **Managed** | Installed from ClawHub | You, via `openclaw skills install` |
| **Workspace** | Local to your workspace | You, written yourself |

---

## Installing Skills

```bash
# Browse available skills
openclaw skills list

# Install a skill from ClawHub
openclaw skills install @community/skill-name

# Install a specific version
openclaw skills install @community/skill-name@1.2.0

# List installed skills
openclaw skills installed

# Remove a skill
openclaw skills remove @community/skill-name
```

---

## Writing a Workspace Skill

See `examples/skill-template/` for a working boilerplate.

### Minimal Skill Structure

```
my-skill/
├── skill.json          ← Manifest
├── index.ts            ← Entry point
├── TOOLS.md            ← Tool definitions for the agent
└── README.md
```

### skill.json

```json
{
  "name": "@workspace/my-skill",
  "version": "1.0.0",
  "description": "What this skill does",
  "permissions": ["files:read", "network:fetch"],
  "tools": ["my_tool_name"],
  "author": "Your Name"
}
```

### index.ts

```typescript
import { SkillContext, ToolResult } from "@openclaw/sdk";

export async function my_tool_name(
  ctx: SkillContext,
  params: { input: string }
): Promise<ToolResult> {
  // Your implementation here
  return {
    success: true,
    output: `Processed: ${params.input}`,
  };
}
```

### TOOLS.md

```markdown
## my_tool_name

Does something useful with the provided input.

Parameters:
- input (string, required): The thing to process

Example:
"Process this text for me" → calls my_tool_name({ input: "this text" })
```

---

## Skill Permissions

Skills must declare the permissions they need in `skill.json`. The Gateway enforces these at runtime.

| Permission | What it grants |
|---|---|
| `files:read` | Read files from scoped directories |
| `files:write` | Write files to scoped directories |
| `network:fetch` | Make outbound HTTP requests |
| `shell:exec` | Execute shell commands (high risk) |
| `browser:control` | Full browser automation |
| `browser:read` | Read-only browser snapshots |
| `canvas:push` | Push components to Canvas |
| `sessions:read` | Read session metadata |

---

## Skill Execution Model

Skills run **in-process** within the Gateway — they are not sandboxed in separate processes. This means:

- Fast execution (no IPC overhead)
- Access control is policy-based, not OS-level
- A malicious skill has significant access

**Always review skill source before installing.**

---

## Bundled Skills (Examples)

| Skill | What it does |
|---|---|
| `@bundled/summarize` | Summarizes long content |
| `@bundled/remind` | Sets reminders via cron |
| `@bundled/search` | Web search integration |
| `@bundled/calendar` | Calendar read/write |
| `@bundled/notes` | Note-taking and retrieval |
| `@bundled/weather` | Weather lookups |

---

## Lobster Shell Integration

[Lobster](https://github.com/openclaw/lobster) is the OpenClaw-native workflow shell — a typed, local-first macro engine that turns skills and tools into composable pipelines.

```bash
# Install Lobster
openclaw skills install @bundled/lobster

# Define a workflow
lobster workflow create daily-brief \
  --steps "weather, calendar, news-summary" \
  --trigger "every day at 8am"

# The agent can now call this workflow in one step
```
