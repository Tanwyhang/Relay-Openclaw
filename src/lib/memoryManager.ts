import fs from 'fs';
import path from 'path';
import type { Problem, Solution, MemoryIndex } from '@/types/memory';

const SHARED_MEMORY_DIR = path.join(process.cwd(), 'public', 'shared-memory');
const INDEX_FILE = path.join(SHARED_MEMORY_DIR, 'index.json');
const PROBLEMS_DIR = path.join(SHARED_MEMORY_DIR, 'problems');
const SOLUTIONS_DIR = path.join(SHARED_MEMORY_DIR, 'solutions');

export class MemoryManager {
  /**
   * Read the memory index file
   */
  static readIndex(): MemoryIndex {
    try {
      const data = fs.readFileSync(INDEX_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading index:', error);
      return {
        version: '1.0',
        last_updated: new Date().toISOString(),
        problems: [],
        solutions: [],
      };
    }
  }

  /**
   * Write to the memory index file
   */
  static writeIndex(index: MemoryIndex): void {
    try {
      fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing index:', error);
      throw error;
    }
  }

  /**
   * Read a problem markdown file
   */
  static readProblem(problemId: string): string | null {
    try {
      const problem = this.readIndex().problems.find(p => p.id === problemId);
      if (!problem) return null;

      const filePath = path.join(SHARED_MEMORY_DIR, problem.file_path);
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.error('Error reading problem:', error);
      return null;
    }
  }

  /**
   * Read a solution markdown file
   */
  static readSolution(solutionId: string): string | null {
    try {
      const solution = this.readIndex().solutions.find(s => s.id === solutionId);
      if (!solution) return null;

      const filePath = path.join(SHARED_MEMORY_DIR, solution.file_path);
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.error('Error reading solution:', error);
      return null;
    }
  }

  /**
   * Write a problem markdown file
   */
  static writeProblem(filename: string, content: string): void {
    try {
      const filePath = path.join(PROBLEMS_DIR, filename);
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error) {
      console.error('Error writing problem:', error);
      throw error;
    }
  }

  /**
   * Write a solution markdown file
   */
  static writeSolution(filename: string, content: string): void {
    try {
      const filePath = path.join(SOLUTIONS_DIR, filename);
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error) {
      console.error('Error writing solution:', error);
      throw error;
    }
  }

  /**
   * List all problem files
   */
  static listProblems(): string[] {
    try {
      return fs.readdirSync(PROBLEMS_DIR).filter(f => f.endsWith('.md'));
    } catch (error) {
      console.error('Error listing problems:', error);
      return [];
    }
  }

  /**
   * List all solution files
   */
  static listSolutions(): string[] {
    try {
      return fs.readdirSync(SOLUTIONS_DIR).filter(f => f.endsWith('.md'));
    } catch (error) {
      console.error('Error listing solutions:', error);
      return [];
    }
  }
}
