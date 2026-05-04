"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface DPStep {
  step: number;
  action: string;
  table: number[][];
  currentCell: { row: number; col: number } | null;
  highlightLines: number[];
  description: string;
  problem: string;
}

// Fibonacci DP table
const dpSteps: DPStep[] = [
  { step: 0, action: "init", table: [[0, 1, 0, 0, 0, 0, 0, 0]], currentCell: null, highlightLines: [1, 2], description: "Fibonacci DP: fib[0]=0, fib[1]=1. Build up to fib[7].", problem: "Fibonacci" },
  { step: 1, action: "compute", table: [[0, 1, 1, 0, 0, 0, 0, 0]], currentCell: { row: 0, col: 2 }, highlightLines: [3, 4], description: "fib[2] = fib[1] + fib[0] = 1 + 0 = 1", problem: "Fibonacci" },
  { step: 2, action: "compute", table: [[0, 1, 1, 2, 0, 0, 0, 0]], currentCell: { row: 0, col: 3 }, highlightLines: [3, 4], description: "fib[3] = fib[2] + fib[1] = 1 + 1 = 2", problem: "Fibonacci" },
  { step: 3, action: "compute", table: [[0, 1, 1, 2, 3, 0, 0, 0]], currentCell: { row: 0, col: 4 }, highlightLines: [3, 4], description: "fib[4] = fib[3] + fib[2] = 2 + 1 = 3", problem: "Fibonacci" },
  { step: 4, action: "compute", table: [[0, 1, 1, 2, 3, 5, 0, 0]], currentCell: { row: 0, col: 5 }, highlightLines: [3, 4], description: "fib[5] = fib[4] + fib[3] = 3 + 2 = 5", problem: "Fibonacci" },
  { step: 5, action: "compute", table: [[0, 1, 1, 2, 3, 5, 8, 0]], currentCell: { row: 0, col: 6 }, highlightLines: [3, 4], description: "fib[6] = fib[5] + fib[4] = 5 + 3 = 8", problem: "Fibonacci" },
  { step: 6, action: "compute", table: [[0, 1, 1, 2, 3, 5, 8, 13]], currentCell: { row: 0, col: 7 }, highlightLines: [3, 4], description: "fib[7] = fib[6] + fib[5] = 8 + 5 = 13", problem: "Fibonacci" },
  { step: 7, action: "complete", table: [[0, 1, 1, 2, 3, 5, 8, 13]], currentCell: null, highlightLines: [5, 6], description: "fib[7] = 13. Time: O(n), Space: O(n). Bottom-up DP avoids recursion!", problem: "Fibonacci" },
];

export default function DPVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => { setTotalSteps(dpSteps.length); }, [setTotalSteps]);
  useEffect(() => { const step = dpSteps[currentStep]; if (step) setActiveLines(step.highlightLines); }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleStep = useCallback((dir: "next" | "prev") => dir === "next" ? nextStep() : prevStep(), [nextStep, prevStep]);
  const step = dpSteps[currentStep] || dpSteps[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">DP Visualizer - {step.problem}</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">{isPlaying ? "Pause" : "Play"}</button>
          <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Prev</button>
          <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden flex flex-col items-center justify-center">
        {/* DP Table */}
        <div className="flex flex-col gap-2">
          {/* Indices */}
          <div className="flex gap-2">
            <span className="w-12 text-center text-[#8b949e] text-sm">i</span>
            {step.table[0].map((_, i) => (
              <span key={i} className="w-16 text-center text-[#8b949e] text-sm">{i}</span>
            ))}
          </div>
          {/* Values */}
          <div className="flex gap-2">
            <span className="w-12 text-center text-[#8b949e] text-sm">dp[i]</span>
            {step.table[0].map((val, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  backgroundColor: step.currentCell?.col === i ? "#8957e5" : val > 0 ? "#238636" : "#21262d"
                }}
                className="w-16 h-16 flex items-center justify-center rounded-lg border-2 text-white font-mono font-bold"
                style={{
                  borderColor: step.currentCell?.col === i ? "#a371f7" : val > 0 ? "#3fb950" : "#30363d"
                }}
              >
                {val}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recurrence */}
        <div className="mt-8 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <p className="text-[#8b949e] text-sm mb-2">Recurrence:</p>
          <code className="text-[#58a6ff] font-mono">dp[i] = dp[i-1] + dp[i-2]</code>
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
