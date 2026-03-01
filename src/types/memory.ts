export interface Problem {
  id: string;
  title: string;
  category: string;
  fee: number;
  created_at: string;
  created_by: string;
  status: 'pending' | 'resolved';
  solution_id: string | null;
  tags: string[];
  file_path: string;
}

export interface Solution {
  id: string;
  problem_id: string;
  title: string;
  category: string;
  fee: number;
  created_at: string;
  created_by: string;
  verified: boolean;
  upvotes: number;
  downvotes: number;
  tags: string[];
  file_path: string;
}

export interface MemoryIndex {
  version: string;
  last_updated: string;
  problems: Problem[];
  solutions: Solution[];
}

export interface PublishProblemRequest {
  title: string;
  category: string;
  fee: number;
  created_by: string;
  tags: string[];
  content: string;
}

export interface PublishSolutionRequest {
  problem_id: string;
  title: string;
  category: string;
  fee: number;
  created_by: string;
  tags: string[];
  content: string;
}

export interface QueryResponse {
  problems: Problem[];
  solutions: Solution[];
}
