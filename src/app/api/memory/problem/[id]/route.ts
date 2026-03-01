import { NextRequest, NextResponse } from 'next/server';
import { MemoryManager } from '@/lib/memoryManager';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const content = MemoryManager.readProblem(params.id);

    if (!content) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: params.id,
      content,
    });
  } catch (error) {
    console.error('Error in problem API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
