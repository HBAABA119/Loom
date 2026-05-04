"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface SuffixStep {
  step: number;
  action: string;
  text: string;
  suffixes: string[];
  lcp: number;
  highlightLines: number[];
  description: string;
}

const suffixSteps: SuffixStep[] = [
  { step: 0, action: "init", text: "banana", suffixes: [], lcp: 0, highlightLines: [1, 2], description: "Suffix Tree/Array: Efficient string pattern matching. Build from text 'banana'." },
  { step: 1, action: "suffixes", text: "banana", suffixes: ["banana", "anana", "nana", "ana", "na", "a"], lcp: 0, highlightLines: [3, 4], description: "All suffixes: banana, anana, nana, ana, na, a" },
  { step: 2, action: "sort", text: "banana", suffixes: ["a", "ana", "anana", "banana", "na", "nana"], lcp: 0, highlightLines: [5, 6], description: "Suffix Array (sorted): a, ana, anana, banana, na, nana" },
  { step: 3, action: "lcp", text: "banana", suffixes: ["a", "ana", "anana", "banana", "na", "nana"], lcp: 3, highlightLines: [7, 8], description: "LCP array: [0, 1, 3, 0, 1, 2]. LCP of 'ana' and 'anana' is 3 ('ana')." },
  { step: 4, action: "search", text: "banana", suffixes: ["a", "ana", "anana", "banana", "na", "nana"], lcp: 0, highlightLines: [9, 10], description: "Search 'ana': Binary search finds it at indices 1, 2. Occurs 2 times!" },
  { step: 5, action: "complete", text: "banana", suffixes: ["a", "ana", "anana", "banana", "na", "nana"], lcp: 0, highlightLines: [11, 12], description: "Suffix array enables O(m log n) pattern search. Longest repeated substring: 'ana' (length 3)." },
];

export default function SuffixTreeVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => { setTotalSteps(suffixSteps.length); }, [setTotalSteps]);
  useEffect(() => { const step = suffixSteps[currentStep]; if (step) setActiveLines(step.highlightLines); }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleStep = useCallback((dir: "next" | "prev") => dir === "next" ? nextStep() : prevStep(), [nextStep, prevStep]);
  const step = suffixSteps[currentStep] || suffixSteps[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Suffix Tree/Array Visualizer</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">{isPlaying ? "Pause" : "Play"}</button>
          <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Prev</button>
          <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden flex flex-col items-center justify-center gap-6">
        <div className="text-[#f0883e] font-mono text-2xl font-bold">{step.text}</div>

        {step.suffixes.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[#8b949e] text-sm">{step.action === "suffixes" ? "Suffixes:" : "Suffix Array:"}</span>
            {step.suffixes.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4">
                <span className="text-[#58a6ff] font-mono w-8">{i}</span>
                <span className="text-white font-mono">{s}</span>
              </motion.div>
            ))}
          </div>
        )}

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
