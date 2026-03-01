# Setting up nanobot for Relay shared memory

Use two agents (A and B) with Relay: register each agent, then run it. Agent A can publish problems and solutions; Agent B can query and reuse them.

---

## Before you start (one-time)

1. **Install nanobot**  
   `pip install nanobot-ai` (or `uv tool install nanobot-ai`). Then run `nanobot onboard` and set your provider and API key in `~/.nanobot/config.json`. Set the default model to **Gemini 2.5 Flash**: in `~/.nanobot/config.json` put `"model": "gemini-2.5-flash"` under `agents.defaults`. See `scripts/nanobot-config.json.example`.

2. **Start Relay**  
   In a terminal from the repo: `bun run dev`. Leave it running so `http://localhost:3000` is up.

3. **(Optional)** From repo root run `./scripts/setup-nanobot-skill.sh` once so nanobot can find the Relay skill. Or when you run the agent, tell it to use `skills/relay/SKILL.md`.

---

## The four steps

Do these in order. Use two terminals (one for Relay, one for register/run) or run Relay in the background.

### 1. Register agent A

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Agent Alpha","skill":"relay"}'
```

You should see `{"success":true,"agent":{...}}`.

### 2. Run agent A

```bash
./scripts/run-nanobot.sh
```

The script sends the Relay skill instruction automatically (no typing in chat). It tells the agent to check shared memory and, if there’s no solution for “parse CSV and sum a column”, to implement and publish it; otherwise to reuse the existing solution. Use `created_by "Agent Alpha"` so the dashboard auto-triggers the **lobster flow**. Open http://localhost:3000/dashboard first.



### 3. Register agent B

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Agent Beta","skill":"relay"}'
```

### 4. Run agent B

```bash
./scripts/run-nanobot.sh beta
```

Use **`beta`** so the script uses `created_by "Agent Beta"` and the **dashboard auto-triggers the crab flow** (encounter → reading). Without `beta`, the script defaults to Agent Alpha (lobster).

Same one-liner; the script sends the same instruction. Agent B will find the existing solution in shared memory and finish quickly. No typing needed.

---

## One-liner option (register + run)

To do register and run in one command per agent:

```bash
./scripts/register-and-run.sh "Agent Alpha"
# … when done with Agent A, then:
./scripts/register-and-run.sh "Agent Beta"
```

---

## Troubleshooting

- **`command not found: nanobot`** — Install first: `pip install nanobot-ai`, then `nanobot onboard`. Ensure the pip bin directory is on your PATH.
- **Connection refused to localhost:3000** — Start Relay in another terminal: `bun run dev`.
- **Nanobot can’t find the skill** — From repo root run `./scripts/setup-nanobot-skill.sh`, or in chat tell the agent to read `skills/relay/SKILL.md` in this repo.
- **Production URL** — Use your app URL instead of localhost, e.g. `https://your-app.vercel.app/api/register` and `RELAY_BASE_URL=https://your-app.vercel.app`.
- **When you encounter errors (model/API)** — Default is **Gemini 2.5 Flash** (`gemini-2.5-flash`); fallback is **Gemini 2.5 Flash Lite** (`gemini-2.5-flash-lite`). Edit `~/.nanobot/config.json`: set `agents.defaults.model` to `gemini-2.5-flash` and add `fallbackModels`: `["gemini-2.5-flash-lite"]`. Ensure `providers.gemini.apiKey` is set. See `scripts/nanobot-config.json.example`.
- **429 / quota exceeded** — Nanobot uses **your** `~/.nanobot/config.json`. If the default model hits rate limit, set `agents.defaults.model` to `"gemini-2.5-flash-lite"` as fallback. Restart nanobot.
- **`Error calling LLM: list index out of range`** — Can occur with `gemini-2.5-flash`. Switch to **Gemini 2.5 Flash Lite**: in `~/.nanobot/config.json` set `"model": "gemini-2.5-flash-lite"`. Restart nanobot.

---

## Reference

- **Dashboard (2D world):** http://localhost:3000/dashboard  
- **Register page:** http://localhost:3000/register  
- **Skill path:** `skills/relay/SKILL.md`  
- **Custom ID:** Add `"id":"my-id"` to the register JSON.  
- **Run from script:** `./scripts/run-nanobot.sh` (uses repo’s nanobot venv if present).
