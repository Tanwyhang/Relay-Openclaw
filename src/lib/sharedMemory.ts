import type {
  Problem,
  Solution,
  MemoryIndex,
  PublishProblemRequest,
  PublishSolutionRequest,
} from '@/types/memory';

const API_BASE = '/api/memory';

export class SharedMemoryClient {
  /**
   * Get the full memory index
   */
  static async getIndex(): Promise<MemoryIndex> {
    const response = await fetch(`${API_BASE}/index`);
    if (!response.ok) {
      throw new Error('Failed to fetch memory index');
    }
    return response.json();
  }

  /**
   * Search for problems and solutions
   */
  static async search(query: string): Promise<{ problems: Problem[]; solutions: Solution[] }> {
    const response = await fetch(`${API_BASE}/query?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search memory');
    }
    const data = await response.json();

    // Separate results into problems and solutions
    const problems: Problem[] = [];
    const solutions: Solution[] = [];

    for (const result of data.results) {
      if (result.type === 'problem') {
        problems.push(result.problem);
      } else {
        solutions.push(result.solution);
      }
    }

    return { problems, solutions };
  }

  /**
   * Get a problem by ID
   */
  static async getProblem(problemId: string): Promise<{ id: string; content: string }> {
    const response = await fetch(`${API_BASE}/problem/${problemId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch problem');
    }
    return response.json();
  }

  /**
   * Get a solution by ID
   */
  static async getSolution(solutionId: string): Promise<{ id: string; content: string }> {
    const response = await fetch(`${API_BASE}/solution/${solutionId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch solution');
    }
    return response.json();
  }

  /**
   * Publish a new problem
   */
  static async publishProblem(request: PublishProblemRequest): Promise<{
    success: boolean;
    problemId: string;
    file_path: string;
  }> {
    const response = await fetch(`${API_BASE}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'problem',
        ...request,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to publish problem');
    }

    return response.json();
  }

  /**
   * Publish a new solution
   */
  static async publishSolution(request: PublishSolutionRequest): Promise<{
    success: boolean;
    solutionId: string;
    file_path: string;
  }> {
    const response = await fetch(`${API_BASE}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'solution',
        ...request,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to publish solution');
    }

    return response.json();
  }

  /**
   * Upvote a solution
   */
  static async upvoteSolution(solutionId: string): Promise<{
    success: boolean;
    upvotes: number;
    downvotes: number;
  }> {
    const response = await fetch(`${API_BASE}/solution/${solutionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'upvote',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to upvote solution');
    }

    return response.json();
  }

  /**
   * Downvote a solution
   */
  static async downvoteSolution(solutionId: string): Promise<{
    success: boolean;
    upvotes: number;
    downvotes: number;
  }> {
    const response = await fetch(`${API_BASE}/solution/${solutionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'downvote',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to downvote solution');
    }

    return response.json();
  }

  /**
   * Find solutions for a specific problem
   */
  static async findSolutionsForProblem(problemId: string): Promise<Solution[]> {
    const index = await this.getIndex();
    return index.solutions.filter(s => s.problem_id === problemId);
  }
}
