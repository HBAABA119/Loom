"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback, useState } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface BitStep {
  step: number;
  action: string;
  num: number;
  binary: string;
  operation: string;
  result: number;
  resultBinary: string;
  highlightLines: number[];
  description: string;
}

const bitSteps: BitStep[] = [
  { step: 0, action: "init", num: 13, binary: "00001101", operation: "Original", result: 13, resultBinary: "00001101", highlightLines: [1], description: "Bit Manipulation: Working with number 13 (binary: 00001101)", },
  { step: 1, action: "and", num: 13, binary: "00001101", operation: "13 & 7", result: 5, resultBinary: "00000101", highlightLines: [2, 3], description: "AND (&): Both bits must be 1. 13 & 7 = 00001101 & 00000111 = 00000101 = 5", },
  { step: 2, action: "or", num: 13, binary: "00001101", operation: "13 | 7", result: 15, resultBinary: "00001111", highlightLines: [4, 5], description: "OR (|): Either bit can be 1. 13 | 7 = 00001101 | 00000111 = 00001111 = 15", },
  { step: 3, action: "xor", num: 13, binary: "00001101", operation: "13 ^ 7", result: 10, resultBinary: "00001010", highlightLines: [6, 7], description: "XOR (^): Bits must differ. 13 ^ 7 = 00001101 ^ 00000111 = 00001010 = 10", },
  { step: 4, action: "left", num: 13, binary: "00001101", operation: "13 << 2", result: 52, resultBinary: "00110100", highlightLines: [8, 9], description: "Left Shift (<<): Multiply by 2^n. 13 << 2 = 00001101 → 00110100 = 52", },
  { step: 5, action: "right", num: 13, binary: "00001101", operation: "13 >> 2", result: 3, resultBinary: "00000011", highlightLines: [10, 11], description: "Right Shift (>>): Divide by 2^n. 13 >> 2 = 00001101 → 00000011 = 3", },
  { step: 6, action: "not", num: 13, binary: "00001101", operation: "~13 (8-bit)", result: 242, resultBinary: "11110010", highlightLines: [12, 13], description: "NOT (~): Flip all bits. ~00001101 = 11110010 = 242 (in 8-bit)", },
  { step: 7, action: "check", num: 13, binary: "00001101", operation: "13 & (1<<2)", result: 4, resultBinary: "00000100", highlightLines: [14, 15], description: "Check bit 2: 13 & (1<<2) = 00001101 & 00000100 = 4 (non-zero, bit is SET)", },
  { step: 8, action: "set", num: 13, binary: "00001101", operation: "13 | (1<<3)", result: 13, resultBinary: "00001101", highlightLines: [16, 17], description: "Set bit 3: 13 | (1<<3) = 00001101 | 00001000 = 00001101 = 13 (already set!)", },
];

export default function BitManipVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => { setTotalSteps(bitSteps.length); }, [setTotalSteps]);
  useEffect(() => { const step = bitSteps[currentStep]; if (step) setActiveLines(step.highlightLines); }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleStep = useCallback((dir: "next" | "prev") => dir === "next" ? nextStep() : prevStep(), [nextStep, prevStep]);
  const step = bitSteps[currentStep] || bitSteps[0];

  const renderBits = (binary: string, isResult: boolean) => {
    return binary.split("").map((bit, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`inline-block w-6 text-center font-mono font-bold ${bit === "1" ? (isResult ? "text-[#58a6ff]" : "text-[#f0883e]") : "text-[#8b949e]"}`}
      >
        {bit}
      </motion.span>
    ));
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Bit Manipulation Visualizer</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">{isPlaying ? "Pause" : "Play"}</button>
          <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Prev</button>
          <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden flex flex-col items-center justify-center gap-6">
        {/* Operation */}
        <div className="text-center">
          <span className="text-[#8b949e] text-sm">Operation:</span>
          <div className="text-[#f0883e] font-mono text-2xl font-bold mt-1">{step.operation}</div>
        </div>

        {/* Binary representation */}
        <div className="flex flex-col gap-4 p-6 bg-[#161b22] border border-[#30363d] rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-[#8b949e] w-16">Num:</span>
            <span className="text-white font-mono">{step.num}</span>
            <span className="text-[#30363d]">=</span>
            <span className="font-mono">{renderBits(step.binary, false)}</span>
          </div>
          
          <div className="h-px bg-[#30363d]" />
          
          <div className="flex items-center gap-4">
            <span className="text-[#58a6ff] w-16">Result:</span>
            <span className="text-[#58a6ff] font-mono font-bold">{step.result}</span>
            <span className="text-[#30363d]">=</span>
            <span className="font-mono">{renderBits(step.resultBinary, true)}</span>
          </div>
        </div>

        {/* Bit indices */}
        <div className="flex gap-0 text-xs text-[#8b949e] font-mono">
          {[7, 6, 5, 4, 3, 2, 1, 0].map(i => <span key={i} className="w-6 text-center">{i}</span>)}
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
