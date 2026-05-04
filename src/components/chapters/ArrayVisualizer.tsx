"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface ArrayElement {
  id: string;
  value: number;
  index: number;
  isActive: boolean;
  isComparing: boolean;
  isSwapped: boolean;
}

interface AlgorithmStep {
  step: number;
  action: string;
  array: ArrayElement[];
  activeIndex: number | null;
  comparingIndices: number[];
  highlightLines: number[];
  description: string;
}

const initialArray: ArrayElement[] = [
  { id: "e0", value: 64, index: 0, isActive: false, isComparing: false, isSwapped: false },
  { id: "e1", value: 34, index: 1, isActive: false, isComparing: false, isSwapped: false },
  { id: "e2", value: 25, index: 2, isActive: false, isComparing: false, isSwapped: false },
  { id: "e3", value: 12, index: 3, isActive: false, isComparing: false, isSwapped: false },
  { id: "e4", value: 22, index: 4, isActive: false, isComparing: false, isSwapped: false },
  { id: "e5", value: 11, index: 5, isActive: false, isComparing: false, isSwapped: false },
  { id: "e6", value: 90, index: 6, isActive: false, isComparing: false, isSwapped: false },
];

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    array: initialArray.map(e => ({ ...e })),
    activeIndex: null,
    comparingIndices: [],
    highlightLines: [1, 2],
    description: "Initialize array with 7 elements: [64, 34, 25, 12, 22, 11, 90]",
  },
  {
    step: 1,
    action: "access",
    array: initialArray.map((e, i) => ({ ...e, isActive: i === 0 })),
    activeIndex: 0,
    comparingIndices: [],
    highlightLines: [4, 5],
    description: "Access element at index 0: array[0] = 64",
  },
  {
    step: 2,
    action: "access",
    array: initialArray.map((e, i) => ({ ...e, isActive: i === 3 })),
    activeIndex: 3,
    comparingIndices: [],
    highlightLines: [4, 5],
    description: "Access element at index 3: array[3] = 12",
  },
  {
    step: 3,
    action: "search",
    array: initialArray.map((e, i) => ({ ...e, isActive: i <= 2, isComparing: i === 2 })),
    activeIndex: 2,
    comparingIndices: [2],
    highlightLines: [8, 9, 10],
    description: "Linear search for value 25: Found at index 2",
  },
  {
    step: 4,
    action: "insert",
    array: [
      ...initialArray.slice(0, 3).map(e => ({ ...e })),
      { id: "new", value: 50, index: 3, isActive: true, isComparing: false, isSwapped: false },
      ...initialArray.slice(3).map((e, i) => ({ ...e, index: e.index + 1 })),
    ],
    activeIndex: 3,
    comparingIndices: [],
    highlightLines: [13, 14, 15],
    description: "Insert 50 at index 3: Elements shift right",
  },
  {
    step: 5,
    action: "delete",
    array: initialArray.filter((_, i) => i !== 2).map((e, i) => ({ ...e, index: i, isActive: i === 2 })),
    activeIndex: 2,
    comparingIndices: [],
    highlightLines: [18, 19, 20],
    description: "Delete element at index 2: Elements shift left",
  },
];

export default function ArrayVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setStep, setTotalSteps, nextStep, prevStep } = useTimeline();
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
        <h3 className="text-white font-semibold">Array Operations Visualizer</h3>
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
        {/* Array Container */}
        <div className="flex items-end justify-center gap-1 h-64">
          {step.array.map((element, index) => (
            <div key={element.id} className="flex flex-col items-center gap-2">
              {/* Index label */}
              <span className="text-xs text-[#8b949e]">{element.index}</span>
              
              {/* Array Element */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  backgroundColor: element.isActive 
                    ? "#238636" 
                    : element.isComparing 
                      ? "#d29922" 
                      : element.isSwapped 
                        ? "#8957e5" 
                        : "#21262d",
                  borderColor: element.isActive 
                    ? "#3fb950" 
                    : element.isComparing 
                      ? "#e3b341" 
                      : "#30363d",
                }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="w-14 h-14 flex items-center justify-center rounded-lg border-2 text-white font-mono font-bold"
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
            <span>Action: <span className="text-[#58a6ff]">{step.action}</span></span>
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
          <span className="text-[#8b949e]">Modified</span>
        </div>
      </div>
    </div>
  );
}
