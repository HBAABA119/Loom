"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Item {
  id: string;
  value: number;
  weight: number;
  ratio: number;
  selected: boolean;
  available: boolean;
}

interface GreedyStep {
  step: number;
  action: string;
  items: Item[];
  capacity: number;
  currentWeight: number;
  currentValue: number;
  highlightLines: number[];
  description: string;
}

const initialItems: Item[] = [
  { id: "i1", value: 60, weight: 10, ratio: 6, selected: false, available: true },
  { id: "i2", value: 100, weight: 20, ratio: 5, selected: false, available: true },
  { id: "i3", value: 120, weight: 30, ratio: 4, selected: false, available: true },
];

const greedySteps: GreedyStep[] = [
  { step: 0, action: "init", items: initialItems.map(i => ({ ...i })), capacity: 50, currentWeight: 0, currentValue: 0, highlightLines: [1, 2], description: "Fractional Knapsack: Capacity = 50kg. Goal: Maximize value." },
  { step: 1, action: "sort", items: initialItems.map(i => ({ ...i })).sort((a, b) => b.ratio - a.ratio), capacity: 50, currentWeight: 0, currentValue: 0, highlightLines: [3, 4], description: "Sort by value/weight ratio descending: Item1(6), Item2(5), Item3(4)." },
  { step: 2, action: "select", items: [{ ...initialItems[0], selected: true, available: false }, { ...initialItems[1], available: true }, { ...initialItems[2], available: true }], capacity: 50, currentWeight: 10, currentValue: 60, highlightLines: [5, 6], description: "Take all of Item 1 (10kg, $60). Remaining: 40kg." },
  { step: 3, action: "select", items: [{ ...initialItems[0], selected: true, available: false }, { ...initialItems[1], selected: true, available: false }, { ...initialItems[2], available: true }], capacity: 50, currentWeight: 30, currentValue: 160, highlightLines: [5, 6], description: "Take all of Item 2 (20kg, $100). Remaining: 20kg." },
  { step: 4, action: "fraction", items: [{ ...initialItems[0], selected: true, available: false }, { ...initialItems[1], selected: true, available: false }, { ...initialItems[2], selected: true, available: false, weight: 20, value: 80 }], capacity: 50, currentWeight: 50, currentValue: 240, highlightLines: [7, 8], description: "Take 20/30 of Item 3 (20kg, $80). Knapsack full!" },
  { step: 5, action: "complete", items: [{ ...initialItems[0], selected: true, available: false }, { ...initialItems[1], selected: true, available: false }, { ...initialItems[2], selected: true, available: false, weight: 20, value: 80 }], capacity: 50, currentWeight: 50, currentValue: 240, highlightLines: [9, 10], description: "Optimal value: $240! Greedy choice works for fractional knapsack." },
];

export default function GreedyVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => { setTotalSteps(greedySteps.length); }, [setTotalSteps]);
  useEffect(() => { const step = greedySteps[currentStep]; if (step) setActiveLines(step.highlightLines); }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleStep = useCallback((dir: "next" | "prev") => dir === "next" ? nextStep() : prevStep(), [nextStep, prevStep]);
  const step = greedySteps[currentStep] || greedySteps[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Greedy Algorithm Visualizer</h3>
        <div className="flex items-center gap-4">
          <span className="text-[#8b949e]">Value: <span className="text-[#238636] font-bold">${step.currentValue}</span></span>
          <span className="text-[#8b949e]">Weight: <span className="text-[#58a6ff]">{step.currentWeight}/{step.capacity}kg</span></span>
          <div className="flex items-center gap-2">
            <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">{isPlaying ? "Pause" : "Play"}</button>
            <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Prev</button>
            <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden">
        {/* Items */}
        <div className="flex justify-center gap-4">
          {step.items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ scale: 0.8 }}
              animate={{
                scale: item.selected ? 1.05 : 1,
                opacity: item.available || item.selected ? 1 : 0.5,
                backgroundColor: item.selected ? "#238636" : "#21262d",
                borderColor: item.selected ? "#3fb950" : item.available ? "#8957e5" : "#30363d"
              }}
              className="w-32 h-40 flex flex-col items-center justify-center gap-2 rounded-lg border-2"
            >
              <span className="text-white font-bold text-lg">Item {item.id.slice(1)}</span>
              <span className="text-[#8b949e] text-sm">${item.value}</span>
              <span className="text-[#58a6ff] text-sm">{item.weight}kg</span>
              <span className="text-[#f0883e] text-xs font-mono">ratio: {item.ratio.toFixed(1)}</span>
              {item.selected && <span className="text-[#3fb950] text-xs font-bold">SELECTED</span>}
            </motion.div>
          ))}
        </div>

        {/* Knapsack representation */}
        <div className="mt-8 mx-auto max-w-md">
          <div className="text-[#8b949e] text-sm mb-2">Knapsack Capacity: {step.capacity}kg</div>
          <div className="h-8 bg-[#21262d] rounded-full overflow-hidden border border-[#30363d]">
            <motion.div
              className="h-full bg-gradient-to-r from-[#238636] to-[#58a6ff]"
              animate={{ width: `${(step.currentWeight / step.capacity) * 100}%` }}
            />
          </div>
          <div className="text-center text-[#8b949e] text-sm mt-1">{step.currentWeight}kg used</div>
        </div>

        <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <p className="text-white">{step.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#8b949e]">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>Action: <span className="text-[#58a6ff]">{step.action.toUpperCase()}</span></span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
