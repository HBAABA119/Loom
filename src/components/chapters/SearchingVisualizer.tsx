"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface ArrayElement {
  id: string;
  value: number;
  index: number;
  isActive: boolean;
  isLow: boolean;
  isHigh: boolean;
  isMid: boolean;
  isFound: boolean;
}

interface AlgorithmStep {
  step: number;
  action: string;
  array: ArrayElement[];
  target: number;
  comparisons: number;
  highlightLines: number[];
  description: string;
}

const sortedArray = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    array: sortedArray.map((val, i) => ({
      id: `e${i}`,
      value: val,
      index: i,
      isActive: false,
      isLow: false,
      isHigh: false,
      isMid: false,
      isFound: false
    })),
    target: 23,
    comparisons: 0,
    highlightLines: [1, 2, 3],
    description: "Binary Search on sorted array. Target = 23. Initial range: low=0, high=9.",
  },
  {
    step: 1,
    action: "search",
    array: sortedArray.map((val, i) => ({
      id: `e${i}`,
      value: val,
      index: i,
      isActive: i >= 0 && i <= 9,
      isLow: i === 0,
      isHigh: i === 9,
      isMid: i === 4,
      isFound: false
    })),
    target: 23,
    comparisons: 1,
    highlightLines: [4, 5, 6],
    description: "mid = (0 + 9) / 2 = 4. arr[4] = 16. 16 < 23, search right half.",
  },
  {
    step: 2,
    action: "search",
    array: sortedArray.map((val, i) => ({
      id: `e${i}`,
      value: val,
      index: i,
      isActive: i >= 5 && i <= 9,
      isLow: i === 5,
      isHigh: i === 9,
      isMid: i === 7,
      isFound: false
    })),
    target: 23,
    comparisons: 2,
    highlightLines: [7, 8, 9],
    description: "low = 5, high = 9. mid = 7. arr[7] = 56. 56 > 23, search left half.",
  },
  {
    step: 3,
    action: "search",
    array: sortedArray.map((val, i) => ({
      id: `e${i}`,
      value: val,
      index: i,
      isActive: i >= 5 && i <= 6,
      isLow: i === 5,
      isHigh: i === 6,
      isMid: i === 5,
      isFound: false
    })),
    target: 23,
    comparisons: 3,
    highlightLines: [10, 11, 12],
    description: "low = 5, high = 6. mid = 5. arr[5] = 23. 23 == 23. FOUND!",
  },
  {
    step: 4,
    action: "found",
    array: sortedArray.map((val, i) => ({
      id: `e${i}`,
      value: val,
      index: i,
      isActive: false,
      isLow: false,
      isHigh: false,
      isMid: false,
      isFound: i === 5
    })),
    target: 23,
    comparisons: 3,
    highlightLines: [13, 14],
    description: "Return index 5. Binary search completed in 3 comparisons. Time: O(log n).",
  },
  {
    step: 5,
    action: "linear-search",
    array: sortedArray.map((val, i) => ({
      id: `e${i}`,
      value: val,
      index: i,
      isActive: i <= 3,
      isLow: false,
      isHigh: false,
      isMid: i === 3,
      isFound: false
    })),
    target: 12,
    comparisons: 4,
    highlightLines: [17, 18, 19],
    description: "Linear Search for 12: Check each element. Found at index 3. Time: O(n).",
  },
  {
    step: 6,
    action: "found",
    array: sortedArray.map((val, i) => ({
      id: `e${i}`,
      value: val,
      index: i,
      isActive: false,
      isLow: false,
      isHigh: false,
      isMid: false,
      isFound: i === 3
    })),
    target: 12,
    comparisons: 4,
    highlightLines: [20, 21],
    description: "Linear search took 4 comparisons vs Binary search took 3.",
  },
];

export default function SearchingVisualizer() {
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
        <h3 className="text-white font-semibold">Searching Algorithms Visualizer</h3>
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

      {/* Target Display */}
      <div className="px-4 py-2 bg-[#161b22] border-b border-[#30363d] flex items-center gap-4">
        <span className="text-[#8b949e]">Target:</span>
        <span className="text-[#f0883e] font-mono text-xl font-bold">{step.target}</span>
        <span className="text-[#8b949e] ml-4">Comparisons:</span>
        <span className="text-[#58a6ff] font-mono font-bold">{step.comparisons}</span>
      </div>

      {/* Visualization Area */}
      <div className="flex-1 p-8 relative overflow-hidden">
        {/* Array Container */}
        <div className="flex items-end justify-center gap-1 h-48">
          {step.array.map((element) => (
            <div key={element.id} className="flex flex-col items-center gap-2">
              {/* Index label */}
              <span className={`text-xs font-mono ${
                element.isLow ? "text-[#238636] font-bold" : 
                element.isHigh ? "text-[#f0883e] font-bold" : 
                element.isMid ? "text-[#58a6ff] font-bold" : "text-[#8b949e]"
              }`}>
                {element.isLow ? "L" : element.isHigh ? "H" : element.isMid ? "M" : element.index}
              </span>
              
              {/* Array Element */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  backgroundColor: element.isFound
                    ? "#238636"
                    : element.isMid
                      ? "#58a6ff"
                      : element.isActive
                        ? "#8957e5"
                        : "#21262d",
                  borderColor: element.isFound
                    ? "#3fb950"
                    : element.isMid
                      ? "#79c0ff"
                      : element.isLow
                        ? "#238636"
                        : element.isHigh
                          ? "#f0883e"
                          : "#30363d",
                  height: element.isFound ? 80 : element.isMid ? 70 : element.isActive ? 60 : 50
                }}
                transition={{ duration: 0.3 }}
                className="w-14 flex items-center justify-center rounded-lg border-2 text-white font-mono font-bold"
                style={{ height: element.isFound ? 80 : element.isMid ? 70 : element.isActive ? 60 : 50 }}
              >
                {element.value}
              </motion.div>
            </div>
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
          <span className="text-[#8b949e]">Found/Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#58a6ff] rounded" />
          <span className="text-[#8b949e]">Mid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#f0883e] rounded" />
          <span className="text-[#8b949e]">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#8957e5] rounded" />
          <span className="text-[#8b949e]">Active Range</span>
        </div>
      </div>
    </div>
  );
}
