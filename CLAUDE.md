# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

A collection of standalone Voiceflow custom function scripts. Each `.js` file is a self-contained function designed to be pasted into a Voiceflow "Custom Function" step inside a Voiceflow agent/chatbot. These are **not** a Node.js project — there is no `package.json`, no build system, no test framework, and no dependencies to install.

## Voiceflow Function Contract

Every file exports a single default async function with this signature:

```js
export default async function main(args) { ... }
```

- **Input:** `args.inputVars` — an object of variables passed from the Voiceflow canvas.
- **Output:** must return an object with:
  - `next: { path: 'success' | 'error' | <custom> }` — controls which port the flow exits through.
  - `trace` (optional) — array of trace objects (`{ type: "debug"|"text", payload: { message } }`) for logging/display.
  - `outputVars` (optional) — object of variables to write back to the Voiceflow session.
- **Environment:** Functions run in Voiceflow's sandboxed runtime which provides `fetch` globally (no `node-fetch` import needed). Standard Node built-ins (fs, path, etc.) are **not available**.

## Files Overview

| File | Purpose | External API |
|---|---|---|
| `cal_slots.js` | Fetches available calendar slots | Cal.com v2 API |
| `pinecone.js` | Chat completions via Pinecone Assistant | Pinecone Assistant API |
| `get_current_time.js` | Returns formatted current date/time in a given timezone | None (Intl API) |
| `custom_memory.js` | Appends user/assistant turns to a rolling text memory string | None |
| `send-data-to-make.js` | POSTs user data to a Make.com webhook | Make.com webhook |

## Conventions

- Each function validates required `inputVars` up front and returns `{ next: { path: 'error' } }` with a debug trace on failure.
- API keys and secrets are always passed via `inputVars`, never hardcoded.
- `response.json` (property access, not method call) is used in the Voiceflow runtime — this differs from standard `fetch` where you'd call `response.json()`.
