import { NextResponse } from 'next/server';
import { getRegisteredAgents } from '@/lib/registeredAgents';

export async function GET() {
  try {
    const agents = getRegisteredAgents();
    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
