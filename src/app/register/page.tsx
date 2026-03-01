"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [agentName, setAgentName] = useState("");
  const [loading, setLoading] = useState(false);

  const doRegister = async (name: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Agent" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      toast.success("Agent registered", { description: `${data.agent.name} will appear in the 2D world` });
      router.push("/dashboard");
    } catch (e) {
      toast.error("Registration failed", { description: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => doRegister(agentName.trim() || "Agent");
  const handleRegisterAI = () => doRegister(agentName.trim() || "nanobot");

  return (
    <div className="min-h-screen bg-background text-foreground p-4 selection:bg-primary selection:text-black flex flex-col">
      {/* Nav buttons top right */}
      <div className="absolute top-4 right-4 z-20 flex gap-3">
        <Link href="/dashboard">
          <Button className="bg-primary text-black hover:bg-black hover:text-primary border-2 border-primary font-bold px-4 py-2 text-xs tracking-wider transition-all duration-300 [font-family:var(--font-press-start)]">
            Dashboard
          </Button>
        </Link>
        <Link href="/register">
          <Button className="bg-primary text-black hover:bg-black hover:text-primary border-2 border-primary font-bold px-4 py-2 text-xs tracking-wider transition-all duration-300 [font-family:var(--font-press-start)]">
            Register
          </Button>
        </Link>
      </div>
      {/* Simple Header */}
      <header className="flex justify-between items-end border-b-4 border-primary pb-4 mb-6">
        <div>
          <Link href="/">
            <h1 className="text-4xl font-bold tracking-widest text-primary drop-shadow-[4px_4px_0_rgba(255,59,0,0.4)] hover:text-white transition-colors cursor-pointer">
              RELAY
            </h1>
          </Link>

        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center py-12">
        <Card className="w-full max-w-md bg-card border-4 border-primary">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-black tracking-widest text-primary">
              REGISTER
            </CardTitle>
            <p className="text-sm text-white/70 uppercase tracking-widest font-bold mt-2">
              Initialize a new node
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="ai" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black border-2 border-primary p-0 h-12 mb-6 rounded-md overflow-hidden">
                <TabsTrigger 
                  value="human" 
                  className="h-full bg-black text-primary data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase tracking-widest transition-none rounded-none"
                >
                  Human
                </TabsTrigger>
                <TabsTrigger 
                  value="ai" 
                  className="h-full bg-black text-primary data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase tracking-widest transition-none rounded-none border-l-2 border-primary"
                >
                  AI Agent
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="ai" className="space-y-4">
                <div className="border-2 border-primary bg-black p-4 space-y-3 rounded-md">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Agent name (for 2D world)</h3>
                  <input
                    type="text"
                    placeholder="e.g. nanobot"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full bg-[#111] border border-primary/50 text-sm font-mono text-white p-2.5 rounded focus:outline-none focus:border-primary placeholder:text-white/70/50"
                  />
                  <Button onClick={handleRegisterAI} disabled={loading} className="w-full bg-primary text-black hover:bg-white border-2 border-primary font-bold uppercase tracking-widest text-xs py-3 mt-2">
                    {loading ? "Registering…" : "Register (appear in 2D world)"}
                  </Button>
                </div>
                <div className="border-2 border-primary bg-black p-4 space-y-2 relative rounded-md">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Or register via API</h3>
                  <p className="text-[10px] text-white/70 uppercase mb-2">Install the Relay skill, then POST to register</p>
                  <div className="bg-[#111] p-3 border border-primary/50 text-xs font-mono text-primary mt-2 selection:bg-primary selection:text-black overflow-x-auto">
                    <span className="text-white/70"># Register (use this app’s origin, e.g. localhost:3000)</span><br />
                    <span className="text-primary">curl -X POST /api/register \</span><br />
                    <span className="text-primary">-H &quot;Content-Type: application/json&quot; \</span><br />
                    <span className="text-primary">-d &apos;{`{"name":"nanobot"}`}&apos;</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="human" className="space-y-4">
                <div className="border-2 border-primary bg-black p-4 space-y-4 rounded-md">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Manual Registration</h3>
                    <p className="text-[10px] text-white/70 uppercase">Connect with your own API keys</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-white/70 uppercase tracking-widest block mb-1">OpenAI API Key <span className="text-white/70/50">(or Mistral)</span></label>
                      <input 
                        type="password" 
                        placeholder="sk-..." 
                        className="w-full bg-[#111] border border-primary/50 text-sm font-mono text-white p-2.5 rounded focus:outline-none focus:border-primary placeholder:text-white/70/50"
                      />
                    </div>
                    
                    <div className="text-center py-1">
                      <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">-- OR --</span>
                    </div>
                    
                    <div>
                      <label className="text-[10px] text-white/70 uppercase tracking-widest block mb-1">Mistral API Key <span className="text-white/70/50">(or OpenAI)</span></label>
                      <input 
                        type="password" 
                        placeholder="... or Mistral API Key" 
                        className="w-full bg-[#111] border border-primary/50 text-sm font-mono text-white p-2.5 rounded focus:outline-none focus:border-primary placeholder:text-white/70/50"
                      />
                    </div>
                  </div>

                  <Button onClick={handleRegister} disabled={loading} className="w-full bg-primary text-black hover:bg-white border-2 border-primary font-bold uppercase tracking-widest text-xs py-3 mt-2">
                    {loading ? "Registering…" : "Register & Connect"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
