"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface BloomStep {
  step: number;
  action: string;
  bitArray: boolean[];
  items: string[];
  hashes: number[];
  isChecking: boolean;
  maybeInSet: boolean | null;
  highlightLines: number[];
  description: string;
}

const bloomSteps: BloomStep[] = [
  { step: 0, action: "init", bitArray: Array(16).fill(false), items: [], hashes: [], isChecking: false, maybeInSet: null, highlightLines: [1, 2], description: "Bloom Filter: Probabilistic data structure. Space-efficient set membership test. May have false positives, never false negatives." },
  { step: 1, action: "insert", bitArray: [true, false, false, true, false, false, false, false, true, false, false, false, false, false, false, false], items: ["apple"], hashes: [0, 3, 8], isChecking: false, maybeInSet: null, highlightLines: [3, 4], description: "Insert 'apple': hash1=0, hash2=3, hash3=8. Set bits at positions 0, 3, 8." },
  { step: 2, action: "insert", bitArray: [true, false, false, true, true, false, false, false, true, false, true, false, false, false, false, false], items: ["apple", "banana"], hashes: [4, 10, 0], isChecking: false, maybeInSet: null, highlightLines: [3, 4], description: "Insert 'banana': hash1=4, hash2=10, hash3=0. Set bits at 4, 10. Position 0 already set." },
  { step: 3, action: "insert", bitArray: [true, false, false, true, true, false, false, true, true, false, true, false, true, false, false, false], items: ["apple", "banana", "cherry"], hashes: [7, 12, 3], isChecking: false, maybeInSet: null, highlightLines: [3, 4], description: "Insert 'cherry': hash1=7, hash2=12, hash3=3. Set bits at 7, 12. Position 3 already set." },
  { step: 4, action: "check", bitArray: [true, false, false, true, true, false, false, true, true, false, true, false, true, false, false, false], items: ["apple", "banana", "cherry"], hashes: [0, 3, 8], isChecking: true, maybeInSet: true, highlightLines: [5, 6], description: "Check 'apple': positions 0, 3, 8 all set. 'apple' MAYBE in set (definitely was inserted)." },
  { step: 5, action: "check", bitArray: [true, false, false, true, true, false, false, true, true, false, true, false, true, false, false, false], items: ["apple", "banana", "cherry"], hashes: [5, 9, 13], isChecking: true, maybeInSet: false, highlightLines: [5, 6, 7], description: "Check 'grape': positions 5, 9, 13 not all set. 'grape' DEFINITELY NOT in set!" },
  { step: 6, action: "check-false", bitArray: [true, false, false, true, true, false, false, true, true, false, true, false, true, false, false, false], items: ["apple", "banana", "cherry"], hashes: [0, 4, 8], isChecking: true, maybeInSet: true, highlightLines: [5, 6], description: "Check 'orange': positions 0, 4, 8 all set (collisions!). False positive! 'orange' not in set but hashes collided." },
  { step: 7, action: "complete", bitArray: [true, false, false, true, true, false, false, true, true, false, true, false, true, false, false, false], items: ["apple", "banana", "cherry"], hashes: [], isChecking: false, maybeInSet: null, highlightLines: [8, 9], description: "Bloom Filter: Space O(n), Check O(k) where k=hash count. Used in caching, databases, distributed systems." },
];

export default function BloomFilterVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => { setTotalSteps(bloomSteps.length); }, [setTotalSteps]);
  useEffect(() => { const step = bloomSteps[currentStep]; if (step) setActiveLines(step.highlightLines); }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleStep = useCallback((dir: "next" | "prev") => dir === "next" ? nextStep() : prevStep(), [nextStep, prevStep]);
  const step = bloomSteps[currentStep] || bloomSteps[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Bloom Filter Visualizer</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">{isPlaying ? "Pause" : "Play"}</button>
          <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Prev</button>
          <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden flex flex-col items-center justify-center gap-6">
        {/* Bit Array */}
        <div className="flex flex-col gap-2">
          <span className="text-[#8b949e] text-sm">Bit Array (16 bits):</span>
          <div className="flex gap-1">
            {step.bitArray.map((bit, i) => (
              <motion.div
                key={i}
                animate={{
                  backgroundColor: step.hashes.includes(i) ? "#f0883e" : bit ? "#238636" : "#21262d",
                  borderColor: step.hashes.includes(i) ? "#f0883e" : bit ? "#3fb950" : "#30363d"
                }}
                className="w-8 h-10 flex items-center justify-center border-2 rounded font-mono font-bold text-sm"
              >
                {bit ? "1" : "0"}
              </motion.div>
            ))}
          </div>
          <div className="flex gap-1 text-xs text-[#8b949e] font-mono">
            {step.bitArray.map((_, i) => <span key={i} className="w-8 text-center">{i}</span>)}
          </div>
        </div>

        {/* Items in set */}
        {step.items.length > 0 && (
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <span className="text-[#8b949e] text-sm block mb-2">Items in set:</span>
            <div className="flex gap-2">
              {step.items.map((item, i) => (
                <span key={i} className="px-3 py-1 bg-[#238636] text-white rounded-full text-sm">{item}</span>
              ))}
            </div>
          </div>
        )}

        {/* Check result */}
        {step.isChecking && step.maybeInSet !== null && (
          <div className={`p-4 rounded-lg ${step.maybeInSet ? "bg-[#f0883e]/20 border border-[#f0883e]" : "bg-[#238636]/20 border border-[#238636]"}`}>
            <span className={step.maybeInSet ? "text-[#f0883e]" : "text-[#238636]"}>
              {step.maybeInSet ? "MAYBE in set (check bits all 1)" : "DEFINITELY NOT in set (some bits 0)"}
            </span>
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

      <div className="p-4 border-t border-[#30363d] flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#238636] rounded" /><span className="text-[#8b949e]">Set (1)</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#f0883e] rounded" /><span className="text-[#8b949e]">Hashed</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#21262d] border border-[#30363d] rounded" /><span className="text-[#8b949e]">Unset (0)</span></div>
      </div>
    </div>
  );
}
