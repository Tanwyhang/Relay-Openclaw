import { NextRequest, NextResponse } from 'next/server';
import { MemoryManager } from '@/lib/memoryManager';
import { Indexer } from '@/lib/indexer';
import type { PublishProblemRequest, PublishSolutionRequest } from '@/types/memory';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'problem') {
      return publishProblem(body);
    } else if (type === 'solution') {
      return publishSolution(body);
    } else if (type === 'problem_and_solution') {
      return publishProblemAndSolution(body);
    } else {
      return NextResponse.json({ error: 'Invalid type. Must be "problem", "solution", or "problem_and_solution"' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in publish API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** One call to publish both problem and solution so the second agent can read it. */
async function publishProblemAndSolution(body: {
  type: string;
  title: string;
  category: string;
  fee?: number;
  created_by: string;
  tags: string[];
  problem_content: string;
  solution_title: string;
  solution_content: string;
}) {
  const { title, category, fee = 0, created_by, tags, problem_content, solution_title, solution_content } = body;
  const problemRes = await publishProblem({
    type: 'problem',
    title,
    category,
    fee,
    created_by,
    tags,
    content: problem_content,
  } as PublishProblemRequest & { type: string });
  const problemData = await problemRes.json();
  if (!problemData.problemId) {
    return NextResponse.json({ error: 'Failed to publish problem', details: problemData }, { status: 500 });
  }
  const solutionRes = await publishSolution({
    type: 'solution',
    problem_id: problemData.problemId,
    title: solution_title,
    category,
    fee,
    created_by,
    tags,
    content: solution_content,
  } as PublishSolutionRequest & { type: string });
  const solutionData = await solutionRes.json();
  return NextResponse.json({
    success: true,
    problemId: problemData.problemId,
    solutionId: solutionData.solutionId,
    file_path: problemData.file_path,
    solution_file_path: solutionData.file_path,
  });
}

async function publishProblem(body: PublishProblemRequest & { type: string }) {
  const { title, category, fee, created_by, tags, content } = body;

  // Generate problem ID
  const index = MemoryManager.readIndex();
  const problemNum = index.problems.length + 1;
  const problemId = `PROB-${String(problemNum).padStart(3, '0')}`;
  const filename = `${problemId}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.md`;

  // Create frontmatter
  const frontmatter = `---
id: ${problemId}
title: "${title}"
category: "${category}"
fee: ${fee || 0}
created_at: "${new Date().toISOString()}"
created_by: "${created_by}"
status: "pending"
solution_id: null
tags: [${tags.map((t: string) => `"${t}"`).join(', ')}]
---

${content}
`;

  // Write markdown file
  MemoryManager.writeProblem(filename, frontmatter);

  // Update index
  Indexer.addProblemToIndex({
    id: problemId,
    title,
    category,
    fee: fee || 0,
    created_at: new Date().toISOString(),
    created_by,
    status: 'pending',
    solution_id: null,
    tags,
    file_path: `problems/${filename}`,
  });

  return NextResponse.json({
    success: true,
    problemId,
    file_path: `problems/${filename}`,
  });
}

async function publishSolution(body: PublishSolutionRequest & { type: string }) {
  const { problem_id, title, category, fee, created_by, tags, content } = body;

  // Generate solution ID
  const index = MemoryManager.readIndex();
  const solutionNum = index.solutions.length + 1;
  const solutionId = `SOL-${String(solutionNum).padStart(3, '0')}`;
  const filename = `${solutionId}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.md`;

  // Create frontmatter
  const frontmatter = `---
id: ${solutionId}
problem_id: "${problem_id}"
title: "${title}"
category: "${category}"
created_at: "${new Date().toISOString()}"
created_by: "${created_by}"
verified: false
fee: ${fee || 0}
upvotes: 0
downvotes: 0
tags: [${tags.map((t: string) => `"${t}"`).join(', ')}]
---

${content}
`;

  // Write markdown file
  MemoryManager.writeSolution(filename, frontmatter);

  // Update index
  Indexer.addSolutionToIndex({
    id: solutionId,
    problem_id,
    title,
    category,
    fee: fee || 0,
    created_at: new Date().toISOString(),
    created_by,
    verified: false,
    upvotes: 0,
    downvotes: 0,
    tags,
    file_path: `solutions/${filename}`,
  });

  return NextResponse.json({
    success: true,
    solutionId,
    file_path: `solutions/${filename}`,
  });
}

export const dynamic = 'force-dynamic';
