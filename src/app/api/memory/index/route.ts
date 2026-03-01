import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { MemoryManager } from '@/lib/memoryManager';

const FLOW_TRIGGER_FILE = path.join(process.cwd(), '.flow-trigger.json');

export async function GET() {
  try {
    const index = MemoryManager.readIndex();
    let flowTrigger: { agent: string } | undefined;
    try {
      if (fs.existsSync(FLOW_TRIGGER_FILE)) {
        const data = fs.readFileSync(FLOW_TRIGGER_FILE, 'utf-8');
        const parsed = JSON.parse(data) as { agent?: string };
        if (parsed.agent === 'alpha' || parsed.agent === 'beta') {
          flowTrigger = { agent: parsed.agent };
        }
      }
    } catch {
      // ignore
    }
    return NextResponse.json({ ...index, ...(flowTrigger && { flowTrigger }) });
  } catch (error) {
    console.error('Error in index API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
