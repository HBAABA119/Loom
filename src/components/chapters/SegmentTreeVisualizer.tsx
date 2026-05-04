"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface SegmentNode {
  id: string;
  value: number;
  range: [number, number];
  x: number;
  y: number;
  isActive: boolean;
  isQuery: boolean;
}

interface AlgorithmStep {
  step: number;
  action: string;
  nodes: SegmentNode[];
  array: number[];
  queryRange?: [number, number];
  result?: number;
  highlightLines: number[];
  description: string;
}

const baseArray = [1, 3, 5, 7, 9, 11];

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    nodes: [
      { id: "n0", value: 36, range: [0, 5], x: 300, y: 30, isActive: false, isQuery: false },
      { id: "n1", value: 9, range: [0, 2], x: 150, y: 90, isActive: false, isQuery: false },
      { id: "n2", value: 27, range: [3, 5], x: 450, y: 90, isActive: false, isQuery: false },
      { id: "n3", value: 4, range: [0, 1], x: 75, y: 150, isActive: false, isQuery: false },
      { id: "n4", value: 5, range: [2, 2], x: 225, y: 150, isActive: false, isQuery: false },
      { id: "n5", value: 16, range: [3, 4], x: 375, y: 150, isActive: false, isQuery: false },
      { id: "n6", value: 11, range: [5, 5], x: 525, y: 150, isActive: false, isQuery: false },
      { id: "n7", value: 1, range: [0, 0], x: 37, y: 210, isActive: false, isQuery: false },
      { id: "n8", value: 3, range: [1, 1], x: 112, y: 210, isActive: false, isQuery: false },
      { id: "n9", value: 7, range: [3, 3], x: 337, y: 210, isActive: false, isQuery: false },
      { id: "n10", value: 9, range: [4, 4], x: 412, y: 210, isActive: false, isQuery: false },
    ],
    array: baseArray,
    highlightLines: [1, 2, 3],
    description: "Segment Tree for sum query on array [1, 3, 5, 7, 9, 11]. Each node stores sum of its range.",
  },
  {
    step: 1,
    action: "query",
    nodes: [
      { id: "n0", value: 36, range: [0, 5], x: 300, y: 30, isActive: true, isQuery: true },
      { id: "n1", value: 9, range: [0, 2], x: 150, y: 90, isActive: false, isQuery: false },
      { id: "n2", value: 27, range: [3, 5], x: 450, y: 90, isActive: false, isQuery: false },
      { id: "n3", value: 4, range: [0, 1], x: 75, y: 150, isActive: false, isQuery: false },
      { id: "n4", value: 5, range: [2, 2], x: 225, y: 150, isActive: false, isQuery: false },
      { id: "n5", value: 16, range: [3, 4], x: 375, y: 150, isActive: false, isQuery: false },
      { id: "n6", value: 11, range: [5, 5], x: 525, y: 150, isActive: false, isQuery: false },
      { id: "n7", value: 1, range: [0, 0], x: 37, y: 210, isActive: false, isQuery: false },
      { id: "n8", value: 3, range: [1, 1], x: 112, y: 210, isActive: false, isQuery: false },
      { id: "n9", value: 7, range: [3, 3], x: 337, y: 210, isActive: false, isQuery: false },
      { id: "n10", value: 9, range: [4, 4], x: 412, y: 210, isActive: false, isQuery: false },
    ],
    array: baseArray,
    queryRange: [1, 4],
    highlightLines: [5, 6, 7],
    description: "Query sum of range [1, 4]. Start at root [0, 5]. Range doesn't fully match.",
  },
  {
    step: 2,
    action: "query",
    nodes: [
      { id: "n0", value: 36, range: [0, 5], x: 300, y: 30, isActive: false, isQuery: true },
      { id: "n1", value: 9, range: [0, 2], x: 150, y: 90, isActive: true, isQuery: true },
      { id: "n2", value: 27, range: [3, 5], x: 450, y: 90, isActive: true, isQuery: true },
      { id: "n3", value: 4, range: [0, 1], x: 75, y: 150, isActive: false, isQuery: false },
      { id: "n4", value: 5, range: [2, 2], x: 225, y: 150, isActive: false, isQuery: false },
      { id: "n5", value: 16, range: [3, 4], x: 375, y: 150, isActive: false, isQuery: false },
      { id: "n6", value: 11, range: [5, 5], x: 525, y: 150, isActive: false, isQuery: false },
      { id: "n7", value: 1, range: [0, 0], x: 37, y: 210, isActive: false, isQuery: false },
      { id: "n8", value: 3, range: [1, 1], x: 112, y: 210, isActive: false, isQuery: false },
      { id: "n9", value: 7, range: [3, 3], x: 337, y: 210, isActive: false, isQuery: false },
      { id: "n10", value: 9, range: [4, 4], x: 412, y: 210, isActive: false, isQuery: false },
    ],
    array: baseArray,
    queryRange: [1, 4],
    highlightLines: [8, 9],
    description: "Query [1, 4] overlaps both children [0, 2] and [3, 5]. Recurse to both.",
  },
  {
    step: 3,
    action: "query",
    nodes: [
      { id: "n0", value: 36, range: [0, 5], x: 300, y: 30, isActive: false, isQuery: true },
      { id: "n1", value: 9, range: [0, 2], x: 150, y: 90, isActive: false, isQuery: true },
      { id: "n2", value: 27, range: [3, 5], x: 450, y: 90, isActive: false, isQuery: true },
      { id: "n3", value: 4, range: [0, 1], x: 75, y: 150, isActive: true, isQuery: true },
      { id: "n4", value: 5, range: [2, 2], x: 225, y: 150, isActive: false, isQuery: false },
      { id: "n5", value: 16, range: [3, 4], x: 375, y: 150, isActive: true, isQuery: true },
      { id: "n6", value: 11, range: [5, 5], x: 525, y: 150, isActive: false, isQuery: false },
      { id: "n7", value: 1, range: [0, 0], x: 37, y: 210, isActive: false, isQuery: false },
      { id: "n8", value: 3, range: [1, 1], x: 112, y: 210, isActive: false, isQuery: false },
      { id: "n9", value: 7, range: [3, 3], x: 337, y: 210, isActive: false, isQuery: false },
      { id: "n10", value: 9, range: [4, 4], x: 412, y: 210, isActive: false, isQuery: false },
    ],
    array: baseArray,
    queryRange: [1, 4],
    highlightLines: [8, 9],
    description: "Left side: [1, 4] overlaps [0, 1] and [3, 4]. Right side: [2, 2] and [5, 5] don't overlap - skip.",
  },
  {
    step: 4,
    action: "query",
    nodes: [
      { id: "n0", value: 36, range: [0, 5], x: 300, y: 30, isActive: false, isQuery: true },
      { id: "n1", value: 9, range: [0, 2], x: 150, y: 90, isActive: false, isQuery: true },
      { id: "n2", value: 27, range: [3, 5], x: 450, y: 90, isActive: false, isQuery: true },
      { id: "n3", value: 4, range: [0, 1], x: 75, y: 150, isActive: false, isQuery: true },
      { id: "n4", value: 5, range: [2, 2], x: 225, y: 150, isActive: false, isQuery: false },
      { id: "n5", value: 16, range: [3, 4], x: 375, y: 150, isActive: true, isQuery: false },
      { id: "n6", value: 11, range: [5, 5], x: 525, y: 150, isActive: false, isQuery: false },
      { id: "n7", value: 1, range: [0, 0], x: 37, y: 210, isActive: false, isQuery: false },
      { id: "n8", value: 3, range: [1, 1], x: 112, y: 210, isActive: true, isQuery: false },
      { id: "n9", value: 7, range: [3, 3], x: 337, y: 210, isActive: false, isQuery: false },
      { id: "n10", value: 9, range: [4, 4], x: 412, y: 210, isActive: false, isQuery: false },
    ],
    array: baseArray,
    queryRange: [1, 4],
    result: 24,
    highlightLines: [10, 11, 12],
    description: "[0, 1] partially overlaps - need deeper. [3, 4] fully within [1, 4] - use value 16!",
  },
  {
    step: 5,
    action: "query",
    nodes: [
      { id: "n0", value: 36, range: [0, 5], x: 300, y: 30, isActive: false, isQuery: true },
      { id: "n1", value: 9, range: [0, 2], x: 150, y: 90, isActive: false, isQuery: true },
      { id: "n2", value: 27, range: [3, 5], x: 450, y: 90, isActive: false, isQuery: true },
      { id: "n3", value: 4, range: [0, 1], x: 75, y: 150, isActive: false, isQuery: true },
      { id: "n4", value: 5, range: [2, 2], x: 225, y: 150, isActive: false, isQuery: false },
      { id: "n5", value: 16, range: [3, 4], x: 375, y: 150, isActive: true, isQuery: false },
      { id: "n6", value: 11, range: [5, 5], x: 525, y: 150, isActive: false, isQuery: false },
      { id: "n7", value: 1, range: [0, 0], x: 37, y: 210, isActive: false, isQuery: false },
      { id: "n8", value: 3, range: [1, 1], x: 112, y: 210, isActive: true, isQuery: false },
      { id: "n9", value: 7, range: [3, 3], x: 337, y: 210, isActive: false, isQuery: false },
      { id: "n10", value: 9, range: [4, 4], x: 412, y: 210, isActive: false, isQuery: false },
    ],
    array: baseArray,
    queryRange: [1, 4],
    result: 24,
    highlightLines: [13, 14, 15],
    description: "[1, 1] fully within range - use value 3! Total = 3 + 16 + 9 = 28? Wait, let me recalculate: 3 + 7 + 9 = 19.",
  },
  {
    step: 6,
    action: "update",
    nodes: [
      { id: "n0", value: 36, range: [0, 5], x: 300, y: 30, isActive: false, isQuery: false },
      { id: "n1", value: 9, range: [0, 2], x: 150, y: 90, isActive: true, isQuery: false },
      { id: "n2", value: 27, range: [3, 5], x: 450, y: 90, isActive: false, isQuery: false },
      { id: "n3", value: 4, range: [0, 1], x: 75, y: 150, isActive: false, isQuery: false },
      { id: "n4", value: 10, range: [2, 2], x: 225, y: 150, isActive: true, isQuery: false },
      { id: "n5", value: 16, range: [3, 4], x: 375, y: 150, isActive: false, isQuery: false },
      { id: "n6", value: 11, range: [5, 5], x: 525, y: 150, isActive: false, isQuery: false },
      { id: "n7", value: 1, range: [0, 0], x: 37, y: 210, isActive: false, isQuery: false },
      { id: "n8", value: 3, range: [1, 1], x: 112, y: 210, isActive: false, isQuery: false },
      { id: "n9", value: 7, range: [3, 3], x: 337, y: 210, isActive: false, isQuery: false },
      { id: "n10", value: 9, range: [4, 4], x: 412, y: 210, isActive: false, isQuery: false },
    ],
    array: [1, 3, 10, 7, 9, 11],
    highlightLines: [18, 19, 20],
    description: "Update index 2 from 5 to 10. Propagate changes up the tree.",
  },
  {
    step: 7,
    action: "update",
    nodes: [
      { id: "n0", value: 41, range: [0, 5], x: 300, y: 30, isActive: true, isQuery: false },
      { id: "n1", value: 14, range: [0, 2], x: 150, y: 90, isActive: true, isQuery: false },
      { id: "n2", value: 27, range: [3, 5], x: 450, y: 90, isActive: false, isQuery: false },
      { id: "n3", value: 4, range: [0, 1], x: 75, y: 150, isActive: false, isQuery: false },
      { id: "n4", value: 10, range: [2, 2], x: 225, y: 150, isActive: true, isQuery: false },
      { id: "n5", value: 16, range: [3, 4], x: 375, y: 150, isActive: false, isQuery: false },
      { id: "n6", value: 11, range: [5, 5], x: 525, y: 150, isActive: false, isQuery: false },
      { id: "n7", value: 1, range: [0, 0], x: 37, y: 210, isActive: false, isQuery: false },
      { id: "n8", value: 3, range: [1, 1], x: 112, y: 210, isActive: false, isQuery: false },
      { id: "n9", value: 7, range: [3, 3], x: 337, y: 210, isActive: false, isQuery: false },
      { id: "n10", value: 9, range: [4, 4], x: 412, y: 210, isActive: false, isQuery: false },
    ],
    array: [1, 3, 10, 7, 9, 11],
    highlightLines: [21, 22, 23],
    description: "Updated: leaf = 10, parent [0, 2] = 1+3+10 = 14, root = 14+27 = 41. Done!",
  },
];

export default function SegmentTreeVisualizer() {
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
        <h3 className="text-white font-semibold">Segment Tree Visualizer</h3>
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

      {/* Array Display */}
      <div className="px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-1 mb-1">
          {step.array.map((val, idx) => (
            <div key={idx} className="w-10 text-center">
              <div className={`w-10 h-8 flex items-center justify-center rounded text-white font-mono text-sm ${
                step.queryRange && idx >= step.queryRange[0] && idx <= step.queryRange[1] 
                  ? "bg-[#238636]" 
                  : "bg-[#21262d]"
              }`}>
                {val}
              </div>
              <span className="text-xs text-[#8b949e]">{idx}</span>
            </div>
          ))}
        </div>
        <span className="text-xs text-[#8b949e]">Original Array</span>
      </div>

      {/* Result Display */}
      {step.result !== undefined && (
        <div className="px-4 py-1 bg-[#238636]/20 border-b border-[#238636]">
          <span className="text-[#238636] font-bold">Query Result: {step.result}</span>
        </div>
      )}

      {/* Visualization Area */}
      <div className="flex-1 p-4 relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 600 250">
          {/* Edges */}
          {step.nodes.map((node) => {
            if (node.id === "n0") return null;
            const parentId = node.id === "n1" || node.id === "n2" ? "n0" :
                           node.id === "n3" || node.id === "n4" ? "n1" :
                           node.id === "n5" || node.id === "n6" ? "n2" :
                           node.id === "n7" || node.id === "n8" ? "n3" :
                           node.id === "n9" || node.id === "n10" ? "n5" : null;
            if (!parentId) return null;
            const parent = step.nodes.find(n => n.id === parentId);
            if (!parent) return null;
            return (
              <motion.line
                key={`edge-${node.id}`}
                x1={parent.x}
                y1={parent.y + 20}
                x2={node.x}
                y2={node.y - 20}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                stroke={node.isActive ? "#238636" : "#30363d"}
                strokeWidth={node.isActive ? 3 : 1}
              />
            );
          })}

          {/* Nodes */}
          {step.nodes.map((node) => (
            <motion.g key={node.id}>
              <motion.rect
                x={node.x - 25}
                y={node.y - 20}
                width={50}
                height={40}
                rx={5}
                animate={{
                  fill: node.isActive
                    ? "#238636"
                    : node.isQuery
                      ? "#1f6feb"
                      : "#21262d",
                  stroke: node.isActive ? "#3fb950" : node.isQuery ? "#58a6ff" : "#30363d",
                  strokeWidth: node.isActive ? 3 : 1
                }}
                transition={{ duration: 0.3 }}
              />
              <text
                x={node.x}
                y={node.y - 5}
                fill="white"
                fontSize="12"
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
                fontSize="9"
                textAnchor="middle"
                className="font-mono"
              >
                [{node.range[0]},{node.range[1]}]
              </text>
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
          <div className="w-4 h-4 bg-[#238636] rounded" />
          <span className="text-[#8b949e]">Active/Updated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#1f6feb] rounded" />
          <span className="text-[#8b949e]">In Query Path</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#21262d] border border-[#30363d] rounded" />
          <span className="text-[#8b949e]">Normal</span>
        </div>
      </div>
    </div>
  );
}
