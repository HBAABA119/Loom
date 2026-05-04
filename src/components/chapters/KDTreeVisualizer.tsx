"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Point {
  id: string;
  x: number;
  y: number;
  isActive: boolean;
}

interface KDStep {
  step: number;
  action: string;
  points: Point[];
  splitAxis: "x" | "y" | null;
  splitValue: number;
  highlightLines: number[];
  description: string;
}

const kdSteps: KDStep[] = [
  { step: 0, action: "init", points: [
    { id: "p1", x: 30, y: 40, isActive: false },
    { id: "p2", x: 50, y: 80, isActive: false },
    { id: "p3", x: 70, y: 20, isActive: false },
    { id: "p4", x: 20, y: 70, isActive: false },
    { id: "p5", x: 90, y: 60, isActive: false },
  ], splitAxis: null, splitValue: 0, highlightLines: [1, 2], description: "K-D Tree: Space-partitioning for k-dimensional points. Build by cycling through dimensions." },
  { step: 1, action: "split-x", points: [
    { id: "p1", x: 30, y: 40, isActive: false },
    { id: "p2", x: 50, y: 80, isActive: true },
    { id: "p3", x: 70, y: 20, isActive: false },
    { id: "p4", x: 20, y: 70, isActive: false },
    { id: "p5", x: 90, y: 60, isActive: false },
  ], splitAxis: "x", splitValue: 50, highlightLines: [3, 4], description: "Level 0: Split on x-axis at median x=50. Root node: (50, 80)." },
  { step: 2, action: "split-y", points: [
    { id: "p1", x: 30, y: 40, isActive: true },
    { id: "p2", x: 50, y: 80, isActive: false },
    { id: "p3", x: 70, y: 20, isActive: true },
    { id: "p4", x: 20, y: 70, isActive: false },
    { id: "p5", x: 90, y: 60, isActive: false },
  ], splitAxis: "y", splitValue: 40, highlightLines: [5, 6], description: "Level 1: Left subtree split on y at y=40. Node: (30, 40). Right split at y=60." },
  { step: 3, action: "split-x", points: [
    { id: "p1", x: 30, y: 40, isActive: false },
    { id: "p2", x: 50, y: 80, isActive: false },
    { id: "p3", x: 70, y: 20, isActive: false },
    { id: "p4", x: 20, y: 70, isActive: true },
    { id: "p5", x: 90, y: 60, isActive: true },
  ], splitAxis: "x", splitValue: 20, highlightLines: [7, 8], description: "Level 2: Continue splitting alternating axes. Left-left: (20, 70)." },
  { step: 4, action: "search", points: [
    { id: "p1", x: 30, y: 40, isActive: true },
    { id: "p2", x: 50, y: 80, isActive: false },
    { id: "p3", x: 70, y: 20, isActive: false },
    { id: "p4", x: 20, y: 70, isActive: false },
    { id: "p5", x: 90, y: 60, isActive: false },
  ], splitAxis: null, splitValue: 0, highlightLines: [9, 10], description: "Nearest neighbor search: Start at root, compare distance, prune branches outside hyper-rectangle." },
  { step: 5, action: "complete", points: [
    { id: "p1", x: 30, y: 40, isActive: false },
    { id: "p2", x: 50, y: 80, isActive: false },
    { id: "p3", x: 70, y: 20, isActive: false },
    { id: "p4", x: 20, y: 70, isActive: false },
    { id: "p5", x: 90, y: 60, isActive: false },
  ], splitAxis: null, splitValue: 0, highlightLines: [11, 12], description: "K-D Tree enables O(log n) average case for search/insert. Efficient for spatial queries!" },
];

export default function KDTreeVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => { setTotalSteps(kdSteps.length); }, [setTotalSteps]);
  useEffect(() => { const step = kdSteps[currentStep]; if (step) setActiveLines(step.highlightLines); }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleStep = useCallback((dir: "next" | "prev") => dir === "next" ? nextStep() : prevStep(), [nextStep, prevStep]);
  const step = kdSteps[currentStep] || kdSteps[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">K-D Tree Visualizer</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">{isPlaying ? "Pause" : "Play"}</button>
          <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Prev</button>
          <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden flex flex-col items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Split lines */}
          {step.splitAxis === "x" && <line x1={step.splitValue} y1={0} x2={step.splitValue} y2={100} stroke="#58a6ff" strokeWidth={0.5} strokeDasharray="2" />}
          {step.splitAxis === "y" && <line x1={0} y1={step.splitValue} x2={100} y2={step.splitValue} stroke="#f0883e" strokeWidth={0.5} strokeDasharray="2" />}
          
          {/* Points */}
          {step.points.map((p) => (
            <motion.circle
              key={p.id}
              cx={p.x} cy={p.y} r={3}
              animate={{
                fill: p.isActive ? "#238636" : "#8957e5",
                stroke: p.isActive ? "#3fb950" : "#a371f7",
                strokeWidth: p.isActive ? 2 : 1
              }}
            />
          ))}
        </svg>

        <div className="absolute top-4 right-4 p-2 bg-[#161b22] border border-[#30363d] rounded text-sm text-[#8b949e]">
          {step.splitAxis && <span>Split: <span className={step.splitAxis === "x" ? "text-[#58a6ff]" : "text-[#f0883e]"}>{step.splitAxis}={step.splitValue}</span></span>}
        </div>

        <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <p className="text-white">{step.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#8b949e]">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>Action: <span className="text-[#58a6ff]">{step.action.toUpperCase()}</span></span>
          </div>
        </motion.div>
      </div>

      <div className="p-4 border-t border-[#30363d] flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#8957e5] rounded-full" /><span className="text-[#8b949e]">Point</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#238636] rounded-full" /><span className="text-[#8b949e]">Active</span></div>
        <div className="flex items-center gap-2"><span className="text-[#58a6ff]">━━</span><span className="text-[#8b949e]">X-Split</span></div>
        <div className="flex items-center gap-2"><span className="text-[#f0883e]">━━</span><span className="text-[#8b949e]">Y-Split</span></div>
      </div>
    </div>
  );
}
