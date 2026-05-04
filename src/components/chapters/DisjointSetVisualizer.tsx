"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface DSUNode {
  id: string;
  value: number;
  parent: number;
  rank: number;
  x: number;
  y: number;
  isActive: boolean;
  isRoot: boolean;
}

interface AlgorithmStep {
  step: number;
  action: string;
  nodes: DSUNode[];
  activePair?: [number, number];
  highlightLines: number[];
  description: string;
}

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    nodes: Array.from({ length: 8 }, (_, i) => ({
      id: `node${i}`,
      value: i,
      parent: i,
      rank: 0,
      x: (i % 4) * 120 + 60,
      y: Math.floor(i / 4) * 100 + 50,
      isActive: false,
      isRoot: true
    })),
    highlightLines: [1, 2, 3],
    description: "Initialize DSU with 8 elements. Each element is its own parent (self-loop). Rank = 0.",
  },
  {
    step: 1,
    action: "union",
    nodes: Array.from({ length: 8 }, (_, i) => ({
      id: `node${i}`,
      value: i,
      parent: i === 1 ? 0 : i === 0 ? 0 : i,
      rank: i === 0 ? 1 : 0,
      x: i === 0 ? 60 : i === 1 ? 60 : (i % 4) * 120 + 60,
      y: i === 0 ? 50 : i === 1 ? 90 : Math.floor(i / 4) * 100 + 50,
      isActive: i === 0 || i === 1,
      isRoot: i === 0 || (i !== 1 && i === i)
    })),
    activePair: [0, 1],
    highlightLines: [5, 6, 7],
    description: "Union(0, 1): Find roots (0 and 1). 0 has higher rank (both 0, pick 0). Make 0 parent of 1.",
  },
  {
    step: 2,
    action: "union",
    nodes: Array.from({ length: 8 }, (_, i) => ({
      id: `node${i}`,
      value: i,
      parent: i === 1 || i === 2 ? 0 : i,
      rank: i === 0 ? 1 : 0,
      x: i === 0 ? 60 : i === 1 ? 60 : i === 2 ? 100 : (i % 4) * 120 + 60,
      y: i === 0 ? 50 : i === 1 ? 90 : i === 2 ? 90 : Math.floor(i / 4) * 100 + 50,
      isActive: i === 0 || i === 2,
      isRoot: i === 0 || (i !== 1 && i !== 2 && i === i)
    })),
    activePair: [0, 2],
    highlightLines: [5, 6, 7],
    description: "Union(0, 2): Find root of 2 = 2. Root 0 has rank 1, root 2 has rank 0. Attach 2 under 0.",
  },
  {
    step: 3,
    action: "find",
    nodes: Array.from({ length: 8 }, (_, i) => ({
      id: `node${i}`,
      value: i,
      parent: i === 1 || i === 2 ? 0 : i,
      rank: i === 0 ? 1 : 0,
      x: i === 0 ? 60 : i === 1 ? 60 : i === 2 ? 100 : (i % 4) * 120 + 60,
      y: i === 0 ? 50 : i === 1 ? 90 : i === 2 ? 90 : Math.floor(i / 4) * 100 + 50,
      isActive: i === 2,
      isRoot: i === 0 || (i !== 1 && i !== 2 && i === i)
    })),
    highlightLines: [10, 11, 12],
    description: "Find(2): parent[2] = 0 ≠ 2, so recurse Find(parent[2]) = Find(0) = 0. Return 0.",
  },
  {
    step: 4,
    action: "union",
    nodes: Array.from({ length: 8 }, (_, i) => ({
      id: `node${i}`,
      value: i,
      parent: i === 1 || i === 2 ? 0 : i === 3 || i === 4 ? 3 : i,
      rank: i === 0 || i === 3 ? 1 : 0,
      x: i === 0 ? 60 : i === 1 ? 60 : i === 2 ? 100 : i === 3 ? 240 : i === 4 ? 240 : (i % 4) * 120 + 60,
      y: i === 0 ? 50 : i === 1 ? 90 : i === 2 ? 90 : i === 3 ? 50 : i === 4 ? 90 : Math.floor(i / 4) * 100 + 50,
      isActive: i === 3 || i === 4,
      isRoot: i === 0 || i === 3 || (i !== 1 && i !== 2 && i !== 4 && i === i)
    })),
    activePair: [3, 4],
    highlightLines: [5, 6, 7],
    description: "Union(3, 4): Separate set formed. Component {3, 4} created with root 3.",
  },
  {
    step: 5,
    action: "union",
    nodes: Array.from({ length: 8 }, (_, i) => ({
      id: `node${i}`,
      value: i,
      parent: i === 0 || i === 3 ? 3 : i,
      rank: i === 3 ? 2 : i === 0 ? 1 : 0,
      x: i === 0 ? 60 : i === 1 ? 60 : i === 2 ? 100 : i === 3 ? 150 : i === 4 ? 240 : (i % 4) * 120 + 60,
      y: i === 0 ? 130 : i === 1 ? 90 : i === 2 ? 90 : i === 3 ? 50 : i === 4 ? 90 : Math.floor(i / 4) * 100 + 50,
      isActive: i === 0 || i === 3,
      isRoot: i === 3 || (i !== 0 && i !== 4 && i !== 1 && i !== 2 && i === i)
    })),
    activePair: [0, 3],
    highlightLines: [5, 6, 7, 8],
    description: "Union(0, 3): Both ranks = 1. Merge sets! Make 3 parent of 0. Rank of 3 increases to 2.",
  },
  {
    step: 6,
    action: "find",
    nodes: Array.from({ length: 8 }, (_, i) => ({
      id: `node${i}`,
      value: i,
      parent: i === 0 || i === 3 ? 3 : i,
      rank: i === 3 ? 2 : i === 0 ? 1 : 0,
      x: i === 0 ? 60 : i === 1 ? 60 : i === 2 ? 100 : i === 3 ? 150 : i === 4 ? 240 : (i % 4) * 120 + 60,
      y: i === 0 ? 130 : i === 1 ? 90 : i === 2 ? 90 : i === 3 ? 50 : i === 4 ? 90 : Math.floor(i / 4) * 100 + 50,
      isActive: i === 1 || i === 0 || i === 3,
      isRoot: i === 3 || (i !== 0 && i !== 4 && i !== 1 && i !== 2 && i === i)
    })),
    highlightLines: [13, 14, 15],
    description: "Find(1) with path compression: 1→0→3. After: parent[1] = 3 directly!",
  },
];

export default function DisjointSetVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => {
    setTotalSteps(algorithmSteps.length);
  }, [setTotalSteps]);

  useEffect(() => {
    const step = algorithmSteps[currentStep];
    if (step) {
      setActiveLines(step.highlightLines);
    }
  }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => {
    togglePlay();
  }, [togglePlay]);

  const handleStep = useCallback((direction: "next" | "prev") => {
    if (direction === "next") {
      nextStep();
    } else {
      prevStep();
    }
  }, [nextStep, prevStep]);

  const step = algorithmSteps[currentStep] || algorithmSteps[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Disjoint Set Union (DSU) Visualizer</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlay}
            className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => handleStep("prev")}
            className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d] transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => handleStep("next")}
            className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d] transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Active Operation */}
      {step.activePair && (
        <div className="px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
          <span className="text-[#8b949e]">Operation: </span>
          <span className="text-[#58a6ff] font-mono font-bold">
            {step.action === "union" ? "Union" : "Find"}({step.activePair.join(", ")})
          </span>
        </div>
      )}

      {/* Visualization Area */}
      <div className="flex-1 p-4 relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 480 200">
          {/* Edges (parent relationships) */}
          {step.nodes.map((node) => {
            if (node.parent === node.value) return null;
            const parent = step.nodes.find(n => n.value === node.parent);
            if (!parent) return null;
            return (
              <motion.line
                key={`edge-${node.value}`}
                x1={node.x}
                y1={node.y}
                x2={parent.x}
                y2={parent.y + 25}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                stroke={node.isActive ? "#238636" : "#30363d"}
                strokeWidth={node.isActive ? 3 : 1}
                markerEnd="url(#arrowhead)"
              />
            );
          })}

          {/* Arrow marker definition */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#30363d" />
            </marker>
          </defs>

          {/* Nodes */}
          {step.nodes.map((node) => (
            <motion.g key={node.id}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={25}
                animate={{
                  fill: node.isActive
                    ? "#238636"
                    : node.isRoot
                      ? "#8957e5"
                      : "#21262d",
                  stroke: node.isActive ? "#3fb950" : node.isRoot ? "#a371f7" : "#30363d",
                  strokeWidth: node.isActive ? 3 : 2
                }}
                transition={{ duration: 0.3 }}
              />
              <text
                x={node.x}
                y={node.y - 5}
                fill="white"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                className="font-mono"
              >
                {node.value}
              </text>
              <text
                x={node.x}
                y={node.y + 10}
                fill="#8b949e"
                fontSize="10"
                textAnchor="middle"
                className="font-mono"
              >
                r:{node.rank}
              </text>
              {/* Root indicator */}
              {node.isRoot && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={30}
                  fill="none"
                  stroke="#a371f7"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
              )}
            </motion.g>
          ))}
        </svg>

        {/* Description */}
        <motion.div
          key={step.step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg"
        >
          <p className="text-white">{step.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#8b949e]">
            <span>Step {currentStep + 1} of {totalSteps || algorithmSteps.length}</span>
            <span>Action: <span className="text-[#58a6ff]">{step.action.toUpperCase()}</span></span>
          </div>
        </motion.div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-[#30363d] flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#238636] rounded-full" />
          <span className="text-[#8b949e]">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#8957e5] rounded-full border border-[#a371f7]" />
          <span className="text-[#8b949e]">Root</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#21262d] border border-[#30363d] rounded-full" />
          <span className="text-[#8b949e]">Child</span>
        </div>
      </div>
    </div>
  );
}
