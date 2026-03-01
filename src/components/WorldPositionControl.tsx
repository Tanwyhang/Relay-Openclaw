"use client";

import { useState, useEffect } from "react";
import type { WorldItemPositions, ItemPositionAndScale } from "@/types/world";
import { Input } from "@/components/ui/input";

const SLIDER_MAX_X = 1820;
const SLIDER_MAX_Y = 1222;
const SCALE_MIN = 0.1;
const SCALE_MAX = 3;
const SCALE_STEP = 0.1;

type PositionTarget = "trap" | "chest" | "house";

const POSITION_OPTIONS: { value: PositionTarget; label: string; sublabel: string }[] = [
  { value: "trap", label: "Trap (problem)", sublabel: "Encounter a problem" },
  { value: "chest", label: "Chest (knowledge)", sublabel: "Query / index solution" },
  { value: "house", label: "House (solution)", sublabel: "Founded the solution" },
];

interface WorldPositionControlProps {
  positions: WorldItemPositions;
  onPositionsChange: (positions: WorldItemPositions) => void;
}

function PositionAndScaleRow({
  label,
  sublabel,
  x,
  y,
  scale,
  onXChange,
  onYChange,
  onScaleChange,
}: {
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  scale: number;
  onXChange: (v: number) => void;
  onYChange: (v: number) => void;
  onScaleChange: (v: number) => void;
}) {
  const [localX, setLocalX] = useState(String(x));
  const [localY, setLocalY] = useState(String(y));
  const [localScale, setLocalScale] = useState(String(scale));
  useEffect(() => {
    setLocalX(String(x));
    setLocalY(String(y));
    setLocalScale(String(scale));
  }, [x, y, scale]);

  const commitX = () => {
    const n = parseInt(localX, 10);
    if (!Number.isNaN(n)) onXChange(Math.max(0, Math.min(SLIDER_MAX_X, n)));
  };
  const commitY = () => {
    const n = parseInt(localY, 10);
    if (!Number.isNaN(n)) onYChange(Math.max(0, Math.min(SLIDER_MAX_Y, n)));
  };
  const commitScale = () => {
    const n = parseFloat(localScale);
    if (!Number.isNaN(n)) onScaleChange(Math.max(SCALE_MIN, Math.min(SCALE_MAX, n)));
  };

  return (
    <div className="space-y-2 p-3 rounded-md bg-black/20 border border-white/10">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-white/90 block">
            {label}
          </label>
          {sublabel && (
            <p className="text-[10px] text-white/50 mt-0.5">{sublabel}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-white/50 text-[10px] w-5">X</span>
            <Input
              type="number"
              min={0}
              max={SLIDER_MAX_X}
              value={localX}
              onChange={(e) => setLocalX(e.target.value)}
              onBlur={commitX}
              onKeyDown={(e) => e.key === "Enter" && commitX()}
              className="h-7 w-14 text-xs font-mono bg-black/40 border-primary/50 text-white"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white/50 text-[10px] w-5">Y</span>
            <Input
              type="number"
              min={0}
              max={SLIDER_MAX_Y}
              value={localY}
              onChange={(e) => setLocalY(e.target.value)}
              onBlur={commitY}
              onKeyDown={(e) => e.key === "Enter" && commitY()}
              className="h-7 w-14 text-xs font-mono bg-black/40 border-primary/50 text-white"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white/50 text-[10px] w-8">Scale</span>
            <Input
              type="number"
              min={SCALE_MIN}
              max={SCALE_MAX}
              step={SCALE_STEP}
              value={localScale}
              onChange={(e) => setLocalScale(e.target.value)}
              onBlur={commitScale}
              onKeyDown={(e) => e.key === "Enter" && commitScale()}
              className="h-7 w-14 text-xs font-mono bg-black/40 border-primary/50 text-white"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex justify-between text-[10px] text-white/50 mb-0.5">
            <span>X</span>
            <span className="font-mono">{x}</span>
          </div>
          <input
            type="range"
            min={0}
            max={SLIDER_MAX_X}
            value={Math.max(0, Math.min(SLIDER_MAX_X, x))}
            onChange={(e) => onXChange(Number(e.target.value))}
            className="w-full h-2 accent-primary cursor-pointer"
          />
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-white/50 mb-0.5">
            <span>Y</span>
            <span className="font-mono">{y}</span>
          </div>
          <input
            type="range"
            min={0}
            max={SLIDER_MAX_Y}
            value={Math.max(0, Math.min(SLIDER_MAX_Y, y))}
            onChange={(e) => onYChange(Number(e.target.value))}
            className="w-full h-2 accent-primary cursor-pointer"
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-[10px] text-white/50 mb-0.5">
          <span>Scale</span>
          <span className="font-mono">{scale.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={SCALE_MIN}
          max={SCALE_MAX}
          step={SCALE_STEP}
          value={Math.max(SCALE_MIN, Math.min(SCALE_MAX, scale))}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="w-full h-2 accent-primary cursor-pointer"
        />
      </div>
    </div>
  );
}

function getPos(positions: WorldItemPositions, selected: PositionTarget): ItemPositionAndScale {
  if (selected === "trap") return positions.trap;
  if (selected === "chest") return positions.chest;
  return positions.house;
}

export default function WorldPositionControl({
  positions,
  onPositionsChange,
}: WorldPositionControlProps) {
  const [selected, setSelected] = useState<PositionTarget>("trap");

  const selectedPos = getPos(positions, selected);
  const scale = selectedPos.scale ?? 1;
  const option = POSITION_OPTIONS.find((o) => o.value === selected) ?? POSITION_OPTIONS[0];

  const update = (patch: Partial<ItemPositionAndScale>) => {
    if (selected === "trap") {
      onPositionsChange({ ...positions, trap: { ...positions.trap, ...patch } });
    } else if (selected === "chest") {
      onPositionsChange({ ...positions, chest: { ...positions.chest, ...patch } });
    } else {
      onPositionsChange({ ...positions, house: { ...positions.house, ...patch } });
    }
  };

  const onXChange = (x: number) => update({ x });
  const onYChange = (y: number) => update({ y });
  const onScaleChange = (scale: number) => update({ scale });

  return (
    <details open className="w-full group">
      <summary className="list-none cursor-pointer px-4 py-2 border-b border-white/10 flex items-center justify-between text-sm font-bold text-primary uppercase tracking-wider hover:text-white transition-colors [font-family:var(--font-press-start)]">
        Position control (Preview coords)
        <span className="group-open:rotate-180 transition-transform inline-block">▼</span>
      </summary>
      <div className="p-4 space-y-4 bg-black/30 border-b border-white/10">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1.5">
            Select item to position
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value as PositionTarget)}
            className="w-full h-9 px-3 rounded border-2 border-primary/50 bg-black/40 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary [font-family:var(--font-press-start)]"
          >
            {POSITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-black text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <PositionAndScaleRow
          label={option.label}
          sublabel={option.sublabel}
          x={selectedPos.x}
          y={selectedPos.y}
          scale={scale}
          onXChange={onXChange}
          onYChange={onYChange}
          onScaleChange={onScaleChange}
        />
      </div>
    </details>
  );
}
