import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FLOW_TRIGGER_FILE = path.join(process.cwd(), '.flow-trigger.json');

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { agent?: string };
    const agent = typeof body.agent === 'string' ? body.agent.toLowerCase() : null;
    if (!agent || (agent !== 'alpha' && agent !== 'beta')) {
      return NextResponse.json({ error: 'agent must be "alpha" or "beta"' }, { status: 400 });
    }
    fs.writeFileSync(FLOW_TRIGGER_FILE, JSON.stringify({ agent }), 'utf-8');
    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error('Error writing flow trigger:', error);
    return NextResponse.json({ error: 'Failed to set flow trigger' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
