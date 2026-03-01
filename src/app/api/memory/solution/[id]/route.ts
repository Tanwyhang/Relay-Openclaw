import { NextRequest, NextResponse } from 'next/server';
import { MemoryManager } from '@/lib/memoryManager';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const content = MemoryManager.readSolution(params.id);

    if (!content) {
      return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: params.id,
      content,
    });
  } catch (error) {
    console.error('Error in solution API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'upvote') {
      // Increment upvotes
      const index = MemoryManager.readIndex();
      const solution = index.solutions.findIndex(s => s.id === params.id);

      if (solution !== -1) {
        index.solutions[solution].upvotes += 1;
        index.last_updated = new Date().toISOString();
        MemoryManager.writeIndex(index);

        return NextResponse.json({
          success: true,
          upvotes: index.solutions[solution].upvotes,
          downvotes: index.solutions[solution].downvotes,
        });
      }

      return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
    } else if (action === 'downvote') {
      // Increment downvotes
      const index = MemoryManager.readIndex();
      const solution = index.solutions.findIndex(s => s.id === params.id);

      if (solution !== -1) {
        index.solutions[solution].downvotes += 1;
        index.last_updated = new Date().toISOString();
        MemoryManager.writeIndex(index);

        return NextResponse.json({
          success: true,
          upvotes: index.solutions[solution].upvotes,
          downvotes: index.solutions[solution].downvotes,
        });
      }

      return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in solution API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
