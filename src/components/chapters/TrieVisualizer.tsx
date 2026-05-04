"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface TrieNode {
  id: string;
  char: string;
  x: number;
  y: number;
  isActive: boolean;
  isEnd: boolean;
  children: string[];
}

interface AlgorithmStep {
  step: number;
  action: string;
  nodes: TrieNode[];
  activeNodeId: string | null;
  word: string;
  highlightLines: number[];
  description: string;
}

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    nodes: [
      { id: "root", char: "", x: 250, y: 30, isActive: false, isEnd: false, children: ["c", "d"] },
      { id: "c", char: "c", x: 150, y: 90, isActive: false, isEnd: false, children: ["ca", "co"] },
      { id: "d", char: "d", x: 350, y: 90, isActive: false, isEnd: false, children: ["do"] },
      { id: "ca", char: "a", x: 100, y: 150, isActive: false, isEnd: false, children: ["cat"] },
      { id: "co", char: "o", x: 200, y: 150, isActive: false, isEnd: false, children: ["cow"] },
      { id: "do", char: "o", x: 350, y: 150, isActive: false, isEnd: false, children: ["dog", "dot"] },
      { id: "cat", char: "t", x: 100, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "cow", char: "w", x: 200, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "dog", char: "g", x: 300, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "dot", char: "t", x: 400, y: 210, isActive: false, isEnd: true, children: [] },
    ],
    activeNodeId: null,
    word: "",
    highlightLines: [1, 2, 3],
    description: "Initialize Trie with words: cat, cow, dog, dot. Root is empty.",
  },
  {
    step: 1,
    action: "insert",
    nodes: [
      { id: "root", char: "", x: 250, y: 30, isActive: true, isEnd: false, children: ["c", "d", "r"] },
      { id: "c", char: "c", x: 150, y: 90, isActive: false, isEnd: false, children: ["ca", "co"] },
      { id: "d", char: "d", x: 350, y: 90, isActive: false, isEnd: false, children: ["do"] },
      { id: "ca", char: "a", x: 100, y: 150, isActive: false, isEnd: false, children: ["cat"] },
      { id: "co", char: "o", x: 200, y: 150, isActive: false, isEnd: false, children: ["cow"] },
      { id: "do", char: "o", x: 350, y: 150, isActive: false, isEnd: false, children: ["dog", "dot"] },
      { id: "cat", char: "t", x: 100, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "cow", char: "w", x: 200, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "dog", char: "g", x: 300, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "dot", char: "t", x: 400, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "r", char: "r", x: 250, y: 90, isActive: false, isEnd: false, children: ["ra"] },
      { id: "ra", char: "a", x: 250, y: 150, isActive: false, isEnd: false, children: ["rat"] },
      { id: "rat", char: "t", x: 250, y: 210, isActive: false, isEnd: true, children: [] },
    ],
    activeNodeId: "root",
    word: "rat",
    highlightLines: [5, 6, 7],
    description: "Insert 'rat': Create new branch from root. r → a → t.",
  },
  {
    step: 2,
    action: "search",
    nodes: [
      { id: "root", char: "", x: 250, y: 30, isActive: true, isEnd: false, children: ["c", "d", "r"] },
      { id: "c", char: "c", x: 150, y: 90, isActive: false, isEnd: false, children: ["ca", "co"] },
      { id: "d", char: "d", x: 350, y: 90, isActive: false, isEnd: false, children: ["do"] },
      { id: "ca", char: "a", x: 100, y: 150, isActive: false, isEnd: false, children: ["cat"] },
      { id: "co", char: "o", x: 200, y: 150, isActive: false, isEnd: false, children: ["cow"] },
      { id: "do", char: "o", x: 350, y: 150, isActive: false, isEnd: false, children: ["dog", "dot"] },
      { id: "cat", char: "t", x: 100, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "cow", char: "w", x: 200, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "dog", char: "g", x: 300, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "dot", char: "t", x: 400, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "r", char: "r", x: 250, y: 90, isActive: false, isEnd: false, children: ["ra"] },
      { id: "ra", char: "a", x: 250, y: 150, isActive: false, isEnd: false, children: ["rat"] },
      { id: "rat", char: "t", x: 250, y: 210, isActive: false, isEnd: true, children: [] },
    ],
    activeNodeId: "root",
    word: "cat",
    highlightLines: [10, 11, 12],
    description: "Search 'cat': Start at root. Follow 'c' → 'a' → 't'. Check isEnd flag.",
  },
  {
    step: 3,
    action: "search",
    nodes: [
      { id: "root", char: "", x: 250, y: 30, isActive: false, isEnd: false, children: ["c", "d", "r"] },
      { id: "c", char: "c", x: 150, y: 90, isActive: true, isEnd: false, children: ["ca", "co"] },
      { id: "d", char: "d", x: 350, y: 90, isActive: false, isEnd: false, children: ["do"] },
      { id: "ca", char: "a", x: 100, y: 150, isActive: false, isEnd: false, children: ["cat"] },
      { id: "co", char: "o", x: 200, y: 150, isActive: false, isEnd: false, children: ["cow"] },
      { id: "do", char: "o", x: 350, y: 150, isActive: false, isEnd: false, children: ["dog", "dot"] },
      { id: "cat", char: "t", x: 100, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "cow", char: "w", x: 200, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "dog", char: "g", x: 300, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "dot", char: "t", x: 400, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "r", char: "r", x: 250, y: 90, isActive: false, isEnd: false, children: ["ra"] },
      { id: "ra", char: "a", x: 250, y: 150, isActive: false, isEnd: false, children: ["rat"] },
      { id: "rat", char: "t", x: 250, y: 210, isActive: false, isEnd: true, children: [] },
    ],
    activeNodeId: "c",
    word: "cat",
    highlightLines: [13, 14],
    description: "Found 'c' node. Continue to child 'a'.",
  },
  {
    step: 4,
    action: "search",
    nodes: [
      { id: "root", char: "", x: 250, y: 30, isActive: false, isEnd: false, children: ["c", "d", "r"] },
      { id: "c", char: "c", x: 150, y: 90, isActive: false, isEnd: false, children: ["ca", "co"] },
      { id: "d", char: "d", x: 350, y: 90, isActive: false, isEnd: false, children: ["do"] },
      { id: "ca", char: "a", x: 100, y: 150, isActive: true, isEnd: false, children: ["cat"] },
      { id: "co", char: "o", x: 200, y: 150, isActive: false, isEnd: false, children: ["cow"] },
      { id: "do", char: "o", x: 350, y: 150, isActive: false, isEnd: false, children: ["dog", "dot"] },
      { id: "cat", char: "t", x: 100, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "cow", char: "w", x: 200, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "dog", char: "g", x: 300, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "dot", char: "t", x: 400, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "r", char: "r", x: 250, y: 90, isActive: false, isEnd: false, children: ["ra"] },
      { id: "ra", char: "a", x: 250, y: 150, isActive: false, isEnd: false, children: ["rat"] },
      { id: "rat", char: "t", x: 250, y: 210, isActive: false, isEnd: true, children: [] },
    ],
    activeNodeId: "ca",
    word: "cat",
    highlightLines: [13, 14],
    description: "Found 'a' node. Continue to child 't'.",
  },
  {
    step: 5,
    action: "search",
    nodes: [
      { id: "root", char: "", x: 250, y: 30, isActive: false, isEnd: false, children: ["c", "d", "r"] },
      { id: "c", char: "c", x: 150, y: 90, isActive: false, isEnd: false, children: ["ca", "co"] },
      { id: "d", char: "d", x: 350, y: 90, isActive: false, isEnd: false, children: ["do"] },
      { id: "ca", char: "a", x: 100, y: 150, isActive: false, isEnd: false, children: ["cat"] },
      { id: "co", char: "o", x: 200, y: 150, isActive: false, isEnd: false, children: ["cow"] },
      { id: "do", char: "o", x: 350, y: 150, isActive: false, isEnd: false, children: ["dog", "dot"] },
      { id: "cat", char: "t", x: 100, y: 210, isActive: true, isEnd: true, children: [] },
      { id: "cow", char: "w", x: 200, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "dog", char: "g", x: 300, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "dot", char: "t", x: 400, y: 210, isActive: false, isEnd: true, children: [] },
      { id: "r", char: "r", x: 250, y: 90, isActive: false, isEnd: false, children: ["ra"] },
      { id: "ra", char: "a", x: 250, y: 150, isActive: false, isEnd: false, children: ["rat"] },
      { id: "rat", char: "t", x: 250, y: 210, isActive: false, isEnd: true, children: [] },
    ],
    activeNodeId: "cat",
    word: "cat",
    highlightLines: [15, 16, 17],
    description: "Found 't' node. isEnd = true. Word 'cat' exists in Trie!",
  },
];

export default function TrieVisualizer() {
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
        <h3 className="text-white font-semibold">Trie Visualizer</h3>
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

      {/* Word Display */}
      {step.word && (
        <div className="px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
          <span className="text-[#8b949e]">Word: </span>
          <span className="text-white font-mono text-lg tracking-wider">{step.word}</span>
        </div>
      )}

      {/* Visualization Area */}
      <div className="flex-1 p-4 relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 500 250">
          {/* Edges */}
          {step.nodes.map((node) => {
            if (node.id === "root") return null;
            // Find parent
            const parent = step.nodes.find(n => n.children.includes(node.id));
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
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.id === "root" ? 15 : 20}
                animate={{
                  fill: node.isActive
                    ? "#238636"
                    : node.isEnd
                      ? "#8957e5"
                      : "#21262d",
                  stroke: node.isActive ? "#3fb950" : node.isEnd ? "#a371f7" : "#30363d",
                  strokeWidth: node.isActive ? 3 : node.isEnd ? 2 : 1
                }}
                transition={{ duration: 0.3 }}
              />
              {node.id !== "root" && (
                <text
                  x={node.x}
                  y={node.y}
                  dy="5"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {node.char}
                </text>
              )}
              {/* End marker */}
              {node.isEnd && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={8}
                  fill="none"
                  stroke="#a371f7"
                  strokeWidth={2}
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
          <span className="text-[#8b949e]">End of Word</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#21262d] border border-[#30363d] rounded-full" />
          <span className="text-[#8b949e]">Prefix</span>
        </div>
      </div>
    </div>
  );
}
