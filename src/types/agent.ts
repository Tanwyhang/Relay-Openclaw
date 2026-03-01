/** Spritesheet layout: rows × cols; optional pixel offsets for irregular frames */
export interface SpriteSheetSpec {
  src: string;
  rows: number;
  cols: number;
  offsetLeft?: number;
  offsetRight?: number;
  /** If true, frame widths/heights may be irregular (use per-frame or assume equal for now) */
  irregular?: boolean;
  /** Extra source width (px) for the last frame only (e.g. lobster-walk last frame +40) */
  lastFrameExtraWidth?: number;
}

export interface Agent2D {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  shape: 'square' | 'circle';
  status: 'idle' | 'moving' | 'thinking' | 'solving' | 'learning';
  targetX?: number;
  targetY?: number;
  currentTask?: string;
  knowledgeAccessed: string[];
  /** 2D sprite: which spritesheet to show (key into sprite config) */
  spriteKey?: string;
  /** Current frame index (0-based) for spritesheet animation */
  spriteFrame?: number;
  /** Spritesheet spec for current sprite (or from preset) */
  spriteSheet?: SpriteSheetSpec;
  /** Invert facing direction (flip sprite horizontally) */
  invert?: boolean;
  /** Used for phase animations: lobster vs crab sequence */
  agentType?: 'lobster' | 'crab';
}

export interface AgentWorkflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  type: 'move' | 'think' | 'query' | 'solve' | 'publish' | 'implement' | 'upvote';
  duration: number;
  data?: any;
}
