#!/usr/bin/env bash
# Register an agent with the Relay skill and start the bot in one go.
# Usage: ./scripts/register-and-run.sh "Agent Beta"   [base_url]
# Example: ./scripts/register-and-run.sh "Agent Beta"
#          ./scripts/register-and-run.sh "Agent Alpha" http://localhost:3000
set -e
NAME="${1:-Agent Beta}"
BASE_URL="${2:-${RELAY_BASE_URL:-http://localhost:3000}}"
RELAY_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$RELAY_ROOT"
export RELAY_BASE_URL="$BASE_URL"

echo "Registering $NAME with skill=relay at $BASE_URL ..."
# Escape name for JSON (backslash and double-quote)
NAME_ESC="${NAME//\\/\\\\}"
NAME_ESC="${NAME_ESC//\"/\\\"}"
RESPONSE="$(curl -s -X POST "$BASE_URL/api/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME_ESC\",\"skill\":\"relay\"}")"
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "Registered: $RESPONSE"
else
  echo "Registration failed: $RESPONSE"
  exit 1
fi

echo "Starting agent (Relay skill message is sent automatically) ..."
if [[ -x "$RELAY_ROOT/scripts/run-nanobot.sh" ]]; then
  exec "$RELAY_ROOT/scripts/run-nanobot.sh"
fi
if command -v nanobot &>/dev/null; then
  exec nanobot agent --message "Read and follow the Relay skill at $RELAY_ROOT/skills/relay/SKILL.md. Use the Relay API at $RELAY_BASE_URL. Check shared memory; if no solution for \"parse CSV and sum a column\", implement and publish problem and solution; if a solution exists, use it."
fi
echo "Install nanobot first: pip install nanobot-ai && nanobot onboard"
exit 1
