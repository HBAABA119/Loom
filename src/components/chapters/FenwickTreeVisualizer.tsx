"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface FenwickNode {
  id: string;
  index: number;
  value: number;
  range: [number, number];
  isActive: boolean;
  isQuery: boolean;
}

interface AlgorithmStep {
  step: number;
  action: string;
  nodes: FenwickNode[];
  array: number[];
  queryIndex?: number;
  result?: number;
  highlightLines: number[];
  description: string;
}

const baseArray = [3, 2, -1, 6, 5, 4, -3, 3];

// Calculate Fenwick tree values
const calcFenwick = (arr: number[]) => {
  const n = arr.length;
  const bit = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) {
    let idx = i + 1;
    while (idx <= n) {
      bit[idx] += arr[i];
      idx += idx & -idx;
    }
  }
  return bit.slice(1);
};

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    nodes: calcFenwick(baseArray).map((val, i) => ({
      id: `bit${i + 1}`,
      index: i + 1,
      value: val,
      range: [i + 1 - (i + 1 & -(i + 1)) + 1, i + 1],
      isActive: false,
      isQuery: false
    })),
    array: baseArray,
    highlightLines: [1, 2, 3],
    description: "Fenwick Tree (BIT) for prefix sum queries. BIT[i] stores sum of range [i - LSB(i) + 1, i].",
  },
  {
    step: 1,
    action: "query",
    nodes: calcFenwick(baseArray).map((val, i) => ({
      id: `bit${i + 1}`,
      index: i + 1,
      value: val,
      range: [i + 1 - (i + 1 & -(i + 1)) + 1, i + 1],
      isActive: false,
      isQuery: i + 1 === 6
    })),
    array: baseArray,
    queryIndex: 6,
    highlightLines: [5, 6, 7],
    description: "Query prefix sum [1, 6]. Start at index 6. Binary: 110, LSB = 2.",
  },
  {
    step: 2,
    action: "query",
    nodes: calcFenwick(baseArray).map((val, i) => ({
      id: `bit${i + 1}`,
      index: i + 1,
      value: val,
      range: [i + 1 - (i + 1 & -(i + 1)) + 1, i + 1],
      isActive: i + 1 === 6,
      isQuery: i + 1 === 6 || i + 1 === 4
    })),
    array: baseArray,
    queryIndex: 6,
    result: 16,
    highlightLines: [8, 9],
    description: "Add BIT[6] = 12. Remove LSB: 6 → 4 (110 → 100).",
  },
  {
    step: 3,
    action: "query",
    nodes: calcFenwick(baseArray).map((val, i) => ({
      id: `bit${i + 1}`,
      index: i + 1,
      value: val,
      range: [i + 1 - (i + 1 & -(i + 1)) + 1, i + 1],
      isActive: i + 1 === 4,
      isQuery: i + 1 === 6 || i + 1 === 4 || i + 1 === 0
    })),
    array: baseArray,
    queryIndex: 6,
    result: 16,
    highlightLines: [8, 9],
    description: "Add BIT[4] = 4. Sum = 12 + 4 = 16. Remove LSB: 4 → 0. Stop!",
  },
  {
    step: 4,
    action: "update",
    nodes: calcFenwick(baseArray).map((val, i) => ({
      id: `bit${i + 1}`,
      index: i + 1,
      value: i + 1 === 3 ? val + 5 : val,
      range: [i + 1 - (i + 1 & -(i + 1)) + 1, i + 1],
      isActive: i + 1 === 3,
      isQuery: false
    })),
    array: baseArray.map((v, i) => i === 2 ? v + 5 : v),
    highlightLines: [12, 13, 14],
    description: "Update index 3 by +5. Propagate up: 3 → 4 → 8.",
  },
  {
    step: 5,
    action: "update",
    nodes: calcFenwick(baseArray).map((val, i) => ({
      id: `bit${i + 1}`,
      index: i + 1,
      value: i + 1 === 3 ? val + 5 : i + 1 === 4 ? val + 5 : val,
      range: [i + 1 - (i + 1 & -(i + 1)) + 1, i + 1],
      isActive: i + 1 === 4,
      isQuery: false
    })),
    array: baseArray.map((v, i) => i === 2 ? v + 5 : v),
    highlightLines: [15, 16],
    description: "Update BIT[4] by +5. Add LSB: 4 → 8 (100 → 1000).",
  },
  {
    step: 6,
    action: "update",
    nodes: calcFenwick(baseArray).map((val, i) => ({
      id: `bit${i + 1}`,
      index: i + 1,
      value: i + 1 === 3 ? val + 5 : i + 1 === 4 ? val + 5 : i + 1 === 8 ? val + 5 : val,
      range: [i + 1 - (i + 1 & -(i + 1)) + 1, i + 1],
      isActive: i + 1 === 8,
      isQuery: false
    })),
    array: baseArray.map((v, i) => i === 2 ? v + 5 : v),
    highlightLines: [15, 16],
    description: "Update BIT[8] by +5. Add LSB: 8 → 16 > n. Stop!",
  },
];

export default function FenwickTreeVisualizer() {
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

  // Calculate LSB
  const lsb = (n: number) => n & -n;

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Fenwick Tree (BIT) Visualizer</h3>
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
            <div key={idx} className="w-12 text-center">
              <div className={`w-12 h-8 flex items-center justify-center rounded text-white font-mono text-sm ${
                step.queryIndex !== undefined && idx < step.queryIndex 
                  ? "bg-[#238636]" 
                  : "bg-[#21262d]"
              }`}>
                {val}
              </div>
              <span className="text-xs text-[#8b949e]">{idx + 1}</span>
            </div>
          ))}
        </div>
        <span className="text-xs text-[#8b949e]">Original Array (1-indexed)</span>
      </div>

      {/* Result Display */}
      {step.result !== undefined && (
        <div className="px-4 py-1 bg-[#238636]/20 border-b border-[#238636]">
          <span className="text-[#238636] font-bold">Prefix Sum Result: {step.result}</span>
        </div>
      )}

      {/* Visualization Area */}
      <div className="flex-1 p-4 relative overflow-hidden">
        <div className="flex flex-col gap-3 max-w-4xl mx-auto">
          {step.nodes.map((node) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-4 p-3 rounded-lg border-2 ${
                node.isActive
                  ? "border-[#238636] bg-[#238636]/20"
                  : node.isQuery
                    ? "border-[#1f6feb] bg-[#1f6feb]/20"
                    : "border-[#30363d] bg-[#21262d]"
              }`}
            >
              {/* Index */}
              <div className="w-12 h-12 flex flex-col items-center justify-center bg-[#0d1117] rounded">
                <span className="text-white font-mono font-bold">{node.index}</span>
                <span className="text-xs text-[#8b949e]">idx</span>
              </div>

              {/* Binary representation */}
              <div className="w-20 text-center">
                <span className="text-[#58a6ff] font-mono text-sm">
                  {node.index.toString(2).padStart(4, '0')}
                </span>
                <p className="text-xs text-[#8b949e]">binary</p>
              </div>

              {/* LSB */}
              <div className="w-16 text-center">
                <span className="text-[#d29922] font-mono font-bold">
                  {lsb(node.index)}
                </span>
                <p className="text-xs text-[#8b949e]">LSB</p>
              </div>

              {/* Range */}
              <div className="w-24 text-center">
                <span className="text-white font-mono text-sm">
                  [{node.range[0]},{node.range[1]}]
                </span>
                <p className="text-xs text-[#8b949e]">range</p>
              </div>

              {/* Value */}
              <div className={`w-16 h-12 flex items-center justify-center rounded font-mono font-bold ${
                node.isActive ? "bg-[#238636]" : "bg-[#30363d]"
              }`}>
                <span className="text-white">{node.value}</span>
              </div>

              <div className="text-[#8b949e]">=</div>

              {/* Sum representation */}
              <span className="text-[#8b949e] text-sm">
                sum of arr[{node.range[0]}..{node.range[1]}]
              </span>
            </motion.div>
          ))}
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
