"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft, ChevronRight, GitBranch } from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Node { id: string; x: number; y: number; inMST: boolean; }
interface Edge { from: string; to: string; weight: number; inMST: boolean; considering: boolean; }
interface Step { step: number; title: string; description: string; codeLines: number[]; nodes: Node[]; edges: Edge[]; mstWeight: number; explanation: string; theoryConnection: string; complexity: string; }

const speeds = [{ label: "0.5x", value: 0.5 }, { label: "1x", value: 1 }, { label: "1.5x", value: 1.5 }, { label: "2x", value: 2 }, { label: "3x", value: 3 }];

const codeLines = ["// Kruskal's MST Algorithm", "function kruskal(edges, n) {", "  edges.sort((a, b) => a.weight - b.weight);", "  const uf = new UnionFind(n);", "  const mst = [];", "  let weight = 0;", "", "  for (const edge of edges) {", "    if (!uf.connected(edge.u, edge.v)) {", "      uf.union(edge.u, edge.v);", "      mst.push(edge);", "      weight += edge.weight;", "      if (mst.length === n - 1) break;", "    }", "  }", "", "  return { mst, weight };", "}"];

const nodes: Node[] = [{ id: "A", x: 100, y: 150, inMST: false }, { id: "B", x: 250, y: 80, inMST: false }, { id: "C", x: 400, y: 150, inMST: false }, { id: "D", x: 250, y: 220, inMST: false },];

const edges: Edge[] = [{ from: "A", to: "B", weight: 3, inMST: false, considering: false }, { from: "A", to: "D", weight: 1, inMST: false, considering: false }, { from: "B", to: "C", weight: 1, inMST: false, considering: false }, { from: "B", to: "D", weight: 3, inMST: false, considering: false }, { from: "C", to: "D", weight: 1, inMST: false, considering: false },];

const generateSteps = (): Step[] => [
  { step: 0, title: "Minimum Spanning Tree (MST)", description: "Find the minimum weight tree connecting all vertices.", codeLines: [1, 2, 3], nodes: nodes.map(n => ({ ...n })), edges: edges.map(e => ({ ...e })), mstWeight: 0, explanation: "MST connects all vertices with minimum total edge weight. No cycles allowed. For n vertices, MST has exactly n-1 edges.", theoryConnection: "MST used in: Network design (minimize cable length), Cluster analysis, Approximation algorithms. Kruskal's and Prim's are two main algorithms.", complexity: "Kruskal's: O(E log E) for sorting. Union-Find makes cycle detection fast." },
  { step: 1, title: "Sort Edges by Weight", description: "Sort all edges in ascending order of weight.", codeLines: [3], nodes: nodes.map(n => ({ ...n })), edges: [{ ...edges[1], considering: true }, { ...edges[2], considering: true }, { ...edges[4], considering: true }, edges[0], edges[3]], mstWeight: 0, explanation: "Sort edges: (A-D, 1), (B-C, 1), (C-D, 1), (A-B, 3), (B-D, 3). Process from lightest to heaviest. Greedy approach works for MST!", theoryConnection: "Greedy choice: lightest edges first. Cut property proves greedy works - cheapest edge across any cut is in some MST.", complexity: "Sorting: O(E log E) where E = number of edges" },
  { step: 2, title: "Add Edge A-D (weight 1)", description: "Lightest edge. A and D are separate components. Add to MST.", codeLines: [7, 8, 9, 10, 11], nodes: [{ ...nodes[0], inMST: true }, { ...nodes[3], inMST: true }, nodes[1], nodes[2]], edges: [{ ...edges[1], inMST: true, considering: false }, edges[2], edges[4], edges[0], edges[3]], mstWeight: 1, explanation: "A-D has weight 1 (lightest). A and D in different components. Add to MST. MST now connects 2 nodes. Total weight = 1.", theoryConnection: "Union-Find tracks components. Initially each node is its own set. Union merges sets. Find checks if two nodes are connected.", complexity: "Union operation: O(α(n)) amortized, effectively constant" },
  { step: 3, title: "Add Edge B-C (weight 1)", description: "Next lightest. B and C are separate. Add to MST.", codeLines: [7, 8, 9, 10, 11], nodes: [{ ...nodes[0], inMST: true }, { ...nodes[1], inMST: true }, { ...nodes[2], inMST: true }, { ...nodes[3], inMST: true }], edges: [{ ...edges[1], inMST: true }, { ...edges[2], inMST: true, considering: false }, edges[4], edges[0], edges[3]], mstWeight: 2, explanation: "B-C has weight 1. B and C in different components. Add to MST. Now we have two separate trees: {A,D} and {B,C}. Total weight = 2.", theoryConnection: "Forest growing approach. Each component is a tree. Eventually they all connect. MST has n-1 = 3 edges for 4 nodes.", complexity: "2 edges added, 1 more needed to complete MST" },
  { step: 4, title: "Skip Edge A-B (weight 3)", description: "Check next edge. A and D are connected, B and C are connected. A-B connects these two components.", codeLines: [7, 8, 9, 10, 11, 12], nodes: [{ ...nodes[0], inMST: true }, { ...nodes[1], inMST: true }, { ...nodes[2], inMST: true }, { ...nodes[3], inMST: true }], edges: [{ ...edges[1], inMST: true }, { ...edges[2], inMST: true }, { ...edges[4], inMST: true, considering: true }, edges[0], edges[3]], mstWeight: 3, explanation: "C-D has weight 1. D in {A,D}, C in {B,C}. Different components! Add to MST. All 4 nodes now connected! MST complete with 3 edges. Total weight = 3.", theoryConnection: "MST complete! All vertices connected with minimum weight (3). Cycle check prevented any cycles. Tree spans all vertices.", complexity: "MST complete! 3 edges, total weight = 3 (minimum possible)" },
  { step: 5, title: "Skip Remaining Edges", description: "Process remaining edges but skip those that would form cycles.", codeLines: [7, 8, 9], nodes: [{ ...nodes[0], inMST: true }, { ...nodes[1], inMST: true }, { ...nodes[2], inMST: true }, { ...nodes[3], inMST: true }], edges: [{ ...edges[1], inMST: true }, { ...edges[2], inMST: true }, { ...edges[4], inMST: true }, { ...edges[0], considering: true }, edges[3]], mstWeight: 3, explanation: "A-B (weight 3): A and B now connected (via A-D-C-B). Would form cycle A-D-C-B-A. Skip! B-D would also form cycle. Skip.", theoryConnection: "Cycle detection is crucial. Without it, we'd have cycles and higher weight. Union-Find makes this O(1) per check.", complexity: "Skipped 2 edges that would form cycles" },
  { step: 6, title: "MST Complete!", description: "Final MST connects all 4 nodes with minimum weight 3.", codeLines: [16, 17], nodes: [{ ...nodes[0], inMST: true }, { ...nodes[1], inMST: true }, { ...nodes[2], inMST: true }, { ...nodes[3], inMST: true }], edges: [{ ...edges[1], inMST: true }, { ...edges[2], inMST: true }, { ...edges[4], inMST: true }, edges[0], edges[3]], mstWeight: 3, explanation: "Final MST edges: A-D (1), B-C (1), C-D (1). Total weight = 3. Tree spans all 4 vertices. No cycles. Minimum possible weight!", theoryConnection: "Kruskal's guarantees minimum weight MST. Greedy choice of lightest edges works due to cut property. Runtime dominated by sorting: O(E log E).", complexity: "Final MST: 3 edges, weight = 3, spans 4 vertices" },
];

export default function MSTVisualizerEnhanced() {
  const { currentStep: stepIndex, totalSteps, isPlaying, playbackSpeed, togglePlay, pause, setStep, nextStep, prevStep, setTotalSteps, setPlaybackSpeed } = useTimeline();
  const { setActiveLines } = useCodeHighlight();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => { setTotalSteps(generateSteps().length); }, [setTotalSteps]);
  useEffect(() => { setCurrentStep(stepIndex); }, [stepIndex]);
  const steps = generateSteps();
  const step = steps[currentStep] || steps[0];
  useEffect(() => { if (step?.codeLines) setActiveLines(step.codeLines); }, [step]);
  useEffect(() => { let interval: NodeJS.Timeout; if (isPlaying && currentStep < steps.length - 1) { interval = setInterval(() => nextStep(), 2500 / playbackSpeed); } else if (currentStep >= steps.length - 1 && isPlaying) pause(); return () => clearInterval(interval); }, [isPlaying, currentStep, steps.length, playbackSpeed, nextStep, pause]);
  const handleReset = useCallback(() => { pause(); setStep(0); }, [pause, setStep]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div><h3 className="text-white font-semibold text-lg">Minimum Spanning Tree (Kruskal&apos;s)</h3><p className="text-[#8b949e] text-sm">Greedy | O(E log E) | Union-Find</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><GitBranch size={14} className="text-[#58a6ff]" /><span className="text-[#8b949e] text-xs">MST Weight:</span><span className="text-[#3fb950] font-bold">{step.mstWeight}</span></div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full"><div className="h-full bg-[#58a6ff] rounded-full transition-all" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} /></div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          <div className="flex-1 relative">
            <svg width="100%" height="100%" viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet">
              {step.edges.map((e, i) => {
                const from = step.nodes.find(n => n.id === e.from)!;
                const to = step.nodes.find(n => n.id === e.to)!;
                return (<g key={i}><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={e.inMST ? "#238636" : e.considering ? "#f0883e" : "#30363d"} strokeWidth={e.inMST ? "4" : "2"} /><text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8} textAnchor="middle" className={`text-sm font-bold ${e.inMST ? "fill-[#3fb950]" : e.considering ? "fill-[#f0883e]" : "fill-[#8b949e]"}`}>{e.weight}</text></g>);
              })}
              {step.nodes.map(n => (<motion.g key={n.id} initial={{ scale: 0 }} animate={{ scale: 1 }}><circle cx={n.x} cy={n.y} r={25} className={`transition-all ${n.inMST ? "fill-[#3fb950] stroke-[#3fb950]" : "fill-[#21262d] stroke-[#30363d]"}`} strokeWidth="3" /><text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle" className={`font-bold text-lg pointer-events-none ${n.inMST ? "fill-white" : "fill-[#c9d1d9]"}`}>{n.id}</text></motion.g>))}
            </svg>
          </div>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2"><div className="w-4 h-1 bg-[#238636]" /><span className="text-[#8b949e]">In MST</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-1 bg-[#f0883e]" /><span className="text-[#8b949e]">Considering</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-1 bg-[#30363d]" /><span className="text-[#8b949e]">Not in MST</span></div>
          </div>
        </div>
        <div className="w-96 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-5 border-b border-[#30363d]"><span className="text-[#58a6ff] text-xs font-mono uppercase tracking-wider">Step {currentStep + 1}: {step.title}</span><p className="text-[#c9d1d9] mt-3 leading-relaxed">{step.description}</p></div>
          <div className="p-5 border-b border-[#30363d] flex-1 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">What is Happening</h4><p className="text-[#c9d1d9] text-sm leading-relaxed mb-4">{step.explanation}</p>
            <div className="mt-4 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg"><h4 className="text-[#3fb950] text-xs uppercase tracking-wider mb-1">💡 Theory Connection</h4><p className="text-[#c9d1d9] text-sm leading-relaxed">{step.theoryConnection}</p></div>
            <div className="mt-4 p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg"><h4 className="text-[#58a6ff] text-xs uppercase tracking-wider mb-1">⏱️ Complexity</h4><p className="text-[#c9d1d9] text-sm font-mono">{step.complexity}</p></div>
          </div>
          <div className="p-4 bg-[#0d1117] max-h-56 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">Code Reference</h4>
            <div className="text-xs font-mono">{codeLines.map((line, i) => (<div key={i} className={`px-2 py-0.5 rounded ${step.codeLines?.includes(i + 1) ? "bg-[#238636]/30 text-[#7ee787] border-l-2 border-[#238636]" : "text-[#8b949e]"}`}><span className="text-[#6e7681] w-6 inline-block select-none">{i + 1}</span>{line || " "}</div>))}</div>
          </div>
        </div>
      </div>
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
          <div className="flex items-center gap-3"><span className="text-[#8b949e] text-sm">Speed:</span><div className="flex gap-1">{speeds.map(s => <button key={s.value} onClick={() => setPlaybackSpeed(s.value)} className={`px-2 py-1 rounded text-xs font-medium ${playbackSpeed === s.value ? "bg-[#58a6ff] text-white" : "bg-[#21262d] text-[#8b949e]"}`}>{s.label}</button>)}</div></div>
        </div>
      </div>
    </div>
  );
}
