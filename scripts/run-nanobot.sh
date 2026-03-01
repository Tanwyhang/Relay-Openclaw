#!/usr/bin/env bash
# Run nanobot with Relay shared memory. Start the Relay app first: bun run dev
# Usage: ./scripts/run-nanobot.sh [alpha|beta]   — alpha (default) = lobster flow, beta = crab flow (dashboard triggers from created_by)
set -e
RELAY_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$RELAY_ROOT"
export RELAY_BASE_URL="${RELAY_BASE_URL:-http://localhost:3000}"

# Optional first arg: alpha (default) or beta/crab — controls created_by and flow trigger so the dashboard runs the right agent flow
AGENT_ARG="${1:-alpha}"
if [[ "$AGENT_ARG" == "beta" || "$AGENT_ARG" == "crab" ]]; then
  CREATED_BY="Agent Beta"
  FLOW_AGENT="beta"
  shift || true
else
  CREATED_BY="Agent Alpha"
  FLOW_AGENT="alpha"
  [[ "$AGENT_ARG" == "alpha" ]] && shift || true
fi

# Notify dashboard to start the flow after 1s (works even when nanobot doesn't publish, e.g. reusing existing solution)
(sleep 1 && curl -s -X POST "${RELAY_BASE_URL}/api/flow/trigger" -H "Content-Type: application/json" -d "{\"agent\":\"$FLOW_AGENT\"}" >/dev/null 2>&1) &

if [[ -x "$RELAY_ROOT/.venv-nanobot/bin/nanobot" ]]; then
  NANOBOT="$RELAY_ROOT/.venv-nanobot/bin/nanobot"
elif command -v nanobot &>/dev/null; then
  NANOBOT=nanobot
else
  echo "Nanobot not found. Install with: pip install nanobot-ai (or create .venv-nanobot and pip install nanobot-ai there)"
  exit 1
fi

# Default message: use Relay skill, publish with created_by so dashboard triggers lobster or crab flow
DEFAULT_MSG="Read and follow the Relay skill at $RELAY_ROOT/skills/relay/SKILL.md. Use the Relay API at $RELAY_BASE_URL. Check shared memory; if no solution for \"parse CSV and sum a column\", implement it then publish using ONE request: POST to $RELAY_BASE_URL/api/memory/publish with type \"problem_and_solution\" and include problem_content and solution_content so both are saved (the second agent must be able to read the solution). Use created_by \"$CREATED_BY\". If a solution already exists, use it. When done, reply in 1–2 sentences with what you did."
RELAY_MSG="${1:-$DEFAULT_MSG}"
echo "RELAY_BASE_URL=$RELAY_BASE_URL"
echo "Relay skill: $RELAY_ROOT/skills/relay/SKILL.md"
echo "created_by: $CREATED_BY (dashboard will trigger $( [[ "$CREATED_BY" == "Agent Beta" ]] && echo "crab" || echo "lobster" ) flow)"
exec $NANOBOT agent --message "$RELAY_MSG"
