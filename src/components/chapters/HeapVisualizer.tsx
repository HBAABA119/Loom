"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface HeapNode {
  id: string;
  value: number;
  index: number;
  isActive: boolean;
  isComparing: boolean;
  isSwapped: boolean;
  level: number;
  position: number;
}

interface AlgorithmStep {
  step: number;
  action: string;
  nodes: HeapNode[];
  activeIndices: number[];
  highlightLines: number[];
  description: string;
}

const heapSize = 7;

const initialHeap: HeapNode[] = [
  { id: "n0", value: 50, index: 0, isActive: false, isComparing: false, isSwapped: false, level: 0, position: 0 },
  { id: "n1", value: 30, index: 1, isActive: false, isComparing: false, isSwapped: false, level: 1, position: 0 },
  { id: "n2", value: 40, index: 2, isActive: false, isComparing: false, isSwapped: false, level: 1, position: 1 },
  { id: "n3", value: 20, index: 3, isActive: false, isComparing: false, isSwapped: false, level: 2, position: 0 },
  { id: "n4", value: 25, index: 4, isActive: false, isComparing: false, isSwapped: false, level: 2, position: 1 },
  { id: "n5", value: 35, index: 5, isActive: false, isComparing: false, isSwapped: false, level: 2, position: 2 },
  { id: "n6", value: 10, index: 6, isActive: false, isComparing: false, isSwapped: false, level: 2, position: 3 },
];

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    nodes: initialHeap.map(n => ({ ...n })),
    activeIndices: [],
    highlightLines: [1, 2, 3],
    description: "Initialize max heap with 7 elements. Parent > children property.",
  },
  {
    step: 1,
    action: "insert",
    nodes: [
      ...initialHeap,
      { id: "n7", value: 45, index: 7, isActive: true, isComparing: false, isSwapped: false, level: 3, position: 0 }
    ],
    activeIndices: [7],
    highlightLines: [5, 6, 7],
    description: "Insert 45 at end (index 7). Need to heapify up.",
  },
  {
    step: 2,
    action: "heapify-up",
    nodes: [
      ...initialHeap.slice(0, 3),
      { id: "n3", value: 45, index: 3, isActive: true, isComparing: true, isSwapped: true, level: 2, position: 0 },
      ...initialHeap.slice(4),
      { id: "n7", value: 20, index: 7, isActive: false, isComparing: false, isSwapped: false, level: 3, position: 0 }
    ],
    activeIndices: [3, 7],
    highlightLines: [8, 9, 10],
    description: "Compare 45 with parent (20). 45 > 20, swap. Now at index 3.",
  },
  {
    step: 3,
    action: "heapify-up",
    nodes: [
      initialHeap[0],
      { id: "n1", value: 45, index: 1, isActive: true, isComparing: true, isSwapped: true, level: 1, position: 0 },
      initialHeap[2],
      { id: "n3", value: 30, index: 3, isActive: false, isComparing: false, isSwapped: false, level: 2, position: 0 },
      ...initialHeap.slice(4),
      { id: "n7", value: 20, index: 7, isActive: false, isComparing: false, isSwapped: false, level: 3, position: 0 }
    ],
    activeIndices: [1, 3],
    highlightLines: [8, 9, 10],
    description: "Compare 45 with parent (30). 45 > 30, swap. Now at index 1.",
  },
  {
    step: 4,
    action: "heapify-up",
    nodes: [
      { id: "n0", value: 45, index: 0, isActive: true, isComparing: true, isSwapped: true, level: 0, position: 0 },
      { id: "n1", value: 50, index: 1, isActive: false, isComparing: false, isSwapped: false, level: 1, position: 0 },
      initialHeap[2],
      { id: "n3", value: 30, index: 3, isActive: false, isComparing: false, isSwapped: false, level: 2, position: 0 },
      ...initialHeap.slice(4),
      { id: "n7", value: 20, index: 7, isActive: false, isComparing: false, isSwapped: false, level: 3, position: 0 }
    ],
    activeIndices: [0, 1],
    highlightLines: [8, 9, 10],
    description: "Compare 45 with parent (50). 45 < 50, stop. Heap property restored.",
  },
  {
    step: 5,
    action: "extract-max",
    nodes: initialHeap.map((n, i) => ({ ...n, isActive: i === 0, isComparing: false, isSwapped: false })),
    activeIndices: [0],
    highlightLines: [13, 14, 15],
    description: "Extract max (50). Replace root with last element (10).",
  },
  {
    step: 6,
    action: "heapify-down",
    nodes: [
      { id: "n0", value: 10, index: 0, isActive: true, isComparing: true, isSwapped: false, level: 0, position: 0 },
      { id: "n1", value: 45, index: 1, isActive: false, isComparing: true, isSwapped: false, level: 1, position: 0 },
      { id: "n2", value: 40, index: 2, isActive: false, isComparing: true, isSwapped: false, level: 1, position: 1 },
      ...initialHeap.slice(3)
    ],
    activeIndices: [0, 1, 2],
    highlightLines: [16, 17, 18],
    description: "Heapify down: Compare 10 with children (45, 40). Largest child is 45.",
  },
  {
    step: 7,
    action: "heapify-down",
    nodes: [
      { id: "n0", value: 45, index: 0, isActive: true, isComparing: false, isSwapped: true, level: 0, position: 0 },
      { id: "n1", value: 10, index: 1, isActive: false, isComparing: true, isSwapped: false, level: 1, position: 0 },
      initialHeap[2],
      { id: "n3", value: 30, index: 3, isActive: false, isComparing: true, isSwapped: false, level: 2, position: 0 },
      ...initialHeap.slice(4)
    ],
    activeIndices: [1, 3, 4],
    highlightLines: [19, 20, 21],
    description: "10 < 45, swap. Now at index 1. Compare 10 with children (30, 25).",
  },
  {
    step: 8,
    action: "heapify-down",
    nodes: [
      { id: "n0", value: 45, index: 0, isActive: false, isComparing: false, isSwapped: false, level: 0, position: 0 },
      { id: "n1", value: 30, index: 1, isActive: false, isComparing: false, isSwapped: true, level: 1, position: 0 },
      initialHeap[2],
      { id: "n3", value: 10, index: 3, isActive: true, isComparing: false, isSwapped: false, level: 2, position: 0 },
      ...initialHeap.slice(4)
    ],
    activeIndices: [3],
    highlightLines: [19, 20, 21],
    description: "10 < 30, swap. Now at index 3 (leaf). Heap property restored.",
  },
];

export default function HeapVisualizer() {
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

  // Calculate positions for tree layout
  const getX = (node: HeapNode) => {
    const levelWidth = 500;
    const nodesInLevel = Math.pow(2, node.level);
    const nodeWidth = levelWidth / nodesInLevel;
    return nodeWidth * node.position + nodeWidth / 2;
  };

  const getY = (node: HeapNode) => node.level * 80 + 50;

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Heap Visualizer</h3>
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

      {/* Visualization Area */}
      <div className="flex-1 p-8 relative overflow-hidden">
        {/* Heap Tree SVG */}
        <svg className="w-full h-full" viewBox="0 0 500 300">
          {/* Edges (parent-child connections) */}
          {step.nodes.map((node) => {
            if (node.index === 0) return null;
            const parentIndex = Math.floor((node.index - 1) / 2);
            const parent = step.nodes.find(n => n.index === parentIndex);
            if (!parent) return null;
            return (
              <motion.line
                key={`edge-${node.index}`}
                x1={getX(parent)}
                y1={getY(parent)}
                x2={getX(node)}
                y2={getY(node)}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                stroke="#30363d"
                strokeWidth="2"
              />
            );
          })}

          {/* Nodes */}
          {step.nodes.map((node, index) => (
            <motion.g key={node.id}>
              <motion.circle
                cx={getX(node)}
                cy={getY(node)}
                r={25}
                animate={{
                  fill: node.isActive
                    ? "#238636"
                    : node.isComparing
                      ? "#d29922"
                      : node.isSwapped
                        ? "#8957e5"
                        : "#21262d",
                  stroke: node.isActive ? "#3fb950" : "#30363d",
                  strokeWidth: node.isActive ? 3 : 2
                }}
                transition={{ duration: 0.3 }}
              />
              <text
                x={getX(node)}
                y={getY(node)}
                dy="5"
                fill="white"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                className="font-mono"
              >
                {node.value}
              </text>
              {/* Index label */}
              <text
                x={getX(node)}
                y={getY(node) + 40}
                fill="#8b949e"
                fontSize="10"
                textAnchor="middle"
                className="font-mono"
              >
                i:{node.index}
              </text>
            </motion.g>
          ))}
        </svg>

        {/* Array Representation */}
        <div className="absolute top-4 left-4 right-4">
          <div className="flex items-center justify-center gap-1">
            {step.nodes.slice(0, heapSize).map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  backgroundColor: node.isActive
                    ? "#238636"
                    : node.isComparing
                      ? "#d29922"
                      : "#21262d",
                  borderColor: node.isActive ? "#3fb950" : "#30363d"
                }}
                transition={{ delay: index * 0.05 }}
                className="w-10 h-10 flex items-center justify-center rounded border-2 text-white font-mono text-sm"
              >
                {node.value}
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-[#8b949e] mt-2">Array Representation</p>
        </div>

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
          <span className="text-[#8b949e]">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#d29922] rounded" />
          <span className="text-[#8b949e]">Comparing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#8957e5] rounded" />
          <span className="text-[#8b949e]">Swapped</span>
        </div>
      </div>
    </div>
  );
}
