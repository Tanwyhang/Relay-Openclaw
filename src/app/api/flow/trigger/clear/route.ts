import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FLOW_TRIGGER_FILE = path.join(process.cwd(), '.flow-trigger.json');

export async function POST() {
  try {
    if (fs.existsSync(FLOW_TRIGGER_FILE)) {
      fs.unlinkSync(FLOW_TRIGGER_FILE);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing flow trigger:', error);
    return NextResponse.json({ error: 'Failed to clear' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
