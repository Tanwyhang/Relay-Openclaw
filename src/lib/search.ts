import { MemoryManager } from './memoryManager';
import type { Problem, Solution } from '@/types/memory';

export interface SearchResult {
  type: 'problem' | 'solution';
  id: string;
  title: string;
  category: string;
  score: number;
  problem?: Problem;
  solution?: Solution;
}

export class Search {
  /**
   * Simple text search with scoring
   */
  static search(query: string): SearchResult[] {
    if (!query.trim()) return [];

    const index = MemoryManager.readIndex();
    const results: SearchResult[] = [];
    const searchTerms = query.toLowerCase().split(/\s+/);

    // Search problems
    for (const problem of index.problems) {
      const score = this.calculateScore(problem, searchTerms);
      if (score > 0) {
        results.push({
          type: 'problem',
          id: problem.id,
          title: problem.title,
          category: problem.category,
          score,
          problem,
        });
      }
    }

    // Search solutions
    for (const solution of index.solutions) {
      const score = this.calculateScore(solution, searchTerms);
      if (score > 0) {
        results.push({
          type: 'solution',
          id: solution.id,
          title: solution.title,
          category: solution.category,
          score,
          solution,
        });
      }
    }

    // Sort by score (descending)
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate relevance score for an item
   */
  private static calculateScore(
    item: Problem | Solution,
    searchTerms: string[]
  ): number {
    let score = 0;

    const searchText = [
      item.title,
      item.category,
      ...item.tags,
      item.created_by,
    ].join(' ').toLowerCase();

    for (const term of searchTerms) {
      // Exact match in title = highest score
      if (item.title.toLowerCase().includes(term)) {
        score += 10;
      }

      // Match in category
      if (item.category.toLowerCase().includes(term)) {
        score += 5;
      }

      // Match in tags
      for (const tag of item.tags) {
        if (tag.toLowerCase().includes(term)) {
          score += 3;
        }
      }

      // Partial match anywhere
      if (searchText.includes(term)) {
        score += 1;
      }
    }

    return score;
  }

  /**
   * Find solutions for a specific problem
   */
  static findSolutionsForProblem(problemId: string): Solution[] {
    const index = MemoryManager.readIndex();
    return index.solutions.filter(s => s.problem_id === problemId);
  }

  /**
   * Find problem by ID
   */
  static findProblemById(problemId: string): Problem | null {
    const index = MemoryManager.readIndex();
    return index.problems.find(p => p.id === problemId) || null;
  }

  /**
   * Find solution by ID
   */
  static findSolutionById(solutionId: string): Solution | null {
    const index = MemoryManager.readIndex();
    return index.solutions.find(s => s.id === solutionId) || null;
  }

  /**
   * Get trending solutions (most upvotes)
   */
  static getTrendingSolutions(limit: number = 10): Solution[] {
    const index = MemoryManager.readIndex();
    return [...index.solutions]
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, limit);
  }

  /**
   * Get recent problems
   */
  static getRecentProblems(limit: number = 10): Problem[] {
    const index = MemoryManager.readIndex();
    return [...index.problems]
      .sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, limit);
  }
}
