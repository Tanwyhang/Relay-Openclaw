#!/usr/bin/env bash
# Copy Relay skill into nanobot's skill dir so nanobot can find it on any machine.
# Run from repo root: ./scripts/setup-nanobot-skill.sh
set -e
RELAY_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILL_SRC="$RELAY_ROOT/skills/relay/SKILL.md"
SKILL_DIR="$HOME/.nanobot/skills/relay"
if [[ ! -f "$SKILL_SRC" ]]; then
  echo "Skill not found: $SKILL_SRC"
  exit 1
fi
mkdir -p "$SKILL_DIR"
cp "$SKILL_SRC" "$SKILL_DIR/SKILL.md"
echo "Copied Relay skill to $SKILL_DIR/SKILL.md"
