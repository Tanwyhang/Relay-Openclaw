import { MemoryManager } from './memoryManager';
import type { Problem, Solution, MemoryIndex } from '@/types/memory';

export class Indexer {
  /**
   * Parse frontmatter from markdown content
   */
  static parseFrontmatter(content: string): Record<string, any> | null {
    try {
      const frontmatterRegex = /^---\n([\s\S]+?)\n---/;
      const match = content.match(frontmatterRegex);

      if (!match) return null;

      const frontmatter: Record<string, any> = {};
      const lines = match[1].split('\n');

      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;

        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // Remove quotes from string values
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        // Parse boolean and number values
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(Number(value))) value = Number(value);

        // Parse array values (tags)
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map((v: string) => v.trim().replace(/['"]/g, ''));
        }

        frontmatter[key] = value;
      }

      return frontmatter;
    } catch (error) {
      console.error('Error parsing frontmatter:', error);
      return null;
    }
  }

  /**
   * Rebuild the index from all markdown files
   */
  static rebuildIndex(): MemoryIndex {
    const index: MemoryIndex = {
      version: '1.0',
      last_updated: new Date().toISOString(),
      problems: [],
      solutions: [],
    };

    // Index all problems
    const problemFiles = MemoryManager.listProblems();
    for (const filename of problemFiles) {
      try {
        const content = MemoryManager.readProblem(filename.replace('.md', ''));
        if (!content) continue;

        const frontmatter = this.parseFrontmatter(content);
        if (!frontmatter) continue;

        index.problems.push({
          id: frontmatter.id,
          title: frontmatter.title,
          category: frontmatter.category,
          fee: frontmatter.fee || 0,
          created_at: frontmatter.created_at,
          created_by: frontmatter.created_by,
          status: frontmatter.status,
          solution_id: frontmatter.solution_id || null,
          tags: frontmatter.tags || [],
          file_path: `problems/${filename}`,
        });
      } catch (error) {
        console.error(`Error indexing problem ${filename}:`, error);
      }
    }

    // Index all solutions
    const solutionFiles = MemoryManager.listSolutions();
    for (const filename of solutionFiles) {
      try {
        const content = MemoryManager.readSolution(filename.replace('.md', ''));
        if (!content) continue;

        const frontmatter = this.parseFrontmatter(content);
        if (!frontmatter) continue;

        index.solutions.push({
          id: frontmatter.id,
          problem_id: frontmatter.problem_id,
          title: frontmatter.title,
          category: frontmatter.category,
          fee: frontmatter.fee || 0,
          created_at: frontmatter.created_at,
          created_by: frontmatter.created_by,
          verified: frontmatter.verified || false,
          upvotes: frontmatter.upvotes || 0,
          downvotes: frontmatter.downvotes || 0,
          tags: frontmatter.tags || [],
          file_path: `solutions/${filename}`,
        });
      } catch (error) {
        console.error(`Error indexing solution ${filename}:`, error);
      }
    }

    // Write the updated index
    MemoryManager.writeIndex(index);

    return index;
  }

  /**
   * Add a problem to the index
   */
  static addProblemToIndex(problem: Problem): void {
    const index = MemoryManager.readIndex();

    // Check if problem already exists
    const existingIndex = index.problems.findIndex(p => p.id === problem.id);
    if (existingIndex !== -1) {
      index.problems[existingIndex] = problem;
    } else {
      index.problems.push(problem);
    }

    index.last_updated = new Date().toISOString();
    MemoryManager.writeIndex(index);
  }

  /**
   * Add a solution to the index
   */
  static addSolutionToIndex(solution: Solution): void {
    const index = MemoryManager.readIndex();

    // Check if solution already exists
    const existingIndex = index.solutions.findIndex(s => s.id === solution.id);
    if (existingIndex !== -1) {
      index.solutions[existingIndex] = solution;
    } else {
      index.solutions.push(solution);
    }

    // Update problem status if needed
    const problem = index.problems.findIndex(p => p.id === solution.problem_id);
    if (problem !== -1) {
      index.problems[problem].status = 'resolved';
      index.problems[problem].solution_id = solution.id;
    }

    index.last_updated = new Date().toISOString();
    MemoryManager.writeIndex(index);
  }

  /**
   * Update solution votes
   */
  static updateSolutionVotes(solutionId: string, upvotes: number, downvotes: number): void {
    const index = MemoryManager.readIndex();
    const solution = index.solutions.findIndex(s => s.id === solutionId);

    if (solution !== -1) {
      index.solutions[solution].upvotes = upvotes;
      index.solutions[solution].downvotes = downvotes;
      index.last_updated = new Date().toISOString();
      MemoryManager.writeIndex(index);
    }
  }
}
