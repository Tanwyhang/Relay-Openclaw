#!/usr/bin/env bash
# Test the full flow: (1) Relay API with curl, (2) nanobot with Relay skill.
# Start Relay first in another terminal: bun run dev
# If Relay uses another port (e.g. 3002), run: RELAY_BASE_URL=http://localhost:3002 ./scripts/test-relay-flow.sh
set -e
RELAY_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="${RELAY_BASE_URL:-http://localhost:3000}"
cd "$RELAY_ROOT"

echo "=== 1. Check Relay is running ==="
if ! curl -s -f -m 5 "$BASE/api/memory/index" > /dev/null; then
  echo "Relay not reachable at $BASE. Start it with: bun run dev"
  exit 1
fi
echo "OK: Relay at $BASE"

echo ""
echo "=== 2. Curl: GET /api/memory/index ==="
curl -s "$BASE/api/memory/index" | head -c 500
echo ""
echo ""

echo "=== 3. Curl: GET /api/memory/query?q=test ==="
curl -s "$BASE/api/memory/query?q=test" | head -c 300
echo ""
echo ""

echo "=== 4. Install step (Relay skill) ==="
echo "Skill loaded from: $RELAY_ROOT/skills/relay/SKILL.md"
echo ""

echo "=== 5. Run nanobot with Relay skill + task (one message) ==="
export RELAY_BASE_URL="$BASE"
NANOBOT="$RELAY_ROOT/.venv-nanobot/bin/nanobot"
if [[ ! -x "$NANOBOT" ]]; then
  echo "Nanobot venv missing. Run: /opt/homebrew/bin/python3.12 -m venv .venv-nanobot && .venv-nanobot/bin/pip install nanobot-ai"
  exit 1
fi

PROMPT="Read and follow the instructions in $RELAY_ROOT/skills/relay/SKILL.md. Use the Relay shared-memory API at $BASE. First check if there is already a solution for 'parse CSV and sum a column'. If yes, get it and use it. If no, implement a solution and publish both the problem and the solution to Relay. Use curl to call the API."
"$NANOBOT" agent --message "$PROMPT"
