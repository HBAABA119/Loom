"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  ChevronLeft, ChevronRight, Route, MapPin
} from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Node {
  id: string;
  x: number;
  y: number;
  dist: number;
  visited: boolean;
  isCurrent?: boolean;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
}

interface Step {
  step: number;
  title: string;
  description: string;
  codeLines: number[];
  nodes: Node[];
  edges: Edge[];
  pq: { node: string; dist: number }[];
  explanation: string;
  theoryConnection: string;
  complexity: string;
}

const speeds = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
];

const codeLines = [
  "// Dijkstra's Shortest Path Algorithm",
  "function dijkstra(graph, start) {",
  "  const dist = {};  // Distance from start",
  "  const visited = new Set();",
  "  const pq = new PriorityQueue();",
  "",
  "  // Initialize distances",
  "  for (const node in graph) {",
  "    dist[node] = Infinity;",
  "  }",
  "  dist[start] = 0;",
  "  pq.enqueue(start, 0);",
  "",
  "  while (!pq.isEmpty()) {",
  "    const [node, d] = pq.dequeue();",
  "",
  "    if (visited.has(node)) continue;",
  "    visited.add(node);",
  "",
  "    // Relax edges",
  "    for (const [neighbor, weight] of graph[node]) {",
  "      const newDist = dist[node] + weight;",
  "      if (newDist < dist[neighbor]) {",
  "        dist[neighbor] = newDist;",
  "        pq.enqueue(neighbor, newDist);",
  "      }",
  "    }",
  "  }",
  "",
  "  return dist;",
  "}",
];

const nodes: Node[] = [
  { id: "A", x: 100, y: 150, dist: 0, visited: false },
  { id: "B", x: 250, y: 80, dist: Infinity, visited: false },
  { id: "C", x: 400, y: 150, dist: Infinity, visited: false },
  { id: "D", x: 250, y: 220, dist: Infinity, visited: false },
  { id: "E", x: 550, y: 150, dist: Infinity, visited: false },
];

const edges: Edge[] = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "D", weight: 2 },
  { from: "B", to: "C", weight: 1 },
  { from: "B", to: "E", weight: 5 },
  { from: "D", to: "B", weight: 1 },
  { from: "D", to: "C", weight: 3 },
  { from: "D", to: "E", weight: 2 },
  { from: "C", to: "E", weight: 1 },
];

const generateSteps = (): Step[] => [
  {
    step: 0,
    title: "Dijkstra's Shortest Path Algorithm",
    description: "Find the shortest path from a start node to all other nodes in a weighted graph.",
    codeLines: [1, 2, 3, 4, 5],
    nodes: nodes.map(n => ({ ...n, dist: n.id === "A" ? 0 : Infinity, visited: false })),
    edges,
    pq: [{ node: "A", dist: 0 }],
    explanation: "Dijkstra's algorithm finds shortest paths from a source node to all other nodes. It uses a greedy approach, always picking the closest unvisited node next. Works for graphs with non-negative edge weights.",
    theoryConnection: "Dijkstra's is used in GPS navigation, network routing (OSPF protocol), and any shortest path problem. It's a greedy algorithm that makes locally optimal choices.",
    complexity: "Time: O((V + E) log V) with priority queue. Space: O(V) for distances and visited set."
  },
  {
    step: 1,
    title: "Initialize Distances",
    description: "Set distance to start node (A) = 0, all others = Infinity.",
    codeLines: [7, 8, 9, 10, 11],
    nodes: nodes.map(n => ({ ...n, dist: n.id === "A" ? 0 : Infinity, visited: false })),
    edges,
    pq: [{ node: "A", dist: 0 }],
    explanation: "Start from node A. dist[A] = 0 (we're already here). dist[B,C,D,E] = Infinity (unknown initially). Priority Queue: [(A, 0)].",
    theoryConnection: "Infinity represents unknown distance. As we explore, we update these values with actual shortest distances. A priority queue ensures we always process the closest node first.",
    complexity: "Initialization: O(V) to set all distances"
  },
  {
    step: 2,
    title: "Process Node A (distance 0)",
    description: "Dequeue A, mark visited. Relax edges to neighbors B and D.",
    codeLines: [13, 14, 15, 16, 17, 18, 19, 20, 21],
    nodes: nodes.map(n => ({ ...n, dist: n.id === "A" ? 0 : n.id === "B" ? 4 : n.id === "D" ? 2 : Infinity, visited: n.id === "A", isCurrent: n.id === "A" })),
    edges: edges.map(e => e.from === "A" ? { ...e } : e),
    pq: [{ node: "D", dist: 2 }, { node: "B", dist: 4 }],
    explanation: "Dequeue A (dist 0). Mark visited. Check neighbors: B via edge 4: newDist = 0+4 = 4 < Infinity ✓. D via edge 2: newDist = 0+2 = 2 < Infinity ✓. Add to PQ: D(2), B(4).",
    theoryConnection: "Relaxing edges: if we found a shorter path to a neighbor, update its distance. This is the core of Dijkstra - always keep the best known distance.",
    complexity: "Processed 2 edges from A. PQ now has 2 entries."
  },
  {
    step: 3,
    title: "Process Node D (distance 2)",
    description: "D is closest unvisited. Process edges to B, C, E.",
    codeLines: [13, 14, 15, 16, 17, 18, 19, 20, 21],
    nodes: nodes.map(n => ({ ...n, dist: n.id === "A" ? 0 : n.id === "B" ? 3 : n.id === "C" ? 5 : n.id === "D" ? 2 : n.id === "E" ? 4 : Infinity, visited: ["A", "D"].includes(n.id), isCurrent: n.id === "D" })),
    edges,
    pq: [{ node: "B", dist: 3 }, { node: "E", dist: 4 }, { node: "C", dist: 5 }],
    explanation: "Dequeue D (dist 2). Check neighbors: B via 1: newDist=2+1=3 < 4 ✓ (shorter!). C via 3: newDist=2+3=5 < Inf ✓. E via 2: newDist=2+2=4 < Inf ✓. Updated PQ: B(3), E(4), C(5).",
    theoryConnection: "Important update: Found shorter path to B! Via D (A→D→B = 3) is better than direct (A→B = 4). Dijkstra guarantees this is the shortest because D was closest unvisited node.",
    complexity: "Found shorter path to B. Updated 3 distances."
  },
  {
    step: 4,
    title: "Process Node B (distance 3)",
    description: "Process edges to C and E.",
    codeLines: [13, 14, 15, 16, 17, 18, 19, 20, 21],
    nodes: nodes.map(n => ({ ...n, dist: n.id === "A" ? 0 : n.id === "B" ? 3 : n.id === "C" ? 4 : n.id === "D" ? 2 : n.id === "E" ? 4 : Infinity, visited: ["A", "D", "B"].includes(n.id), isCurrent: n.id === "B" })),
    edges,
    pq: [{ node: "E", dist: 4 }, { node: "C", dist: 4 }],
    explanation: "Dequeue B (dist 3). Check neighbors: C via 1: newDist=3+1=4 < 5 ✓ (shorter!). E via 5: newDist=3+5=8 > 4 ✗ (skip). PQ: E(4), C(4).",
    theoryConnection: "Another shorter path found! C via B (A→D→B→C = 4) beats via D (A→D→C = 5). Dijkstra keeps improving distances until optimal.",
    complexity: "Updated C from 5 to 4. E unchanged (had better path via D)."
  },
  {
    step: 5,
    title: "Process Node E (distance 4)",
    description: "Process edge to C.",
    codeLines: [13, 14, 15, 16, 17],
    nodes: nodes.map(n => ({ ...n, dist: n.id === "A" ? 0 : n.id === "B" ? 3 : n.id === "C" ? 4 : n.id === "D" ? 2 : n.id === "E" ? 4 : Infinity, visited: ["A", "D", "B", "E"].includes(n.id), isCurrent: n.id === "E" })),
    edges,
    pq: [{ node: "C", dist: 4 }],
    explanation: "Dequeue E (dist 4). Check neighbor C via 1: newDist=4+1=5 > 4 ✗ (no improvement). PQ: C(4). E is now fully processed.",
    theoryConnection: "E's only unvisited neighbor is C, but we already have a shorter path to C (4 via B vs 5 via E). No update needed. Dijkstra only updates when we find improvement.",
    complexity: "No updates. PQ down to 1 element."
  },
  {
    step: 6,
    title: "Process Node C (distance 4)",
    description: "Last unvisited node. No unvisited neighbors.",
    codeLines: [13, 14, 15, 16, 17, 24],
    nodes: nodes.map(n => ({ ...n, dist: n.id === "A" ? 0 : n.id === "B" ? 3 : n.id === "C" ? 4 : n.id === "D" ? 2 : n.id === "E" ? 4 : Infinity, visited: true, isCurrent: n.id === "C" })),
    edges,
    pq: [],
    explanation: "Dequeue C (dist 4). All neighbors visited (B, D, E). No updates. PQ empty. Algorithm complete!",
    theoryConnection: "All nodes processed. Final shortest distances from A: A=0, D=2, B=3, C=4, E=4. These are guaranteed optimal (proof uses contradiction and non-negative weights).",
    complexity: "Algorithm complete! All 5 nodes processed."
  },
  {
    step: 7,
    title: "Final Shortest Paths",
    description: "All shortest paths from A have been found.",
    codeLines: [24],
    nodes: nodes.map(n => ({ ...n, dist: n.id === "A" ? 0 : n.id === "B" ? 3 : n.id === "C" ? 4 : n.id === "D" ? 2 : 4, visited: true })),
    edges,
    pq: [],
    explanation: "Final distances from A: A→A = 0, A→D = 2 (direct), A→B = 3 (via D), A→C = 4 (via D→B), A→E = 4 (via D). Shortest path tree formed!",
    theoryConnection: "Dijkstra constructs a shortest path tree. Each node's parent in this tree is the previous node on its shortest path from source. The greedy choice property guarantees optimality.",
    complexity: "Total: 7 edges relaxed, 5 nodes visited. O((V+E) log V) = O(12 log 5)."
  },
];

export default function ShortestPathVisualizerEnhanced() {
  const { 
    currentStep: stepIndex, 
    totalSteps, 
    isPlaying, 
    playbackSpeed,
    togglePlay, 
    pause,
    setStep, 
    nextStep, 
    prevStep,
    setTotalSteps,
    setPlaybackSpeed
  } = useTimeline();
  
  const { setActiveLines } = useCodeHighlight();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setTotalSteps(generateSteps().length);
  }, [setTotalSteps]);

  useEffect(() => {
    setCurrentStep(stepIndex);
  }, [stepIndex]);

  const steps = generateSteps();
  const step = steps[currentStep] || steps[0];

  useEffect(() => {
    if (step?.codeLines) {
      setActiveLines(step.codeLines);
    }
  }, [step, setActiveLines]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        nextStep();
      }, 2500 / playbackSpeed);
    } else if (currentStep >= steps.length - 1 && isPlaying) {
      pause();
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, playbackSpeed, nextStep, pause]);

  const handleReset = useCallback(() => {
    pause();
    setStep(0);
  }, [pause, setStep]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div>
          <h3 className="text-white font-semibold text-lg">Dijkstra's Shortest Path</h3>
          <p className="text-[#8b949e] text-sm">Greedy algorithm | O((V+E) log V) | Non-negative weights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <Route size={14} className="text-[#58a6ff]" />
            <span className="text-[#8b949e] text-xs">Visited:</span>
            <span className="text-[#3fb950] font-bold">{step.nodes.filter(n => n.visited).length}/{step.nodes.length}</span>
          </div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full">
            <div className="h-full bg-[#58a6ff] rounded-full transition-all" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visualization */}
        <div className="flex-1 flex flex-col p-6">
          {/* Graph */}
          <div className="flex-1 relative">
            <svg width="100%" height="100%" viewBox="0 0 650 300" preserveAspectRatio="xMidYMid meet">
              {/* Edges */}
              {step.edges.map((e, i) => {
                const from = step.nodes.find(n => n.id === e.from)!;
                const to = step.nodes.find(n => n.id === e.to)!;
                const fromVisited = from.visited;
                const toVisited = to.visited;
                const isInPath = fromVisited && toVisited;
                
                return (
                  <g key={i}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={isInPath ? "#238636" : "#30363d"} strokeWidth={isInPath ? "3" : "2"} />
                    <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 5} textAnchor="middle" className="text-sm fill-[#8b949e] font-bold">{e.weight}</text>
                  </g>
                );
              })}
              
              {/* Nodes */}
              {step.nodes.map(n => (
                <motion.g key={n.id} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <circle cx={n.x} cy={n.y} r={25} className={`transition-all ${n.isCurrent ? "fill-[#f0883e] stroke-[#f0883e]" : n.visited ? "fill-[#3fb950] stroke-[#3fb950]" : "fill-[#21262d] stroke-[#30363d]"}`} strokeWidth="3" />
                  <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle" className={`font-bold text-lg pointer-events-none ${n.visited || n.isCurrent ? "fill-white" : "fill-[#c9d1d9]"}`}>{n.id}</text>
                  <text x={n.x} y={n.y + 38} textAnchor="middle" className={`text-xs font-mono ${n.dist === Infinity ? "fill-[#6e7681]" : n.visited ? "fill-[#3fb950]" : "fill-[#f0883e]"}`}>
                    {n.dist === Infinity ? "∞" : n.dist}
                  </text>
                </motion.g>
              ))}
            </svg>
          </div>

          {/* Priority Queue */}
          <div className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="text-[#8b949e] text-sm mb-2">Priority Queue (min-heap by distance):</div>
            <div className="flex gap-2">
              {step.pq.length === 0 ? <span className="text-[#6e7681] italic">Empty</span> : step.pq.map((item, i) => (
                <div key={i} className="px-3 py-1 bg-[#58a6ff]/20 border border-[#58a6ff] rounded-lg">
                  <span className="text-[#58a6ff] font-bold">{item.node}:{item.dist}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#f0883e]" /><span className="text-[#8b949e]">Current</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#3fb950]" /><span className="text-[#8b949e]">Visited</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#21262d] border border-[#30363d]" /><span className="text-[#8b949e]">Unvisited</span></div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-5 border-b border-[#30363d]">
            <span className="text-[#58a6ff] text-xs font-mono uppercase tracking-wider">Step {currentStep + 1}: {step.title}</span>
            <p className="text-[#c9d1d9] mt-3 leading-relaxed">{step.description}</p>
          </div>
          <div className="p-5 border-b border-[#30363d] flex-1 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">What is Happening</h4>
            <p className="text-[#c9d1d9] text-sm leading-relaxed mb-4">{step.explanation}</p>
            <div className="mt-4 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg">
              <h4 className="text-[#3fb950] text-xs uppercase tracking-wider mb-1">💡 Theory Connection</h4>
              <p className="text-[#c9d1d9] text-sm leading-relaxed">{step.theoryConnection}</p>
            </div>
            <div className="mt-4 p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg">
              <h4 className="text-[#58a6ff] text-xs uppercase tracking-wider mb-1">⏱️ Complexity</h4>
              <p className="text-[#c9d1d9] text-sm font-mono">{step.complexity}</p>
            </div>
          </div>
          <div className="p-4 bg-[#0d1117] max-h-56 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">Code Reference</h4>
            <div className="text-xs font-mono">
              {codeLines.map((line, i) => (
                <div key={i} className={`px-2 py-0.5 rounded ${step.codeLines?.includes(i + 1) ? "bg-[#238636]/30 text-[#7ee787] border-l-2 border-[#238636]" : "text-[#8b949e]"}`}>
                  <span className="text-[#6e7681] w-6 inline-block select-none">{i + 1}</span>
                  {line || " "}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => { pause(); setStep(0); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><SkipBack size={18} /></button>
            <button onClick={prevStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><ChevronLeft size={20} /></button>
            <button onClick={togglePlay} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center gap-2">{isPlaying ? <Pause size={18} /> : <Play size={18} />}{isPlaying ? "Pause" : "Play"}</button>
            <button onClick={nextStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><ChevronRight size={20} /></button>
            <button onClick={() => { pause(); setStep(steps.length - 1); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><SkipForward size={18} /></button>
            <button onClick={handleReset} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><RotateCcw size={18} /></button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#8b949e] text-sm">Speed:</span>
            <div className="flex gap-1">
              {speeds.map(s => <button key={s.value} onClick={() => setPlaybackSpeed(s.value)} className={`px-2 py-1 rounded text-xs font-medium ${playbackSpeed === s.value ? "bg-[#58a6ff] text-white" : "bg-[#21262d] text-[#8b949e]"}`}>{s.label}</button>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
