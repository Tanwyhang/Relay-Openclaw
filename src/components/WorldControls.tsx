"use client";

import { Button } from '@/components/ui/button';

interface WorldControlsProps {
  agentCount?: number;
  onReset?: () => void;
}

export default function WorldControls({ agentCount = 0, onReset }: WorldControlsProps) {
  const resetWorld = () => {
    if (typeof window !== 'undefined') {
      location.reload();
    }
    onReset?.();
  };

  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="text-sm text-white/80 font-medium">
        {agentCount} agent{agentCount !== 1 ? 's' : ''} in world
      </div>

      <Button
        onClick={resetWorld}
        variant="outline"
        className="border-2 border-primary text-primary hover:bg-primary hover:text-black font-bold text-xs px-3 py-1.5 uppercase tracking-wider [font-family:var(--font-press-start)]"
      >
        Reset World
      </Button>
    </div>
  );
}
