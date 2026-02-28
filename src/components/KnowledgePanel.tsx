"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { Badge } from "@/components/ui/badge";
import { CATEGORY_COLORS, type Knowledge } from "@/data/knowledge";
import { Lock, Unlock, Loader2, FlaskConical, Terminal, ArrowUp, ArrowDown } from "lucide-react";
import { KNOWLEDGE_DATA } from "@/data/knowledge";
import { X402PaymentModal, type X402PaymentDetails } from "./X402PaymentModal";

interface KnowledgeModalProps {
  knowledge: Knowledge | null;
  onClose: () => void;
}

export function KnowledgeModal({ knowledge, onClose }: KnowledgeModalProps) {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"problem" | "solution" | "simulation">("problem");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  const [simulationStatus, setSimulationStatus] = useState<"idle" | "processing" | "success">("idle");
  const [hasNewSimulation, setHasNewSimulation] = useState(false);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [votes, setVotes] = useState({ up: 0, down: 0 });

  // x402 Payment state
  const [paymentDetails, setPaymentDetails] = useState<X402PaymentDetails | null>(null);

  useEffect(() => {
    if (knowledge) {
      const t = setTimeout(() => setVisible(true), 20);
      setActiveTab("problem");
      setPaymentStatus("idle");
      setSimulationStatus("idle");
      setHasNewSimulation(false);
      setUserVote(null);
      setVotes({ up: knowledge.upvotes, down: knowledge.downvotes });
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [knowledge]);

  
  const handleVote = (type: "up" | "down") => {
    if (!knowledge) return;
    
    const k = KNOWLEDGE_DATA.find(item => item.id === knowledge.id);
    if (!k) return;

    if (userVote === type) {
      setUserVote(null);
      if (type === "up") k.upvotes--;
      else k.downvotes--;
    } else {
      if (userVote === "up") k.upvotes--;
      if (userVote === "down") k.downvotes--;
      
      setUserVote(type);
      if (type === "up") k.upvotes++;
      else k.downvotes++;
    }
    
    setVotes({ up: k.upvotes, down: k.downvotes });
  };

  const handleUnlock = () => {
    if (!knowledge || !knowledge.isGated) return;
    
    setPaymentDetails({
      amount: knowledge.price || 0.50,
      recipient: `Agent-${knowledge.id.split('-')[1] || "A4X"}`,
      network: "Base (Coinbase)",
      description: `Unlock Knowledge Index ${knowledge.id}`,
      actionType: 'unlock'
    });
  };

  const handleSimulate = () => {
    if (!knowledge) return;
    
    setPaymentDetails({
      amount: 1.00,
      recipient: "MistralSec-01",
      network: "Base (Coinbase)",
      description: `Mistral Sandbox Simulation for ${knowledge.id}`,
      actionType: 'simulate'
    });
  };

  const handlePaymentSuccess = () => {
    if (paymentDetails?.actionType === 'unlock') {
      setUnlockedIds(prev => {
        const next = new Set(prev);
        if (knowledge) next.add(knowledge.id);
        return next;
      });
      setPaymentStatus("success");
    } else if (paymentDetails?.actionType === 'simulate') {
      setHasNewSimulation(true);
      setSimulationStatus("success");
      setActiveTab("simulation"); // Auto switch to simulation tab
    }
    setPaymentDetails(null);
  };

  const handlePaymentCancel = () => {
    setPaymentDetails(null);
  };

  if (!knowledge) return null;

  const [r, g, b] = CATEGORY_COLORS[knowledge.category];
  const categoryColor = `rgb(${r}, ${g}, ${b})`;
  const section = activeTab === "problem" ? knowledge.problem : knowledge.solution;
  const isLocked = activeTab === "solution" && knowledge.isGated && !unlockedIds.has(knowledge.id);
  const isSimulatedNow = knowledge.isSimulated || hasNewSimulation;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg mx-4 border-2 border-white/20 bg-[#0a0a0a] rounded-md shadow-[0_0_60px_rgba(255,59,0,0.15)] overflow-hidden transition-all duration-300 ${
          visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Header bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/60">
          <Badge
            variant="outline"
            className="text-[9px] px-2 py-0.5 uppercase tracking-wider font-bold"
            style={{ borderColor: categoryColor, color: categoryColor }}
          >
            {knowledge.category}
          </Badge>
          <span className="text-white/40 text-[10px] font-mono">{knowledge.id}</span>
          
          <div className="flex items-center gap-1 ml-1">
            {simulationStatus === "idle" && (
              <button
                onClick={handleSimulate}
                className="bg-primary/20 text-primary hover:bg-primary hover:text-black border border-primary/30 transition-colors text-[9px] uppercase tracking-wider font-bold flex items-center gap-1 py-0.5 px-2 rounded-full cursor-pointer"
                title="Run Mistral Sandbox Simulation"
              >
                <FlaskConical size={10} />
                Simulate ($1.00)
              </button>
            )}
            {simulationStatus === "processing" && (
              <Badge className="bg-primary/10 text-primary/70 hover:bg-primary/10 border border-primary/20 text-[9px] uppercase tracking-wider flex items-center gap-1 py-0 px-1.5 cursor-wait">
                <Loader2 size={10} className="animate-spin" />
                Simulating...
              </Badge>
            )}
          </div>

          <div className="flex-1" />
          {/* Vote Ratio Bar */}
          <div className="flex items-center gap-2 ml-auto mr-4">
            <button 
              onClick={() => handleVote("up")}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${userVote === "up" ? "text-green-400" : "text-white/40 hover:text-green-400"}`}
            >
              <ArrowUp size={10} />
            </button>
            <div className="w-20">
              <div className="flex justify-between text-[8px] font-mono text-white/50 mb-0.5">
                <span>{votes.up}</span>
                <span>{votes.down}</span>
              </div>
              <div className="h-1.5 w-full bg-red-500/30 rounded-full overflow-hidden flex cursor-pointer">
                <div 
                  className="bg-green-400 h-full transition-all duration-300 hover:bg-green-300"
                  style={{ width: `${votes.up + votes.down > 0 ? (votes.up / (votes.up + votes.down)) * 100 : 50}%` }}
                  onClick={() => handleVote("up")}
                />
                <div 
                  className="flex-1 h-full hover:bg-red-300 transition-colors cursor-pointer"
                  onClick={() => handleVote("down")}
                />
              </div>
            </div>
            <button 
              onClick={() => handleVote("down")}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${userVote === "down" ? "text-red-400" : "text-white/40 hover:text-red-400"}`}
            >
              <ArrowDown size={10} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-white/50 hover:text-white text-xs font-mono px-2 py-1 border border-white/20 hover:border-white/50 transition-colors rounded"
          >
            [x]
          </button>
        </div>

        {/* Title */}
        <div className="px-4 py-3 border-b border-white/5">
          <h3 className="text-sm font-bold text-white leading-snug">
            {knowledge.title}
          </h3>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("problem")}
            className={`flex-1 py-2 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors border-b-2 ${
              activeTab === "problem"
                ? "text-red-400 border-red-400 bg-red-400/5"
                : "text-white/40 border-transparent hover:text-white/60"
            }`}
          >
            Problem
          </button>
          <button
            onClick={() => setActiveTab("solution")}
            className={`flex-1 py-2 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors border-b-2 ${
              activeTab === "solution"
                ? "text-emerald-400 border-emerald-400 bg-emerald-400/5"
                : "text-white/40 border-transparent hover:text-white/60"
            }`}
          >
            Solution
            {knowledge.isGated && !unlockedIds.has(knowledge.id) && (
              <Lock size={12} className={activeTab === "solution" ? "text-emerald-400" : "text-white/40"} />
            )}
            {knowledge.isGated && unlockedIds.has(knowledge.id) && (
              <Unlock size={12} className={activeTab === "solution" ? "text-emerald-400" : "text-white/40"} />
            )}
          </button>
          
          {hasNewSimulation && (
            <button
              onClick={() => setActiveTab("simulation")}
              className={`flex-1 py-2 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors border-b-2 ${
                activeTab === "simulation"
                  ? "text-blue-400 border-blue-400 bg-blue-400/5"
                  : "text-white/40 border-transparent hover:text-white/60"
              }`}
            >
              Simulation
            </button>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 py-5 space-y-4" style={{ maxHeight: "380px", minHeight: "200px" }}>
          {activeTab === "simulation" ? (
            <div className="flex flex-col h-full space-y-4">
              <div className="bg-[#050505] border border-white/10 rounded font-mono text-[10px] text-white/70 p-3 leading-relaxed">
                <div className="text-blue-400 mb-2 flex items-center gap-2">
                  <Terminal size={12} />
                  Mistral Sandbox Env (v4.1.2)
                </div>
                <div>{`> initializing isolated container...`}</div>
                <div className="text-emerald-500">{`✓ container ready`}</div>
                <div>{`> injecting knowledge index ${knowledge.id}...`}</div>
                <div>{`> applying solution steps...`}</div>
                <div className="text-emerald-500">{`✓ steps applied successfully`}</div>
                <div>{`> running regression suite...`}</div>
                <div className="text-white/40 pl-2">
                  - tests/core/engine.spec.ts (PASS)<br/>
                  - tests/api/routes.spec.ts (PASS)<br/>
                  - tests/security/auth.spec.ts (PASS)
                </div>
                <div className="text-emerald-500 font-bold mt-2">{`>> SIMULATION OUTCOME: SUCCESS`}</div>
                <div className="text-white/50">{`>> Zero regressions detected. Safe to apply.`}</div>
              </div>
              <button 
                className="w-full bg-blue-500 hover:bg-blue-400 text-black font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-sm transition-colors mt-auto"
                onClick={() => {
                  alert("Adopted & Indexed via local agent.");
                  onClose();
                }}
              >
                Adopt & Index via My Agent
              </button>
            </div>
          ) : isLocked ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8 h-full">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                <Lock size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-1">Gated Solution</h4>
                <p className="text-white/60 text-xs max-w-xs mx-auto mb-4 leading-relaxed">
                  This solution requires an x402 micropayment to unlock. Your agent will handle the on-chain settlement via Coinbase facilitator.
                </p>
              </div>

              <div className="bg-black/50 border border-white/10 rounded p-3 text-left w-full max-w-[280px] mb-4 text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/40">Amount:</span>
                  <span className="text-emerald-400 font-bold">${knowledge.price?.toFixed(2) || "0.50"} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Recipient:</span>
                  <span className="text-white/80">Agent-{knowledge.id.split('-')[1] || "A4X"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Network:</span>
                  <span className="text-white/80">Base (Coinbase)</span>
                </div>
              </div>

              {paymentStatus === "idle" && (
                <button
                  onClick={handleUnlock}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-widest text-xs px-6 py-2.5 rounded-sm transition-colors w-full max-w-[280px]"
                >
                  Pay & Unlock
                </button>
              )}

              {paymentStatus === "processing" && (
                <button
                  disabled
                  className="bg-emerald-500/50 text-black font-bold uppercase tracking-widest text-xs px-6 py-2.5 rounded-sm flex items-center justify-center gap-2 w-full max-w-[280px]"
                >
                  <Loader2 size={14} className="animate-spin" />
                  Processing...
                </button>
              )}

              {paymentStatus === "failed" && (
                <div className="w-full max-w-[280px] space-y-2">
                  <p className="text-red-400 text-xs font-bold bg-red-400/10 border border-red-400/20 p-2 rounded">
                    Payment failed. Retrying required.
                  </p>
                  <button
                    onClick={handleUnlock}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-widest text-xs px-6 py-2.5 rounded-sm transition-colors w-full"
                  >
                    Retry Payment
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none text-xs text-white/80 leading-relaxed prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-headings:text-white/90">
              <ReactMarkdown>{section}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Category color accent line */}
        <div
          className="h-1"
          style={{ background: `linear-gradient(90deg, ${categoryColor}, transparent)` }}
        />
      </div>

      {/* x402 Payment Modal Layer */}
      <X402PaymentModal 
        details={paymentDetails} 
        onSuccess={handlePaymentSuccess} 
        onCancel={handlePaymentCancel} 
      />
    </div>
  );
}
