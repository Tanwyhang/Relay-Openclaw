export interface WorldObject2D {
  id: string;
  type: 'problem' | 'memory' | 'solution';
  x: number;
  y: number;
  color: string;
  knowledgeId?: string;
  resolved: boolean;
}

/** Chest at fixed position; state drives which asset is shown */
export interface Chest2D {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** 'normal' | 'bad' | 'nice' (nice uses 1row5col spritesheet) */
  state: 'normal' | 'bad' | 'nice';
  /** Current frame for nice (spritesheet) */
  frame?: number;
}

/** One item's position and scale (Preview / canvas coordinates, top-left origin) */
export interface ItemPositionAndScale {
  x: number;
  y: number;
  scale?: number;
}

/** Controllable positions and scales for map items */
export interface WorldItemPositions {
  trap: ItemPositionAndScale;
  chest: ItemPositionAndScale;
  house: ItemPositionAndScale;
  /** Lobster/crab animation sprites placed for reference (sprite key -> position & scale) */
  sprites?: Record<string, ItemPositionAndScale>;
}

export type { Agent2D } from './agent';

export type TestAgentType = 'lobster' | 'crab';
export type TestPhaseType = 'encounter' | 'reading' | 'finding' | 'publishing';

/** Trigger a phase animation for a specific agent (e.g. when agent does encounter / query / find / publish). */
export interface TriggerAgentPhase {
  agentId: string;
  phase: TestPhaseType;
}

/** Map CLI/API action names to world phase (use when wiring real agent actions to animations). */
export const ACTION_TO_PHASE: Record<string, TestPhaseType> = {
  encounter: 'encounter',
  encounter_problem: 'encounter',
  reading: 'reading',
  query: 'reading',
  finding: 'finding',
  find_solution: 'finding',
  publishing: 'publishing',
  publish_solution: 'publishing',
};

export interface AgentWorld2DProps {
  registeredAgents?: { id: string; name: string }[];
  onAgentAction?: (agentId: string, action: string, data?: any) => void;
  simulationSpeed?: number;
  /** Controllable positions for trap, chest, house (Preview coords). When provided, auto-play is off. */
  itemPositions?: WorldItemPositions;
  /** When set, run this phase sequence for the given agent. Cleared when phase ends. */
  triggerAgentPhase?: TriggerAgentPhase | null;
  /** Called when a triggered phase completes (agentId, completedPhase) so caller can chain next phase. */
  onPhaseComplete?: (agentId: string, completedPhase: TestPhaseType) => void;
}

export interface SimulationCallbacks {
  onAgentMove?: (agentId: string, x: number, y: number) => void;
  onAgentThink?: (agentId: string, task: string) => void;
  onAgentSolve?: (agentId: string, problemId: string) => void;
  onAgentQuery?: (agentId: string, query: string) => void;
  onAgentPublish?: (agentId: string, solutionId: string) => void;
}
