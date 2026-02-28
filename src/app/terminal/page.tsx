"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LogEntry {
  id: number;
  type: "command" | "output" | "index" | "feedback";
  content: string;
  timestamp: Date;
  indexed?: {
    title: string;
    source: string;
    preview: string;
    votes?: { up: number; down: number };
    userVote?: "up" | "down" | null;
  };
}

// Knowledge item component with voting
function IndexedItem({ 
  entry, 
  onVote 
}: { 
  entry: LogEntry; 
  onVote: (id: number, vote: "up" | "down") => void;
}) {
  if (!entry.indexed) return null;
  
  return (
    <div className="border border-primary/30 rounded-md bg-black/60 overflow-hidden my-2">
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-primary truncate">{entry.indexed.title}</h4>
            <p className="text-[10px] text-white/70 font-mono">{entry.indexed.source}</p>
          </div>
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 text-[10px] shrink-0">
            indexed
          </Badge>
        </div>
        <p className="text-xs text-white/70 line-clamp-2">{entry.indexed.preview}</p>
        
        {/* Voting */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
          <span className="text-[10px] text-white/70 uppercase tracking-wider">Feedback:</span>
          <button
            onClick={() => onVote(entry.id, "up")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              entry.indexed.userVote === "up" 
                ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/50" 
                : "bg-white/5 text-white/70 hover:bg-white/10 border border-transparent"
            }`}
          >
            <span>+</span>
            <span>{entry.indexed.votes?.up || 0}</span>
          </button>
          <button
            onClick={() => onVote(entry.id, "down")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              entry.indexed.userVote === "down" 
                ? "bg-red-500/20 text-red-500 border border-red-500/50" 
                : "bg-white/5 text-white/70 hover:bg-white/10 border border-transparent"
            }`}
          >
            <span>-</span>
            <span>{entry.indexed.votes?.down || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TerminalPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Simulate initial boot sequence
  useEffect(() => {
    const bootSequence = async () => {
      const bootMessages = [
        { type: "output" as const, content: "RELAY Terminal v1.0.0" },
        { type: "output" as const, content: "Connecting to agent..." },
        { type: "output" as const, content: "Agent online. Ready for commands." },
        { type: "output" as const, content: "" },
        { type: "output" as const, content: "Commands:" },
        { type: "output" as const, content: "  index <url>    - Index a knowledge source" },
        { type: "output" as const, content: "  list           - List indexed knowledge" },
        { type: "output" as const, content: "  status         - Show agent status" },
        { type: "output" as const, content: "  clear          - Clear terminal" },
        { type: "output" as const, content: "" },
      ];

      for (let i = 0; i < bootMessages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setLogs(prev => [...prev, {
          id: Date.now() + i,
          ...bootMessages[i],
          timestamp: new Date()
        }]);
      }
    };

    bootSequence();
  }, []);

  const handleVote = (id: number, vote: "up" | "down") => {
    setLogs(prev => prev.map(log => {
      if (log.id === id && log.indexed) {
        const currentVote = log.indexed.userVote;
        const votes = { 
          up: log.indexed.votes?.up ?? 0, 
          down: log.indexed.votes?.down ?? 0 
        };
        
        // Toggle vote
        if (currentVote === vote) {
          // Remove vote
          votes[vote] = Math.max(0, votes[vote] - 1);
          return { ...log, indexed: { ...log.indexed, votes, userVote: null } };
        } else {
          // Add new vote, remove old if exists
          if (currentVote) {
            votes[currentVote] = Math.max(0, votes[currentVote] - 1);
          }
          votes[vote] = votes[vote] + 1;
          return { ...log, indexed: { ...log.indexed, votes, userVote: vote } };
        }
      }
      return log;
    }));
  };

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    // Add command to logs
    setLogs(prev => [...prev, {
      id: Date.now(),
      type: "command",
      content: cmd,
      timestamp: new Date()
    }]);

    setIsProcessing(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (trimmedCmd === "clear") {
      setLogs([]);
      setIsProcessing(false);
      return;
    }

    if (trimmedCmd === "status") {
      setLogs(prev => [...prev, {
        id: Date.now(),
        type: "output",
        content: "Agent: relay-bot-aewo | Status: Online | Indexed: 1,402 entries",
        timestamp: new Date()
      }]);
      setIsProcessing(false);
      return;
    }

    if (trimmedCmd === "list") {
      setLogs(prev => [...prev, {
        id: Date.now(),
        type: "output",
        content: "Fetching indexed knowledge...",
        timestamp: new Date()
      }]);

      await new Promise(resolve => setTimeout(resolve, 300));

      // Add some example indexed items
      const examples = [
        {
          title: "React Server Components",
          source: "https://react.dev/reference/rsc",
          preview: "Server Components let you write UI that can be rendered on the server..."
        },
        {
          title: "Next.js App Router",
          source: "https://nextjs.org/docs/app",
          preview: "The App Router is a new paradigm for building applications using React's latest features..."
        }
      ];

      for (const example of examples) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setLogs(prev => [...prev, {
          id: Date.now() + Math.random(),
          type: "index",
          content: "",
          timestamp: new Date(),
          indexed: {
            ...example,
            votes: { up: Math.floor(Math.random() * 10), down: Math.floor(Math.random() * 3) },
            userVote: null
          }
        }]);
      }

      setIsProcessing(false);
      return;
    }

    if (trimmedCmd.startsWith("index ")) {
      const url = cmd.slice(6).trim();
      
      // Validation
      if (!url) {
        setLogs(prev => [...prev, {
          id: Date.now(),
          type: "output",
          content: "Error: Please provide a URL to index",
          timestamp: new Date()
        }]);
        setIsProcessing(false);
        return;
      }

      // Simulate indexing process
      const steps = [
        `Fetching ${url}...`,
        "Parsing content...",
        "Extracting knowledge...",
        "Generating embeddings...",
        "Storing in knowledge base..."
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setLogs(prev => [...prev, {
          id: Date.now() + Math.random(),
          type: "output",
          content: step,
          timestamp: new Date()
        }]);
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      // Add indexed item
      setLogs(prev => [...prev, {
        id: Date.now(),
        type: "index",
        content: "",
        timestamp: new Date(),
        indexed: {
          title: url.includes("github") ? "GitHub Repository" : "Web Page",
          source: url,
          preview: "Successfully indexed content from the provided URL. The knowledge has been added to the agent's memory.",
          votes: { up: 0, down: 0 },
          userVote: null
        }
      }]);

      setLogs(prev => [...prev, {
        id: Date.now() + 1,
        type: "output",
        content: "Done! Knowledge indexed successfully.",
        timestamp: new Date()
      }]);

      setIsProcessing(false);
      return;
    }

    // Unknown command
    setLogs(prev => [...prev, {
      id: Date.now(),
      type: "output",
      content: `Unknown command: ${cmd}. Type 'help' for available commands.`,
      timestamp: new Date()
    }]);
    
    setIsProcessing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    executeCommand(input);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center border-b-4 border-[#fbbf24] p-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" className="border-2 border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24] hover:text-black font-bold uppercase text-xs">
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold tracking-widest text-[#fbbf24] uppercase">Terminal</h1>
        </div>
        <Badge className="bg-[#fbbf24] text-black font-bold">
          relay-bot-aewo
        </Badge>
      </header>

      {/* TERMINAL */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex-1 bg-black/60 border-2 border-[#fbbf24]/30 rounded-md overflow-hidden flex flex-col">
          {/* Terminal output */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1">
            {logs.map((log) => (
              <div key={log.id}>
                {log.type === "command" && (
                  <div className="flex gap-2">
                    <span className="text-[#fbbf24]">{">"}</span>
                    <span className="text-white">{log.content}</span>
                  </div>
                )}
                {log.type === "output" && (
                  <div className="text-white/70 pl-4">{log.content}</div>
                )}
                {log.type === "index" && (
                  <IndexedItem entry={log} onVote={handleVote} />
                )}
              </div>
            ))}
            {isProcessing && (
              <div className="text-white/70 pl-4 animate-pulse">Processing...</div>
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t-2 border-[#fbbf24]/30 bg-black/80">
            <div className="flex items-center">
              <span className="text-[#fbbf24] pl-4 font-mono">{">"}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isProcessing}
                placeholder={isProcessing ? "Processing..." : "Enter command..."}
                className="flex-1 bg-transparent text-white px-2 py-3 font-mono text-sm focus:outline-none placeholder:text-white/70 disabled:opacity-50"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
