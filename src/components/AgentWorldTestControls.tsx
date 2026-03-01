"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { TestAgentType, TestPhaseType } from "@/types/world";

interface AgentWorldTestControlsProps {
  testAgent: TestAgentType | null;
  onTestAgentChange: (agent: TestAgentType | null) => void;
  triggerPhase: TestPhaseType | null;
  onPhaseTrigger: (phase: TestPhaseType | null) => void;
  onPhaseComplete?: () => void;
}

const PHASES: { key: TestPhaseType; label: string; crab: boolean }[] = [
  { key: "encounter", label: "Encounter problem", crab: true },
  { key: "reading", label: "Reading knowledge", crab: true },
  { key: "finding", label: "Finding solution", crab: false },
  { key: "publishing", label: "Publishing solution", crab: false },
];

export default function AgentWorldTestControls({
  testAgent,
  onTestAgentChange,
  triggerPhase,
  onPhaseTrigger,
}: AgentWorldTestControlsProps) {
  const handlePhaseClick = (phase: TestPhaseType) => {
    onPhaseTrigger(phase);
  };

  const isCrab = testAgent === "crab";

  return (
    <div className="flex flex-col gap-3 p-3 border-t border-white/10 bg-black/40">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 mr-1">
          Test agent:
        </span>
        <Button
          size="sm"
          variant={testAgent === "lobster" ? "default" : "outline"}
          className="h-8 text-xs font-bold [font-family:var(--font-press-start)]"
          onClick={() => onTestAgentChange(testAgent === "lobster" ? null : "lobster")}
        >
          Lobster
        </Button>
        <Button
          size="sm"
          variant={testAgent === "crab" ? "default" : "outline"}
          className="h-8 text-xs font-bold [font-family:var(--font-press-start)]"
          onClick={() => onTestAgentChange(testAgent === "crab" ? null : "crab")}
        >
          Crab
        </Button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 mr-1">
          Phase:
        </span>
        {PHASES.map(({ key, label, crab }) => (
          <Button
            key={key}
            size="sm"
            variant="outline"
            disabled={!testAgent || (isCrab && !crab)}
            className="h-8 text-[10px] font-bold border-primary/50 text-primary hover:bg-primary hover:text-black disabled:opacity-40 [font-family:var(--font-press-start)]"
            onClick={() => handlePhaseClick(key)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
