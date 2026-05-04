"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface StringStep {
  step: number;
  action: string;
  text: string;
  pattern: string;
  textIndex: number;
  patternIndex: number;
  matches: number[];
  highlightLines: number[];
  description: string;
}

const stringSteps: StringStep[] = [
  { step: 0, action: "init", text: "ABABDABACDABABCABAB", pattern: "ABABCABAB", textIndex: 0, patternIndex: 0, matches: [], highlightLines: [1, 2], description: "KMP Algorithm: Find pattern in text efficiently using LPS array." },
  { step: 1, action: "lps", text: "ABABDABACDABABCABAB", pattern: "ABABCABAB", textIndex: 0, patternIndex: 0, matches: [], highlightLines: [3, 4], description: "LPS array for pattern: [0,0,1,2,0,1,2,3,4] - longest proper prefix which is also suffix." },
  { step: 2, action: "compare", text: "ABABDABACDABABCABAB", pattern: "ABABCABAB", textIndex: 0, patternIndex: 0, matches: [], highlightLines: [5, 6], description: "Start comparing from text[0] and pattern[0]. Both 'A', match!" },
  { step: 3, action: "compare", text: "ABABDABACDABABCABAB", pattern: "ABABCABAB", textIndex: 4, patternIndex: 4, matches: [], highlightLines: [5, 6], description: "Matched 'ABAB'. At text[4]='D', pattern[4]='C'. Mismatch!" },
  { step: 4, action: "skip", text: "ABABDABACDABABCABAB", pattern: "ABABCABAB", textIndex: 4, patternIndex: 2, matches: [], highlightLines: [7, 8], description: "Use LPS[3]=2. Skip ahead! Now pattern[2] aligns with text[4]." },
  { step: 5, action: "compare", text: "ABABDABACDABABCABAB", pattern: "ABABCABAB", textIndex: 10, patternIndex: 0, matches: [], highlightLines: [5, 6], description: "Continue scanning... Found match at text index 10!" },
  { step: 6, action: "found", text: "ABABDABACDABABCABAB", pattern: "ABABCABAB", textIndex: 10, patternIndex: 9, matches: [10], highlightLines: [9, 10], description: "Pattern found at index 10! KMP avoids re-checking matched characters. Time: O(n+m)." },
];

export default function StringVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => { setTotalSteps(stringSteps.length); }, [setTotalSteps]);
  useEffect(() => { const step = stringSteps[currentStep]; if (step) setActiveLines(step.highlightLines); }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleStep = useCallback((dir: "next" | "prev") => dir === "next" ? nextStep() : prevStep(), [nextStep, prevStep]);
  const step = stringSteps[currentStep] || stringSteps[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">String Matching Visualizer (KMP)</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">{isPlaying ? "Pause" : "Play"}</button>
          <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Prev</button>
          <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden flex flex-col items-center justify-center gap-8">
        {/* Text */}
        <div className="flex flex-col gap-2">
          <span className="text-[#8b949e] text-sm">Text:</span>
          <div className="flex">
            {step.text.split("").map((char, i) => (
              <motion.div
                key={i}
                animate={{
                  backgroundColor: i >= step.textIndex && i < step.textIndex + step.patternIndex ? "#8957e5" : step.matches.some(m => i >= m && i < m + step.pattern.length) ? "#238636" : "#21262d",
                  color: i === step.textIndex ? "#f0883e" : "white"
                }}
                className="w-8 h-10 flex items-center justify-center border border-[#30363d] font-mono font-bold"
              >
                {char}
              </motion.div>
            ))}
          </div>
          <div className="flex text-xs text-[#8b949e] font-mono">
            {step.text.split("").map((_, i) => (
              <span key={i} className="w-8 text-center">{i}</span>
            ))}
          </div>
        </div>

        {/* Pattern */}
        <div className="flex flex-col gap-2">
          <span className="text-[#8b949e] text-sm">Pattern:</span>
          <div className="flex" style={{ marginLeft: `${step.textIndex * 32}px` }}>
            {step.pattern.split("").map((char, i) => (
              <motion.div
                key={i}
                animate={{
                  backgroundColor: i < step.patternIndex ? "#58a6ff" : i === step.patternIndex ? "#f0883e" : "#21262d",
                  borderColor: i === step.patternIndex ? "#f0883e" : "#30363d"
                }}
                className="w-8 h-10 flex items-center justify-center border-2 font-mono font-bold text-white"
              >
                {char}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Indices display */}
        <div className="text-[#58a6ff] font-mono">
          textIndex: {step.textIndex}, patternIndex: {step.patternIndex}
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
