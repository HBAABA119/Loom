"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  inMST: boolean;
}

interface Edge {
  id: string;
  from: string;
  to: string;
  weight: number;
  isActive: boolean;
  inMST: boolean;
  rejected: boolean;
}

interface AlgorithmStep {
  step: number;
  action: string;
  nodes: GraphNode[];
  edges: Edge[];
  totalWeight: number;
  highlightLines: number[];
  description: string;
}

const initialNodes: GraphNode[] = [
  { id: "A", label: "A", x: 100, y: 100, inMST: false },
  { id: "B", label: "B", x: 300, y: 50, inMST: false },
  { id: "C", label: "C", x: 500, y: 100, inMST: false },
  { id: "D", label: "D", x: 200, y: 200, inMST: false },
  { id: "E", label: "E", x: 400, y: 200, inMST: false },
];

const allEdges: Edge[] = [
  { id: "e1", from: "A", to: "B", weight: 4, isActive: false, inMST: false, rejected: false },
  { id: "e2", from: "A", to: "D", weight: 2, isActive: false, inMST: false, rejected: false },
  { id: "e3", from: "B", to: "D", weight: 1, isActive: false, inMST: false, rejected: false },
  { id: "e4", from: "B", to: "C", weight: 3, isActive: false, inMST: false, rejected: false },
  { id: "e5", from: "B", to: "E", weight: 5, isActive: false, inMST: false, rejected: false },
  { id: "e6", from: "D", to: "E", weight: 6, isActive: false, inMST: false, rejected: false },
  { id: "e7", from: "C", to: "E", weight: 2, isActive: false, inMST: false, rejected: false },
];

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    nodes: initialNodes.map(n => ({ ...n })),
    edges: allEdges.map(e => ({ ...e })),
    totalWeight: 0,
    highlightLines: [1, 2, 3],
    description: "Kruskal's MST Algorithm. Sort edges by weight. Initialize each node as separate component.",
  },
  {
    step: 1,
    action: "sort",
    nodes: initialNodes.map(n => ({ ...n })),
    edges: allEdges.map(e => ({ ...e, isActive: true })).sort((a, b) => a.weight - b.weight),
    totalWeight: 0,
    highlightLines: [4, 5],
    description: "Edges sorted by weight: B-D(1), A-D(2), C-E(2), B-C(3), A-B(4), B-E(5), D-E(6).",
  },
  {
    step: 2,
    action: "select",
    nodes: initialNodes.map(n => ({ ...n, inMST: n.id === "B" || n.id === "D" })),
    edges: allEdges.map(e => ({ ...e, isActive: e.id === "e3", inMST: e.id === "e3" })),
    totalWeight: 1,
    highlightLines: [6, 7, 8],
    description: "Pick edge B-D (weight 1). B and D in different sets. Add to MST! Total = 1.",
  },
  {
    step: 3,
    action: "select",
    nodes: initialNodes.map(n => ({ ...n, inMST: n.id === "A" || n.id === "B" || n.id === "D" })),
    edges: allEdges.map(e => ({ ...e, isActive: e.id === "e2", inMST: e.id === "e2" || e.id === "e3" })),
    totalWeight: 3,
    highlightLines: [6, 7, 8],
    description: "Pick edge A-D (weight 2). A and D in different sets. Add to MST! Total = 3.",
  },
  {
    step: 4,
    action: "select",
    nodes: initialNodes.map(n => ({ ...n, inMST: n.id === "A" || n.id === "B" || n.id === "C" || n.id === "D" || n.id === "E" })),
    edges: allEdges.map(e => ({ ...e, isActive: e.id === "e7", inMST: e.id === "e2" || e.id === "e3" || e.id === "e7" })),
    totalWeight: 5,
    highlightLines: [6, 7, 8],
    description: "Pick edge C-E (weight 2). C and E in different sets. Add to MST! Total = 5.",
  },
  {
    step: 5,
    action: "select",
    nodes: initialNodes.map(n => ({ ...n, inMST: true })),
    edges: allEdges.map(e => ({ ...e, isActive: e.id === "e4", inMST: e.id === "e2" || e.id === "e3" || e.id === "e4" || e.id === "e7" })),
    totalWeight: 8,
    highlightLines: [6, 7, 8],
    description: "Pick edge B-C (weight 3). B and C in different sets. Add to MST! Total = 8.",
  },
  {
    step: 6,
    action: "reject",
    nodes: initialNodes.map(n => ({ ...n, inMST: true })),
    edges: allEdges.map(e => ({ ...e, inMST: ["e2", "e3", "e4", "e7"].includes(e.id), rejected: e.id === "e1" })),
    totalWeight: 8,
    highlightLines: [9, 10],
    description: "Edge A-B (weight 4): A and B already connected via MST. Skip! Would create cycle.",
  },
  {
    step: 7,
    action: "complete",
    nodes: initialNodes.map(n => ({ ...n, inMST: true })),
    edges: allEdges.map(e => ({ ...e, inMST: ["e2", "e3", "e4", "e7"].includes(e.id), rejected: ["e1", "e5", "e6"].includes(e.id) })),
    totalWeight: 8,
    highlightLines: [11, 12],
    description: "MST Complete! Edges: B-D(1), A-D(2), C-E(2), B-C(3). Total weight: 8. |V|-1 = 4 edges.",
  },
];

export default function MSTVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => { setTotalSteps(algorithmSteps.length); }, [setTotalSteps]);
  useEffect(() => { 
    const step = algorithmSteps[currentStep]; 
    if (step) setActiveLines(step.highlightLines);
  }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleStep = useCallback((dir: "next" | "prev") => dir === "next" ? nextStep() : prevStep(), [nextStep, prevStep]);
  const step = algorithmSteps[currentStep] || algorithmSteps[0];
  const getNode = (id: string) => step.nodes.find(n => n.id === id);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">MST (Kruskal) Visualizer</h3>
        <div className="flex items-center gap-4">
          <span className="text-[#8b949e]">Total Weight: <span className="text-[#58a6ff] font-bold">{step.totalWeight}</span></span>
          <div className="flex items-center gap-2">
            <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">{isPlaying ? "Pause" : "Play"}</button>
            <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Prev</button>
            <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 600 250">
          {step.edges.map((edge) => {
            const from = getNode(edge.from), to = getNode(edge.to);
            if (!from || !to) return null;
            return (
              <g key={edge.id}>
                <motion.line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={edge.inMST ? "#238636" : edge.rejected ? "#f85149" : edge.isActive ? "#58a6ff" : "#30363d"}
                  strokeWidth={edge.inMST ? 4 : 2}
                  strokeDasharray={edge.rejected ? "5 5" : "0"}
                />
                <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 10} fill="#8b949e" fontSize="12" textAnchor="middle" className="font-mono">{edge.weight}</text>
              </g>
            );
          })}
          {step.nodes.map((node) => (
            <motion.g key={node.id}>
              <motion.circle cx={node.x} cy={node.y} r={25}
                animate={{
                  fill: node.inMST ? "#238636" : "#21262d",
                  stroke: node.inMST ? "#3fb950" : "#30363d",
                  strokeWidth: node.inMST ? 3 : 2
                }}
              />
              <text x={node.x} y={node.y} dy="5" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">{node.label}</text>
            </motion.g>
          ))}
        </svg>

        <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <p className="text-white">{step.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#8b949e]">
            <span>Step {currentStep + 1} of {totalSteps || algorithmSteps.length}</span>
            <span>Action: <span className="text-[#58a6ff]">{step.action.toUpperCase()}</span></span>
          </div>
        </motion.div>
      </div>

      <div className="p-4 border-t border-[#30363d] flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2"><div className="w-6 h-1 bg-[#238636]" /><span className="text-[#8b949e]">MST Edge</span></div>
        <div className="flex items-center gap-2"><div className="w-6 h-1 bg-[#f85149]" /><span className="text-[#8b949e]">Rejected (Cycle)</span></div>
        <div className="flex items-center gap-2"><div className="w-6 h-1 bg-[#30363d]" /><span className="text-[#8b949e]">Not Considered</span></div>
      </div>
    </div>
  );
}
