import fs from 'fs';
import path from 'path';
import type { RegisteredAgent } from '@/types/agents';

const AGENTS_FILE = path.join(process.cwd(), 'public', 'registered-agents.json');

function ensureFile(): void {
  const dir = path.dirname(AGENTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(AGENTS_FILE)) {
    fs.writeFileSync(AGENTS_FILE, JSON.stringify({ agents: [] }, null, 2), 'utf-8');
  }
}

export function getRegisteredAgents(): RegisteredAgent[] {
  ensureFile();
  try {
    const data = fs.readFileSync(AGENTS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as { agents: RegisteredAgent[] };
    return Array.isArray(parsed.agents) ? parsed.agents : [];
  } catch {
    return [];
  }
}

export function registerAgent(name: string, id?: string, skill?: string): RegisteredAgent {
  ensureFile();
  const agents = getRegisteredAgents();
  const agentId = id?.trim() || `agent-${String(agents.length + 1).padStart(3, '0')}`;
  const existingIndex = agents.findIndex((a) => a.id === agentId);
  if (existingIndex >= 0) {
    const existing = agents[existingIndex];
    if (skill !== undefined) {
      const updated = { ...existing, skill: skill || undefined };
      agents[existingIndex] = updated;
      fs.writeFileSync(AGENTS_FILE, JSON.stringify({ agents }, null, 2), 'utf-8');
      return updated;
    }
    return existing;
  }
  const agent: RegisteredAgent = {
    id: agentId,
    name: name.trim() || agentId,
    registeredAt: new Date().toISOString(),
    ...(skill ? { skill } : {}),
  };
  agents.push(agent);
  fs.writeFileSync(AGENTS_FILE, JSON.stringify({ agents }, null, 2), 'utf-8');
  return agent;
}
