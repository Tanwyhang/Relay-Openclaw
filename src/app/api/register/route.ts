import { NextRequest, NextResponse } from 'next/server';
import { registerAgent } from '@/lib/registeredAgents';
import type { RegisterRequest } from '@/types/agents';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterRequest;
    const name = typeof body.name === 'string' ? body.name : '';
    const id = typeof body.id === 'string' ? body.id : undefined;
    const skill = typeof body.skill === 'string' ? body.skill : undefined;
    const agent = registerAgent(name, id, skill);
    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error('Error registering agent:', error);
    return NextResponse.json({ error: 'Failed to register agent' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
