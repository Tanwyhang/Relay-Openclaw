"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type {
  Agent2D,
  AgentWorld2DProps,
  Chest2D,
  WorldItemPositions,
  TestPhaseType,
} from "@/types/world";
import type { SpriteSheetSpec } from "@/types/agent";

const MAP_IMAGE = "/2d/map.png";
const TRAP_IMAGE = "/2d/trap.png";
const WORLD_WIDTH = 1820;
const WORLD_HEIGHT = 1222;

const CHEST_SIZE = { width: 641, height: 620 };
const CHEST_SCALE = Math.min(1, 200 / 641);

const SPRITES: Record<string, SpriteSheetSpec> = {
  "lobster-idle": { src: "/2d/lobster-idle-1row3col.png", rows: 1, cols: 3 },
  "lobster-walk": {
    src: "/2d/lobster-walk-1row4col-irregular.png",
    rows: 1,
    cols: 4,
    irregular: true,
    offsetRight: 40,
  },
  "lobster-walkback": {
    src: "/2d/lobster-walkback-1row4col-13offsetright.png",
    rows: 1,
    cols: 4,
    offsetRight: 13,
  },
  "lobster-repair1": {
    src: "/2d/lobster-repair1-1row5col-8offsetleft.png",
    rows: 1,
    cols: 5,
    offsetLeft: 8,
  },
  "lobster-repair2": {
    src: "/2d/lobster-repair2-1row5col-10offsetleft.png",
    rows: 1,
    cols: 5,
    offsetLeft: 10,
  },
  "lobster-repair3": {
    src: "/2d/lobster-repair3-1row5col-irregular.png",
    rows: 1,
    cols: 5,
    irregular: true,
    offsetRight: 30,
  },
  "lobster-repair4": {
    src: "/2d/lobster-repair4-1row6col-irregular.png",
    rows: 1,
    cols: 6,
    irregular: true,
  },
  "lobster-repair5": { src: "/2d/lobster-repair5-1row7col.png", rows: 1, cols: 7 },
  "lobster-done": { src: "/2d/lobster-done-1row4col.png", rows: 1, cols: 4 },
  "crab-walk": { src: "/2d/crab-walk-2row8col.png", rows: 2, cols: 8 },
  "crab-pengsan": { src: "/2d/crab-pengsan-2row8col.png", rows: 2, cols: 8 },
  "crab-grab": { src: "/2d/crab-grab-1row7col.png", rows: 1, cols: 7 },
  "crab-done1": { src: "/2d/crab-done1-1row5col.png", rows: 1, cols: 5 },
  "crab-done2": { src: "/2d/crab-done2-1row5col.png", rows: 1, cols: 5 },
};

const LOBSTER_SPRITE_SCALE: Record<string, number> = {
  "lobster-idle": 0.5,
  "lobster-walk": 0.6,
  "lobster-walkback": 0.6,
  "lobster-repair1": 0.9,
  "lobster-repair2": 0.9,
  "lobster-repair3": 0.9,
  "lobster-repair4": 0.9,
  "lobster-repair5": 0.9,
  "lobster-done": 0.8,
};
const DEFAULT_AGENT_SCALE = 1.2;

export const DEFAULT_ITEM_POSITIONS: WorldItemPositions = {
  trap: { x: 250, y: 450, scale: 1.5 },
  chest: { x: 530, y: 830, scale: 200 / 641 },
  house: { x: 600, y: 200, scale: 1 },
};

const CHEST_IMAGES = {
  normal: "/2d/chest.png",
  bad: "/2d/chest-bad.png",
  nice: "/2d/chest-nice-1row5col.png",
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const DEMO_LOBSTER_SPAWN = { x: 951, y: 432 };
const DEMO_CRAB_SPAWN = { x: 923, y: 555 };
const TRAP_STOP_OFFSET_X = 200;
/** Crab stops lower (further down) than lobster at the trap. */
const CRAB_TRAP_OFFSET_Y = 80;

function agentTypeFromName(
  name: string,
  id: string,
  fallbackIndex: number
): "lobster" | "crab" {
  const s = `${name} ${id}`.toLowerCase();
  if (s.includes("alpha")) return "lobster";
  if (s.includes("beta")) return "crab";
  return fallbackIndex % 2 === 0 ? "lobster" : "crab";
}

type PhaseState = {
  phase: TestPhaseType;
  step: number;
  waitUntil: number;
  justSetTarget?: boolean;
};

export default function AgentWorld2D({
  registeredAgents = [],
  simulationSpeed = 1,
  itemPositions: itemPositionsProp,
  triggerAgentPhase: triggerAgentPhaseProp,
  onPhaseComplete,
}: AgentWorld2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [imagesReady, setImagesReady] = useState(false);

  const agentsRef = useRef<Map<string, Agent2D>>(new Map());
  const worldObjectsRef = useRef<Map<string, unknown>>(new Map());
  const itemPositions = itemPositionsProp ?? DEFAULT_ITEM_POSITIONS;

  const chestScale = itemPositions.chest.scale ?? CHEST_SCALE;
  const chestRef = useRef<Chest2D>({
    id: "chest-1",
    x: itemPositions.chest.x,
    y: itemPositions.chest.y,
    width: CHEST_SIZE.width * chestScale,
    height: CHEST_SIZE.height * chestScale,
    state: "normal",
  });
  const phaseRef = useRef<Map<string, PhaseState>>(new Map());
  const lastTriggerRef = useRef<string | null>(null);

  useEffect(() => {
    const scale = itemPositions.chest.scale ?? CHEST_SCALE;
    chestRef.current.x = itemPositions.chest.x;
    chestRef.current.y = itemPositions.chest.y;
    chestRef.current.width = CHEST_SIZE.width * scale;
    chestRef.current.height = CHEST_SIZE.height * scale;
  }, [itemPositions.chest.x, itemPositions.chest.y, itemPositions.chest.scale]);

  useEffect(() => {
    const allSrcs = [
      MAP_IMAGE,
      TRAP_IMAGE,
      CHEST_IMAGES.normal,
      CHEST_IMAGES.bad,
      CHEST_IMAGES.nice,
      ...Object.values(SPRITES).map((s) => s.src),
    ];
    const unique = [...new Set(allSrcs)];
    Promise.all(unique.map((src) => loadImage(src)))
      .then((imgs) => {
        const map = new Map<string, HTMLImageElement>();
        unique.forEach((src, i) => map.set(src, imgs[i]));
        imagesRef.current = map;
        setImagesReady(true);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const existing = agentsRef.current;
    const phaseMap = phaseRef.current;
    const ids = new Set(registeredAgents.map((a) => a.id));
    for (const id of existing.keys()) {
      if (!ids.has(id)) {
        existing.delete(id);
        phaseMap?.delete(id);
      }
    }
    registeredAgents.forEach((a, i) => {
      const agentType = agentTypeFromName(a.name, a.id, i);
      const isLobster = agentType === "lobster";
      const spawn = isLobster ? DEMO_LOBSTER_SPAWN : DEMO_CRAB_SPAWN;
      const defaultSpriteKey = isLobster ? "lobster-idle" : "crab-walk";
      const spec = SPRITES[defaultSpriteKey];
      const prev = existing.get(a.id);
      if (prev) {
        prev.name = a.name;
        prev.color = isLobster ? "#ff3b00" : "#fbbf24";
        prev.agentType = agentType;
        return;
      }
      const agent: Agent2D = {
        id: a.id,
        name: a.name,
        x: spawn.x,
        y: spawn.y,
        color: isLobster ? "#ff3b00" : "#fbbf24",
        shape: isLobster ? "square" : "circle",
        status: "idle",
        knowledgeAccessed: [],
        agentType,
        spriteKey: defaultSpriteKey,
        spriteSheet: spec,
        spriteFrame: 0,
        invert: false,
      };
      existing.set(a.id, agent);
    });
  }, [registeredAgents]);

  useEffect(() => {
    if (triggerAgentPhaseProp == null) return;
    const key = `${triggerAgentPhaseProp.agentId}:${triggerAgentPhaseProp.phase}`;
    if (lastTriggerRef.current === key) return;
    lastTriggerRef.current = key;
    const map = phaseRef.current;
    if (!map) return;
    map.delete(triggerAgentPhaseProp.agentId);
    map.set(triggerAgentPhaseProp.agentId, {
      phase: triggerAgentPhaseProp.phase,
      step: 0,
      waitUntil: 0,
    });
  }, [triggerAgentPhaseProp]);

  const setAgentTarget = useCallback((agentId: string, targetX: number, targetY: number) => {
    const agent = agentsRef.current.get(agentId);
    if (agent) {
      agent.targetX = targetX;
      agent.targetY = targetY;
      agent.status = "moving";
    }
  }, []);

  const setChestState = useCallback((state: "normal" | "bad" | "nice", frame?: number) => {
    const chest = chestRef.current;
    chest.state = state;
    chest.frame = frame ?? 0;
  }, []);

  const setAgentSprite = useCallback(
    (agentId: string, spriteKey: string, frame = 0, invert?: boolean) => {
      const agent = agentsRef.current.get(agentId);
      const spec = SPRITES[spriteKey];
      if (agent && spec) {
        agent.spriteKey = spriteKey;
        agent.spriteSheet = spec;
        agent.spriteFrame = frame;
        if (invert !== undefined) agent.invert = invert;
      }
    },
    []
  );

  const advanceTestPhase = useCallback(() => {
    const map = phaseRef.current;
    if (!map || map.size === 0) return;
    const now = Date.now();

    for (const [agentId, pr] of map.entries()) {
      const agent = agentsRef.current.get(agentId);
      if (!agent) continue;

      const agentType = agent.agentType ?? "lobster";
      const hasTarget =
        agent.targetX !== undefined && agent.targetY !== undefined;

      if (pr.justSetTarget && hasTarget) {
        pr.justSetTarget = false;
        continue;
      }

      const complete = () => {
        map.delete(agentId);
        lastTriggerRef.current = null;
        const at = agent.agentType ?? "lobster";
        setAgentSprite(
          agentId,
          at === "lobster" ? "lobster-idle" : "crab-walk",
          0,
          false
        );
        onPhaseComplete?.(agentId, pr.phase);
      };

      const setTargetAndWait = (x: number, y: number) => {
        setAgentTarget(agent.id, x, y);
        pr.justSetTarget = true;
      };

      const trapX = itemPositions.trap.x + TRAP_STOP_OFFSET_X;
      const trapY = itemPositions.trap.y;

      if (agentType === "lobster") {
        if (pr.phase === "encounter") {
          if (pr.step === 0) {
            setAgentSprite(agent.id, "lobster-walk", 0, true);
            setTargetAndWait(trapX, trapY);
            pr.step = 1;
          } else if (pr.step === 1 && !hasTarget) {
            setAgentSprite(agent.id, "lobster-repair1");
            pr.waitUntil = now + 400;
            pr.step = 2;
          } else if (pr.step === 2 && now >= pr.waitUntil) {
            setAgentSprite(agent.id, "lobster-repair2");
            pr.waitUntil = now + 400;
            pr.step = 3;
          } else if (pr.step === 3 && now >= pr.waitUntil) {
            setAgentSprite(agent.id, "lobster-repair3");
            pr.waitUntil = now + 400;
            pr.step = 4;
          } else if (pr.step === 4 && now >= pr.waitUntil) {
            complete();
          }
        } else if (pr.phase === "reading") {
          if (pr.step === 0) {
            setAgentSprite(agent.id, "lobster-walk", 0, true);
            setTargetAndWait(586, 702);
            pr.step = 1;
          } else if (pr.step === 1 && !hasTarget) {
            setChestState("bad");
            setAgentSprite(agent.id, "lobster-walkback", 0, true);
            pr.waitUntil = now + 1000;
            pr.step = 2;
          } else if (pr.step === 2 && now >= pr.waitUntil) {
            complete();
          }
        } else if (pr.phase === "finding") {
          if (pr.step === 0) {
            setAgentSprite(agent.id, "lobster-walkback", 0, true);
            setTargetAndWait(586, 452);
            pr.step = 1;
          } else if (pr.step === 1 && !hasTarget) {
            setAgentSprite(agent.id, "lobster-walk", 0, false);
            setTargetAndWait(842, 452);
            pr.step = 2;
          } else if (pr.step === 2 && !hasTarget) {
            setAgentSprite(agent.id, "lobster-repair5");
            pr.waitUntil = now + 2600;
            pr.step = 3;
          } else if (pr.step === 3 && now >= pr.waitUntil) {
            setAgentSprite(agent.id, "lobster-walk", 0, false);
            setTargetAndWait(842, 242);
            pr.step = 4;
          } else if (pr.step === 4 && !hasTarget) {
            setAgentSprite(agent.id, "lobster-done");
            pr.waitUntil = now + 1600;
            pr.step = 5;
          } else if (pr.step === 5 && now >= pr.waitUntil) {
            complete();
          }
        } else if (pr.phase === "publishing") {
          if (pr.step === 0) {
            setAgentSprite(agent.id, "lobster-walk", 0, false);
            setTargetAndWait(842, 334);
            pr.step = 1;
          } else if (pr.step === 1 && !hasTarget) {
            setAgentSprite(agent.id, "lobster-walk", 0, true);
            setTargetAndWait(590, 411);
            pr.step = 2;
          } else if (pr.step === 2 && !hasTarget) {
            setAgentSprite(agent.id, "lobster-walk", 0, false);
            setTargetAndWait(590, 676);
            pr.step = 3;
          } else if (pr.step === 3 && !hasTarget) {
            setChestState("normal");
            complete();
          }
        }
      } else if (agentType === "crab") {
        if (pr.phase === "encounter") {
          if (pr.step === 0) {
            setAgentSprite(agent.id, "crab-walk", 0, true);
            setTargetAndWait(itemPositions.trap.x + TRAP_STOP_OFFSET_X, trapY + CRAB_TRAP_OFFSET_Y);
            pr.step = 1;
          } else if (pr.step === 1 && !hasTarget) {
            setAgentSprite(agent.id, "crab-pengsan");
            pr.waitUntil = now + 1000;
            pr.step = 2;
          } else if (pr.step === 2 && now >= pr.waitUntil) complete();
        } else if (pr.phase === "reading") {
          if (pr.step === 0) {
            setAgentSprite(agent.id, "crab-walk", 0, false);
            setTargetAndWait(555, 765);
            pr.step = 1;
          } else if (pr.step === 1 && !hasTarget) {
            setChestState("nice", 0);
            setAgentSprite(agent.id, "crab-grab");
            pr.waitUntil = now + 600;
            pr.step = 2;
          } else if (pr.step === 2 && now >= pr.waitUntil) {
            setAgentSprite(agent.id, "crab-walk", 0, false);
            setTargetAndWait(555, 531);
            pr.step = 3;
          } else if (pr.step === 3 && !hasTarget) {
            setTargetAndWait(800, 531);
            pr.step = 4;
          } else if (pr.step === 4 && !hasTarget) {
            setTargetAndWait(800, 334);
            pr.step = 5;
          } else if (pr.step === 5 && !hasTarget) {
            setAgentSprite(agent.id, "crab-done1");
            pr.waitUntil = now + 400;
            pr.step = 6;
          } else if (pr.step === 6 && now >= pr.waitUntil) {
            setAgentSprite(agent.id, "crab-done2");
            complete();
          }
        } else if (pr.phase === "finding" || pr.phase === "publishing") {
          // Crab only has encounter and reading; skip finding/publishing
          complete();
        }
      }
    }
  }, [
    itemPositions.trap.x,
    itemPositions.trap.y,
    setAgentSprite,
    setAgentTarget,
    setChestState,
    onPhaseComplete,
  ]);

  const drawSpriteFrame = useCallback(
    (ctx: CanvasRenderingContext2D, agent: Agent2D, img: HTMLImageElement) => {
      const spec = agent.spriteSheet;
      if (!spec) return;
      const totalFrames = spec.rows * spec.cols;
      const frameIndex = Math.floor((agent.spriteFrame ?? 0) % totalFrames);
      const col = frameIndex % spec.cols;
      const row = Math.floor(frameIndex / spec.cols);
      const fw = img.naturalWidth / spec.cols;
      const fh = img.naturalHeight / spec.rows;
      let sx = col * fw;
      const sy = row * fh;
      if (spec.offsetLeft) sx += spec.offsetLeft;
      const sw =
        fw - (spec.offsetLeft ?? 0) - (spec.offsetRight ?? 0);
      const drawW = Math.min(sw, fw);
      const sxInt = Math.floor(sx);
      const syInt = Math.floor(sy);
      const swInt = Math.min(
        Math.ceil(drawW),
        img.naturalWidth - sxInt
      );
      const shInt = Math.min(
        Math.ceil(fh),
        img.naturalHeight - syInt
      );
      if (swInt <= 0 || shInt <= 0) return;
      const scale = agent.spriteKey
        ? LOBSTER_SPRITE_SCALE[agent.spriteKey] ?? DEFAULT_AGENT_SCALE
        : DEFAULT_AGENT_SCALE;
      const drawH = fh * scale;
      const drawWidth = drawW * scale;
      const dx = agent.x;
      const dy = agent.y;
      if (agent.invert) {
        ctx.save();
        ctx.translate(agent.x + drawWidth, agent.y);
        ctx.scale(-1, 1);
        ctx.translate(-agent.x, -agent.y);
        ctx.drawImage(img, sxInt, syInt, swInt, shInt, dx, dy, drawWidth, drawH);
        ctx.restore();
      } else {
        ctx.drawImage(img, sxInt, syInt, swInt, shInt, dx, dy, drawWidth, drawH);
      }
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesReady) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mapImg = imagesRef.current.get(MAP_IMAGE);
    const trapImg = imagesRef.current.get(TRAP_IMAGE);
    const chestNormal = imagesRef.current.get(CHEST_IMAGES.normal);
    const chestBad = imagesRef.current.get(CHEST_IMAGES.bad);
    const chestNice = imagesRef.current.get(CHEST_IMAGES.nice);

    const render = () => {
      ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      if (mapImg) {
        ctx.drawImage(mapImg, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      }

      const trapScale = itemPositions.trap.scale ?? 1.5;
      if (trapImg) {
        const tw = trapImg.naturalWidth * trapScale;
        const th = trapImg.naturalHeight * trapScale;
        ctx.drawImage(
          trapImg,
          itemPositions.trap.x,
          itemPositions.trap.y,
          tw,
          th
        );
      }

      const chest = chestRef.current;
      const cw = chest.width;
      const ch = chest.height;
      if (chest.state === "normal" && chestNormal) {
        ctx.drawImage(chestNormal, chest.x, chest.y, cw, ch);
      } else if (chest.state === "bad" && chestBad) {
        ctx.drawImage(chestBad, chest.x, chest.y, cw, ch);
      } else if (chest.state === "nice" && chestNice) {
        const cols = 5;
        const fw = chestNice.naturalWidth / cols;
        const fh = chestNice.naturalHeight;
        const cf = (chest.frame ?? 0) % cols;
        ctx.drawImage(chestNice, cf * fw, 0, fw, fh, chest.x, chest.y, cw, ch);
      }

      const house = itemPositions.house;
      const houseScale = house.scale ?? 1;
      const houseR = 28 * houseScale;
      ctx.fillStyle = "rgba(34, 197, 94, 0.5)";
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(house.x, house.y, houseR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("House", house.x, house.y + houseR + 14);

      const agents = Array.from(agentsRef.current.values());
      agents.forEach((agent) => {
        if (
          agent.targetX !== undefined &&
          agent.targetY !== undefined
        ) {
          const dx = agent.targetX - agent.x;
          const dy = agent.targetY - agent.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 4) {
            const speed = 6 * simulationSpeed;
            agent.x += (dx / dist) * speed;
            agent.y += (dy / dist) * speed;
          } else {
            agent.x = agent.targetX;
            agent.y = agent.targetY;
            agent.targetX = undefined;
            agent.targetY = undefined;
          }
        }

        if (
          agent.spriteKey &&
          (agent.spriteKey.includes("walk") ||
            agent.spriteKey.includes("grab") ||
            agent.spriteKey.includes("repair") ||
            agent.spriteKey.includes("done"))
        ) {
          const spec = agent.spriteSheet;
          if (spec) {
            const totalFrames = spec.rows * spec.cols;
            const msPerFrame = agent.spriteKey.includes("repair") ? 200 : 150;
            agent.spriteFrame =
              Math.floor(Date.now() / msPerFrame) % totalFrames;
          }
        }

        const img = agent.spriteKey
          ? imagesRef.current.get(SPRITES[agent.spriteKey]?.src)
          : null;
        if (img && agent.spriteSheet) {
          drawSpriteFrame(ctx, agent, img);
        } else {
          ctx.fillStyle = agent.color;
          ctx.beginPath();
          ctx.arc(agent.x, agent.y, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      if (chestRef.current.state === "nice") {
        chestRef.current.frame = Math.floor(Date.now() / 200) % 5;
      }

      if (phaseRef.current?.size) {
        advanceTestPhase();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [
    imagesReady,
    simulationSpeed,
    drawSpriteFrame,
    itemPositions,
    advanceTestPhase,
  ]);

  return (
    <div className="flex items-center justify-center bg-black/50 p-4">
      <canvas
        ref={canvasRef}
        width={WORLD_WIDTH}
        height={WORLD_HEIGHT}
        className="border-2 border-primary/30 rounded-lg max-w-full h-auto"
      />
    </div>
  );
}
