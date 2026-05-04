"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface ArrayElement {
  id: string;
  value: number;
  index: number;
  isComparing: boolean;
  isSwapping: boolean;
  isSorted: boolean;
}

interface AlgorithmStep {
  step: number;
  action: string;
  array: ArrayElement[];
  comparisons: number;
  swaps: number;
  highlightLines: number[];
  description: string;
  algorithm: string;
}

const initialArray = [64, 34, 25, 12, 22, 11, 90, 5];

const bubbleSortSteps: AlgorithmStep[] = [
  { step: 0, action: "init", array: initialArray.map((v, i) => ({ id: `e${i}`, value: v, index: i, isComparing: false, isSwapping: false, isSorted: false })), comparisons: 0, swaps: 0, highlightLines: [1, 2], description: "Bubble Sort: Compare adjacent elements and swap if out of order.", algorithm: "Bubble Sort" },
  { step: 1, action: "compare", array: initialArray.map((v, i) => ({ id: `e${i}`, value: v, index: i, isComparing: i === 0 || i === 1, isSwapping: false, isSorted: false })), comparisons: 1, swaps: 0, highlightLines: [3, 4], description: "Compare 64 and 34. 64 > 34, so swap them.", algorithm: "Bubble Sort" },
  { step: 2, action: "swap", array: [34, 64, 25, 12, 22, 11, 90, 5].map((v, i) => ({ id: `e${i}`, value: v, index: i, isComparing: false, isSwapping: i === 0 || i === 1, isSorted: false })), comparisons: 1, swaps: 1, highlightLines: [5, 6, 7], description: "Swapped! Array now starts with [34, 64, ...]", algorithm: "Bubble Sort" },
  { step: 3, action: "compare", array: [34, 64, 25, 12, 22, 11, 90, 5].map((v, i) => ({ id: `e${i}`, value: v, index: i, isComparing: i === 1 || i === 2, isSwapping: false, isSorted: false })), comparisons: 2, swaps: 1, highlightLines: [3, 4], description: "Compare 64 and 25. 64 > 25, swap needed.", algorithm: "Bubble Sort" },
  { step: 4, action: "swap", array: [34, 25, 64, 12, 22, 11, 90, 5].map((v, i) => ({ id: `e${i}`, value: v, index: i, isComparing: false, isSwapping: i === 1 || i === 2, isSorted: false })), comparisons: 2, swaps: 2, highlightLines: [5, 6, 7], description: "Array now [34, 25, 64, ...]", algorithm: "Bubble Sort" },
  { step: 5, action: "pass-complete", array: [34, 25, 12, 22, 11, 64, 90, 5].map((v, i) => ({ id: `e${i}`, value: v, index: i, isComparing: false, isSwapping: false, isSorted: i === 5 })), comparisons: 7, swaps: 5, highlightLines: [8, 9], description: "First pass complete. 64 bubbled to correct position!", algorithm: "Bubble Sort" },
  { step: 6, action: "sorted", array: [5, 11, 12, 22, 25, 34, 64, 90].map((v, i) => ({ id: `e${i}`, value: v, index: i, isComparing: false, isSwapping: false, isSorted: true })), comparisons: 28, swaps: 15, highlightLines: [10, 11], description: "Array sorted! Time: O(n²), Space: O(1)", algorithm: "Bubble Sort" },
];

export default function SortingVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => { setTotalSteps(bubbleSortSteps.length); }, [setTotalSteps]);
  useEffect(() => { const step = bubbleSortSteps[currentStep]; if (step) setActiveLines(step.highlightLines); }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleStep = useCallback((dir: "next" | "prev") => dir === "next" ? nextStep() : prevStep(), [nextStep, prevStep]);
  const step = bubbleSortSteps[currentStep] || bubbleSortSteps[0];
  const maxVal = Math.max(...step.array.map(a => a.value));

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Sorting Visualizer - {step.algorithm}</h3>
        <div className="flex items-center gap-4">
          <span className="text-[#8b949e]">Comparisons: <span className="text-[#58a6ff]">{step.comparisons}</span></span>
          <span className="text-[#8b949e]">Swaps: <span className="text-[#f0883e]">{step.swaps}</span></span>
          <div className="flex items-center gap-2">
            <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">{isPlaying ? "Pause" : "Play"}</button>
            <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Prev</button>
            <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden flex items-end justify-center gap-2">
        {step.array.map((el) => (
          <motion.div
            key={el.id}
            layout
            initial={{ height: 0 }}
            animate={{
              height: `${(el.value / maxVal) * 200}px`,
              backgroundColor: el.isSorted ? "#238636" : el.isSwapping ? "#f0883e" : el.isComparing ? "#58a6ff" : "#8957e5"
            }}
            transition={{ duration: 0.3 }}
            className="w-12 rounded-t-lg flex items-end justify-center pb-2 text-white font-mono font-bold border-2"
            style={{
              borderColor: el.isSorted ? "#3fb950" : el.isSwapping ? "#f0883e" : el.isComparing ? "#58a6ff" : "#30363d"
            }}
          >
            {el.value}
          </motion.div>
        ))}

        <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <p className="text-white">{step.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#8b949e]">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>Action: <span className="text-[#58a6ff]">{step.action.toUpperCase()}</span></span>
          </div>
        </motion.div>
      </div>

      <div className="p-4 border-t border-[#30363d] flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#238636] rounded" /><span className="text-[#8b949e]">Sorted</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#f0883e] rounded" /><span className="text-[#8b949e]">Swapping</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#58a6ff] rounded" /><span className="text-[#8b949e]">Comparing</span></div>
      </div>
    </div>
  );
}
