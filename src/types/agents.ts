export interface RegisteredAgent {
  id: string;
  name: string;
  registeredAt: string;
  /** Optional skill to run with (e.g. "relay" or URL to SKILL.md). Runners can use this to auto-follow the skill. */
  skill?: string;
}

export interface RegisterRequest {
  name: string;
  id?: string;
  /** Associate this agent with a skill so it runs/follows it (e.g. "relay" or URL to SKILL.md). */
  skill?: string;
}
