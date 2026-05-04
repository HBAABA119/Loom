"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface FlowEdge {
  from: string;
  to: string;
  capacity: number;
  flow: number;
  residual: number;
  isAugmenting: boolean;
}

interface FlowStep {
  step: number;
  action: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  totalFlow: number;
  highlightLines: number[];
  description: string;
  path: string[];
}

const flowSteps: FlowStep[] = [
  { step: 0, action: "init", nodes: [
    { id: "S", label: "S", x: 50, y: 150 },
    { id: "A", label: "A", x: 200, y: 80 },
    { id: "B", label: "B", x: 200, y: 220 },
    { id: "C", label: "C", x: 350, y: 80 },
    { id: "D", label: "D", x: 350, y: 220 },
    { id: "T", label: "T", x: 500, y: 150 },
  ], edges: [
    { from: "S", to: "A", capacity: 10, flow: 0, residual: 10, isAugmenting: false },
    { from: "S", to: "B", capacity: 10, flow: 0, residual: 10, isAugmenting: false },
    { from: "A", to: "C", capacity: 4, flow: 0, residual: 4, isAugmenting: false },
    { from: "A", to: "D", capacity: 8, flow: 0, residual: 8, isAugmenting: false },
    { from: "B", to: "D", capacity: 6, flow: 0, residual: 6, isAugmenting: false },
    { from: "C", to: "T", capacity: 10, flow: 0, residual: 10, isAugmenting: false },
    { from: "D", to: "T", capacity: 10, flow: 0, residual: 10, isAugmenting: false },
  ], totalFlow: 0, highlightLines: [1, 2], description: "Ford-Fulkerson Max Flow. Source S, Sink T. Find augmenting paths.", path: [] },
  { step: 1, action: "find-path", nodes: [
    { id: "S", label: "S", x: 50, y: 150 },
    { id: "A", label: "A", x: 200, y: 80 },
    { id: "B", label: "B", x: 200, y: 220 },
    { id: "C", label: "C", x: 350, y: 80 },
    { id: "D", label: "D", x: 350, y: 220 },
    { id: "T", label: "T", x: 500, y: 150 },
  ], edges: [
    { from: "S", to: "A", capacity: 10, flow: 8, residual: 2, isAugmenting: true },
    { from: "S", to: "B", capacity: 10, flow: 0, residual: 10, isAugmenting: false },
    { from: "A", to: "C", capacity: 4, flow: 0, residual: 4, isAugmenting: false },
    { from: "A", to: "D", capacity: 8, flow: 8, residual: 0, isAugmenting: true },
    { from: "B", to: "D", capacity: 6, flow: 0, residual: 6, isAugmenting: false },
    { from: "C", to: "T", capacity: 10, flow: 0, residual: 10, isAugmenting: false },
    { from: "D", to: "T", capacity: 10, flow: 8, residual: 2, isAugmenting: true },
  ], totalFlow: 8, highlightLines: [3, 4], description: "Path S→A→D→T. Bottleneck = 8. Flow = 8.", path: ["S", "A", "D", "T"] },
  { step: 2, action: "find-path", nodes: [
    { id: "S", label: "S", x: 50, y: 150 },
    { id: "A", label: "A", x: 200, y: 80 },
    { id: "B", label: "B", x: 200, y: 220 },
    { id: "C", label: "C", x: 350, y: 80 },
    { id: "D", label: "D", x: 350, y: 220 },
    { id: "T", label: "T", x: 500, y: 150 },
  ], edges: [
    { from: "S", to: "A", capacity: 10, flow: 8, residual: 2, isAugmenting: false },
    { from: "S", to: "B", capacity: 10, flow: 6, residual: 4, isAugmenting: true },
    { from: "A", to: "C", capacity: 4, flow: 4, residual: 0, isAugmenting: true },
    { from: "A", to: "D", capacity: 8, flow: 8, residual: 0, isAugmenting: false },
    { from: "B", to: "D", capacity: 6, flow: 6, residual: 0, isAugmenting: true },
    { from: "C", to: "T", capacity: 10, flow: 4, residual: 6, isAugmenting: true },
    { from: "D", to: "T", capacity: 10, flow: 14, residual: -4, isAugmenting: false },
  ], totalFlow: 18, highlightLines: [3, 4], description: "Path S→B→D→T adds 6. Path S→A→C→T adds 2 (residual from A).", path: ["S", "B", "D", "T"] },
  { step: 3, action: "complete", nodes: [
    { id: "S", label: "S", x: 50, y: 150 },
    { id: "A", label: "A", x: 200, y: 80 },
    { id: "B", label: "B", x: 200, y: 220 },
    { id: "C", label: "C", x: 350, y: 80 },
    { id: "D", label: "D", x: 350, y: 220 },
    { id: "T", label: "T", x: 500, y: 150 },
  ], edges: [
    { from: "S", to: "A", capacity: 10, flow: 10, residual: 0, isAugmenting: false },
    { from: "S", to: "B", capacity: 10, flow: 10, residual: 0, isAugmenting: false },
    { from: "A", to: "C", capacity: 4, flow: 4, residual: 0, isAugmenting: false },
    { from: "A", to: "D", capacity: 8, flow: 6, residual: 2, isAugmenting: false },
    { from: "B", to: "D", capacity: 6, flow: 6, residual: 0, isAugmenting: false },
    { from: "C", to: "T", capacity: 10, flow: 4, residual: 6, isAugmenting: false },
    { from: "D", to: "T", capacity: 10, flow: 10, residual: 0, isAugmenting: false },
  ], totalFlow: 20, highlightLines: [5, 6], description: "Max Flow = 20! Min Cut: edges S→A, S→B (both saturated).", path: [] },
];

export default function NetworkFlowVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => { setTotalSteps(flowSteps.length); }, [setTotalSteps]);
  useEffect(() => { const step = flowSteps[currentStep]; if (step) setActiveLines(step.highlightLines); }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleStep = useCallback((dir: "next" | "prev") => dir === "next" ? nextStep() : prevStep(), [nextStep, prevStep]);
  const step = flowSteps[currentStep] || flowSteps[0];
  const getNode = (id: string) => step.nodes.find(n => n.id === id);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Network Flow (Ford-Fulkerson)</h3>
        <div className="flex items-center gap-4">
          <span className="text-[#8b949e]">Max Flow: <span className="text-[#238636] font-bold">{step.totalFlow}</span></span>
          <div className="flex items-center gap-2">
            <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">{isPlaying ? "Pause" : "Play"}</button>
            <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Prev</button>
            <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 550 300">
          {step.edges.map((edge) => {
            const from = getNode(edge.from), to = getNode(edge.to);
            if (!from || !to) return null;
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <motion.line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={edge.isAugmenting ? "#238636" : edge.residual === 0 ? "#f85149" : "#30363d"}
                  strokeWidth={edge.isAugmenting ? 4 : 2}
                  markerEnd="url(#arrow)"
                />
                <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 12} fill="#8b949e" fontSize="12" textAnchor="middle" className="font-mono">
                  {edge.flow}/{edge.capacity}
                </text>
              </g>
            );
          })}
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#30363d" />
            </marker>
          </defs>
          {step.nodes.map((node) => (
            <motion.g key={node.id}>
              <motion.circle cx={node.x} cy={node.y} r={28}
                animate={{
                  fill: node.id === "S" ? "#238636" : node.id === "T" ? "#f85149" : step.path.includes(node.id) ? "#8957e5" : "#21262d",
                  stroke: step.path.includes(node.id) ? "#a371f7" : "#30363d",
                  strokeWidth: step.path.includes(node.id) ? 3 : 2
                }}
              />
              <text x={node.x} y={node.y} dy="6" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">{node.label}</text>
            </motion.g>
          ))}
        </svg>

        <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <p className="text-white">{step.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#8b949e]">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>Action: <span className="text-[#58a6ff]">{step.action.toUpperCase()}</span></span>
            {step.path.length > 0 && <span>Path: <span className="text-[#8957e5]">{step.path.join(" → ")}</span></span>}
          </div>
        </motion.div>
      </div>

      <div className="p-4 border-t border-[#30363d] flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#238636] rounded-full" /><span className="text-[#8b949e]">Augmenting Path</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#f85149] rounded-full" /><span className="text-[#8b949e]">Saturated</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#8957e5] rounded-full" /><span className="text-[#8b949e]">Current Path</span></div>
      </div>
    </div>
  );
}
