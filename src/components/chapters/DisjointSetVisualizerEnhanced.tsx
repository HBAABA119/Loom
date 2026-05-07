"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Node { id: number; parent: number; rank: number; }
interface Step { step: number; title: string; description: string; codeLines: number[]; nodes: Node[]; operation: string; explanation: string; theoryConnection: string; complexity: string; }

const speeds = [{ label: "0.5x", value: 0.5 }, { label: "1x", value: 1 }, { label: "1.5x", value: 1.5 }, { label: "2x", value: 2 }, { label: "3x", value: 3 }];

const codeLines = ["// Union-Find (Disjoint Set Union)", "class UnionFind {", "  constructor(n) {", "    this.parent = Array(n).fill(0).map((_, i) => i);", "    this.rank = Array(n).fill(0);", "  }", "", "  // Find root with path compression", "  find(x) {", "    if (this.parent[x] !== x) {", "      this.parent[x] = this.find(this.parent[x]);  // Compress", "    }", "    return this.parent[x];", "  }", "", "  // Union by rank", "  union(x, y) {", "    const px = this.find(x), py = this.find(y);", "    if (px === py) return false;  // Already connected", "", "    if (this.rank[px] < this.rank[py]) [px, py] = [py, px];", "    this.parent[py] = px;  // Attach smaller rank to larger", "    if (this.rank[px] === this.rank[py]) this.rank[px]++;", "    return true;", "  }", "}"];

const generateSteps = (): Step[] => [
  { step: 0, title: "Union-Find (Disjoint Set Union)", description: "Data structure for tracking connected components.", codeLines: [1, 2, 3, 4, 5], nodes: Array.from({ length: 6 }, (_, i) => ({ id: i, parent: i, rank: 0 })), operation: "init", explanation: "Union-Find tracks which elements are in the same set. Supports: 1) Find: which set is x in? 2) Union: merge sets of x and y. With optimizations: O(α(n)) ≈ O(1).", theoryConnection: "Union-Find used in: Kruskal's MST, Connected components, Cycle detection in undirected graphs, Percolation theory, Least common ancestor. Path compression + union by rank = inverse Ackermann complexity (effectively constant).", complexity: "Almost constant time per operation! O(α(n)) where α is inverse Ackermann (grows incredibly slowly: α(n) ≤ 4 for all practical n)." },
  { step: 1, title: "Initial State", description: "Each element is its own parent (separate sets).", codeLines: [3, 4], nodes: Array.from({ length: 6 }, (_, i) => ({ id: i, parent: i, rank: 0 })), operation: "init", explanation: "Initially: 6 separate sets {0}, {1}, {2}, {3}, {4}, {5}. Each node points to itself. Rank = 0 for all. 6 components.", theoryConnection: "Parent array encodes forest of trees. parent[x] = x means x is root. Each tree is a disjoint set. Initially n single-node trees.", complexity: "n separate sets. Space: O(n) for parent and rank arrays." },
  { step: 2, title: "Union(0, 1)", description: "Merge sets containing 0 and 1.", codeLines: [15, 16, 17, 18, 19, 20], nodes: [{ id: 0, parent: 0, rank: 1 }, { id: 1, parent: 0, rank: 0 }, { id: 2, parent: 2, rank: 0 }, { id: 3, parent: 3, rank: 0 }, { id: 4, parent: 4, rank: 0 }, { id: 5, parent: 5, rank: 0 }], operation: "union", explanation: "Union(0, 1): find(0)=0, find(1)=1. Ranks equal (0=0). Attach 1 to 0. rank[0]++ → 1. Set: {0,1}. 5 components remaining.", theoryConnection: "Union by rank: attach smaller rank tree under larger. When equal, pick arbitrarily and increment rank. Keeps trees shallow.", complexity: "O(α(n)) for union. 5 components now." },
  { step: 3, title: "Union(2, 3)", description: "Merge sets containing 2 and 3.", codeLines: [15, 16, 17, 18, 19, 20], nodes: [{ id: 0, parent: 0, rank: 1 }, { id: 1, parent: 0, rank: 0 }, { id: 2, parent: 2, rank: 1 }, { id: 3, parent: 2, rank: 0 }, { id: 4, parent: 4, rank: 0 }, { id: 5, parent: 5, rank: 0 }], operation: "union", explanation: "Union(2, 3): find(2)=2, find(3)=3. Ranks equal. Attach 3 to 2. rank[2]++ → 1. Sets: {0,1}, {2,3}. 4 components.", theoryConnection: "Another union. Two trees of size 2. Rank 1 for both roots. Structure remains balanced.", complexity: "Still O(α(n)). 4 components." },
  { step: 4, title: "Union(0, 2)", description: "Merge sets {0,1} and {2,3}. Different ranks!", codeLines: [15, 16, 17, 18, 19], nodes: [{ id: 0, parent: 0, rank: 1 }, { id: 1, parent: 0, rank: 0 }, { id: 2, parent: 0, rank: 1 }, { id: 3, parent: 2, rank: 0 }, { id: 4, parent: 4, rank: 0 }, { id: 5, parent: 5, rank: 0 }], operation: "union", explanation: "Union(0, 2): find(0)=0 (rank 1), find(2)=2 (rank 1). Ranks equal! Attach 2 to 0. rank[0]++ → 2. Set: {0,1,2,3}. Tree height still small!", theoryConnection: "Both rank 1, so attach arbitrarily. New root rank 2. Tree with 4 nodes, height only 2! Union by rank keeps trees balanced and shallow.", complexity: "O(α(n)). 3 components now. Tree height O(log n) guaranteed." },
  { step: 5, title: "Find(3) with Path Compression", description: "Find root of 3. Compress path for efficiency.", codeLines: [8, 9, 10, 11], nodes: [{ id: 0, parent: 0, rank: 2 }, { id: 1, parent: 0, rank: 0 }, { id: 2, parent: 0, rank: 1 }, { id: 3, parent: 0, rank: 0 }, { id: 4, parent: 4, rank: 0 }, { id: 5, parent: 5, rank: 0 }], operation: "find", explanation: "Find(3): 3 → 2 → 0. Root is 0. Path compression: parent[3] = 0 directly! Now 3 points to root. Future find(3) is O(1).", theoryConnection: "Path compression flattens tree during finds. Each node points directly to root (or near-root). Amortized complexity becomes inverse Ackermann - effectively constant.", complexity: "Path compressed! Future queries faster. Amortized O(α(n))." },
  { step: 6, title: "Union(4, 5) and Union(0, 4)", description: "Connect remaining components into one set.", codeLines: [15, 16, 17, 18, 19], nodes: [{ id: 0, parent: 0, rank: 2 }, { id: 1, parent: 0, rank: 0 }, { id: 2, parent: 0, rank: 1 }, { id: 3, parent: 0, rank: 0 }, { id: 4, parent: 0, rank: 1 }, { id: 5, parent: 4, rank: 0 }], operation: "union", explanation: "Union(4,5): attach 5 to 4. Union(0,4): find(0)=0 (rank 2), find(4)=4 (rank 1). 4 attaches to 0. All 6 nodes connected! One component.", theoryConnection: "Final union connects all. Union by rank: rank 2 > rank 1, so 4→0. All nodes now reachable from root 0. Tree height remains O(log n).", complexity: "All nodes connected! 1 component. Find: O(α(n)) ≈ O(1)." },
  { step: 7, title: "Check Connectivity", description: "Check if 1 and 5 are connected (same set).", codeLines: [8, 9, 10], nodes: [{ id: 0, parent: 0, rank: 2 }, { id: 1, parent: 0, rank: 0 }, { id: 2, parent: 0, rank: 1 }, { id: 3, parent: 0, rank: 0 }, { id: 4, parent: 0, rank: 1 }, { id: 5, parent: 0, rank: 0 }], operation: "find", explanation: "Connected(1,5)? find(1) = 0 (compressed). find(5) = 0 (compressed). Same root! Yes, connected. Path compression made both O(1).", theoryConnection: "After sufficient finds with path compression, almost all nodes point directly to root. Find becomes O(1). Union becomes O(α(n)) ≈ constant.", complexity: "Both find operations O(1) with compression. Total: O(1)." },
];

export default function DisjointSetVisualizerEnhanced() {
  const { currentStep: stepIndex, totalSteps, isPlaying, playbackSpeed, togglePlay, pause, setStep, nextStep, prevStep, setTotalSteps, setPlaybackSpeed } = useTimeline();
  
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => { setTotalSteps(generateSteps().length); }, [setTotalSteps]);
  useEffect(() => { setCurrentStep(stepIndex); }, [stepIndex]);
  const steps = generateSteps();
  const step = steps[currentStep] || steps[0];
  useEffect(() => { if (step?.codeLines) setActiveLines(step.codeLines); }, [step]);
  useEffect(() => { let interval: NodeJS.Timeout; if (isPlaying && currentStep < steps.length - 1) { interval = setInterval(() => nextStep(), 2500 / playbackSpeed); } else if (currentStep >= steps.length - 1 && isPlaying) pause(); return () => clearInterval(interval); }, [isPlaying, currentStep, steps.length, playbackSpeed, nextStep, pause]);
  const handleReset = useCallback(() => { pause(); setStep(0); }, [pause, setStep]);

  const getRoots = () => step.nodes.filter(n => n.parent === n.id);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div><h3 className="text-white font-semibold text-lg">Union-Find (Disjoint Set)</h3><p className="text-[#8b949e] text-sm">O(α(n)) ≈ O(1) | Path Compression | Union by Rank</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><Users size={14} className="text-[#58a6ff]" /><span className="text-[#8b949e] text-xs">Components:</span><span className="text-[#3fb950] font-bold">{getRoots().length}</span></div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full"><div className="h-full bg-[#58a6ff] rounded-full transition-all" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} /></div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          <div className="flex-1 flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
              {step.nodes.map((node, i) => {
                if (node.parent === node.id) return null;
                const parent = step.nodes.find(n => n.id === node.parent)!;
                return (<line key={`edge-${i}`} x1={(node.id % 3) * 100 + 100} y1={Math.floor(node.id / 3) * 80 + 50} x2={(parent.id % 3) * 100 + 100} y2={Math.floor(parent.id / 3) * 80 + 50} stroke="#238636" strokeWidth="2" />);
              })}
              {step.nodes.map((node, i) => (
                <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <circle cx={(node.id % 3) * 100 + 100} cy={Math.floor(node.id / 3) * 80 + 50} r={25} className={`transition-all ${node.parent === node.id ? "fill-[#3fb950] stroke-[#3fb950]" : "fill-[#21262d] stroke-[#30363d]"}`} strokeWidth="3" />
                  <text x={(node.id % 3) * 100 + 100} y={Math.floor(node.id / 3) * 80 + 50} textAnchor="middle" dominantBaseline="middle" className={`font-bold text-lg pointer-events-none ${node.parent === node.id ? "fill-white" : "fill-[#c9d1d9]"}`}>{node.id}</text>
                  <text x={(node.id % 3) * 100 + 100} y={Math.floor(node.id / 3) * 80 + 85} textAnchor="middle" className="text-xs fill-[#6e7681]">r:{node.rank}</text>
                </motion.g>
              ))}
            </svg>
          </div>
          <div className="mt-4 p-4 bg-[#21262d] rounded-lg border border-[#30363d]"><span className="text-[#8b949e] text-sm">Parent array: </span><span className="text-white font-mono">[{step.nodes.map(n => n.parent).join(", ")}]</span></div>
        </div>
        <div className="w-96 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-5 border-b border-[#30363d]"><span className="text-[#58a6ff] text-xs font-mono uppercase tracking-wider">Step {currentStep + 1}: {step.title}</span><p className="text-[#c9d1d9] mt-3 leading-relaxed">{step.description}</p></div>
          <div className="p-5 border-b border-[#30363d] flex-1 overflow-y-auto"><h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">What is Happening</h4><p className="text-[#c9d1d9] text-sm leading-relaxed mb-4">{step.explanation}</p><div className="mt-4 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg"><h4 className="text-[#3fb950] text-xs uppercase tracking-wider mb-1">💡 Theory Connection</h4><p className="text-[#c9d1d9] text-sm leading-relaxed">{step.theoryConnection}</p></div><div className="mt-4 p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg"><h4 className="text-[#58a6ff] text-xs uppercase tracking-wider mb-1">⏱️ Complexity</h4><p className="text-[#c9d1d9] text-sm font-mono">{step.complexity}</p></div></div>
          <div className="p-4 bg-[#0d1117] max-h-56 overflow-y-auto"><h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">Code Reference</h4><div className="text-xs font-mono">{codeLines.map((line, i) => (<div key={i} className={`px-2 py-0.5 rounded ${step.codeLines?.includes(i + 1) ? "bg-[#238636]/30 text-[#7ee787] border-l-2 border-[#238636]" : "text-[#8b949e]"}`}><span className="text-[#6e7681] w-6 inline-block select-none">{i + 1}</span>{line || " "}</div>))}</div></div>
        </div>
      </div>
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><button onClick={() => { pause(); setStep(0); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><SkipBack size={18} /></button><button onClick={prevStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><ChevronLeft size={20} /></button><button onClick={togglePlay} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center gap-2">{isPlaying ? <Pause size={18} /> : <Play size={18} />}{isPlaying ? "Pause" : "Play"}</button><button onClick={nextStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><ChevronRight size={20} /></button><button onClick={() => { pause(); setStep(steps.length - 1); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><SkipForward size={18} /></button><button onClick={handleReset} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><RotateCcw size={18} /></button></div>
          <div className="flex items-center gap-3"><span className="text-[#8b949e] text-sm">Speed:</span><div className="flex gap-1">{speeds.map(s => <button key={s.value} onClick={() => setPlaybackSpeed(s.value)} className={`px-2 py-1 rounded text-xs font-medium ${playbackSpeed === s.value ? "bg-[#58a6ff] text-white" : "bg-[#21262d] text-[#8b949e]"}`}>{s.label}</button>)}</div></div>
        </div>
      </div>
    </div>
  );
}
