# OpenClaw Security Guide

## ⚠️ Read This First

OpenClaw can execute shell commands, modify files, control browsers, send emails, and manage your messaging accounts. This is powerful — and carries real risk if misconfigured.

> "If you cannot understand how to run a command line, this is too dangerous for you to use safely." — OpenClaw docs

Run `openclaw doctor` before going live. It surfaces the most common misconfigurations automatically.

---

## Gateway Binding

**Default (safe):**
```yaml
gateway:
  host: 127.0.0.1   # Local only ✅
  port: 18789
```

**Dangerous — do not do this:**
```yaml
gateway:
  host: 0.0.0.0     # Exposes to your entire network ❌
```

A Bitdefender audit found ~135,000 OpenClaw instances exposed on the open internet due to `0.0.0.0` binding. Always use `127.0.0.1` unless you have a specific need — and if you do, put it behind auth.

---

## Remote Access (Safe Patterns)

### Option 1 — Tailscale (Recommended)
```bash
# Install Tailscale, then use Tailscale Serve
tailscale serve https / http://127.0.0.1:18789
```

### Option 2 — SSH Tunnel
```bash
# On your local machine
ssh -L 18789:127.0.0.1:18789 user@your-vps
```

**Never:** Raw port forwarding, `ngrok` without auth, or `0.0.0.0` binding.

---

## Authentication

Enable token auth for WebChat and Control UI:

```yaml
auth:
  token: "your-strong-random-token"
  # Generate with: openssl rand -hex 32
```

---

## Tool Permissions (AGENTS.md)

Restrict what tools each agent can use:

```markdown
# AGENTS.md

## Permissions
- browser: read-only snapshots only
- files: read from ~/Documents, write DISABLED
- shell: DISABLED
- cron: enabled
- canvas: enabled
```

Principle of least privilege: only enable tools the agent actually needs.

---

## Skills Security

**ClawHub risks:**
- A Cisco research team found a popular ClawHub skill silently exfiltrating Discord message history in Base64-encoded chunks
- A Bitdefender audit flagged ~17% of ClawHub skills as potentially malicious

**Before installing any skill:**
1. Read the source code if available
2. Check the skill's requested permissions
3. Test in an isolated workspace first
4. Run `openclaw doctor` after install

---

## Audit Logging

All agent actions are logged:

```bash
# View recent agent actions
openclaw logs --tail 50

# Filter by tool type
openclaw logs --tool browser

# Export audit log
openclaw logs --export audit-$(date +%Y%m%d).json
```

---

## DM Policy Hardening

Run the doctor to check DM policies:

```bash
openclaw doctor
```

Common issues it surfaces:
- Open gateway bindings
- Missing authentication
- Overly permissive tool access
- Known vulnerable skill patterns
- Exposed WebChat without auth

---

## Checklist

- [ ] Gateway bound to `127.0.0.1`, not `0.0.0.0`
- [ ] Auth token set for WebChat/Control UI
- [ ] Remote access via Tailscale or SSH tunnel only
- [ ] Tool permissions scoped in `AGENTS.md`
- [ ] ClawHub skills reviewed before install
- [ ] `openclaw doctor` passes with no warnings
- [ ] Audit logging enabled
- [ ] Regular log review scheduled
