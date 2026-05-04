"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface MemoryBlock {
  id: string;
  address: number;
  size: number;
  isAllocated: boolean;
  isFragmented: boolean;
  processId: string | null;
}

interface MemoryStep {
  step: number;
  action: string;
  blocks: MemoryBlock[];
  totalMemory: number;
  usedMemory: number;
  freeMemory: number;
  fragmentation: number;
  highlightLines: number[];
  description: string;
}

const memorySteps: MemoryStep[] = [
  { step: 0, action: "init", blocks: [
    { id: "m0", address: 0, size: 64, isAllocated: true, isFragmented: false, processId: "P1" },
    { id: "m1", address: 64, size: 32, isAllocated: false, isFragmented: false, processId: null },
    { id: "m2", address: 96, size: 64, isAllocated: true, isFragmented: false, processId: "P2" },
    { id: "m3", address: 160, size: 32, isAllocated: false, isFragmented: false, processId: null },
    { id: "m4", address: 192, size: 64, isAllocated: true, isFragmented: false, processId: "P3" },
  ], totalMemory: 256, usedMemory: 192, freeMemory: 64, fragmentation: 0, highlightLines: [1, 2], description: "Memory Management: Stack vs Heap. Stack: static, fast. Heap: dynamic, slower." },
  { step: 1, action: "allocate", blocks: [
    { id: "m0", address: 0, size: 64, isAllocated: true, isFragmented: false, processId: "P1" },
    { id: "m1", address: 64, size: 32, isAllocated: true, isFragmented: false, processId: "P4" },
    { id: "m2", address: 96, size: 64, isAllocated: true, isFragmented: false, processId: "P2" },
    { id: "m3", address: 160, size: 32, isAllocated: false, isFragmented: false, processId: null },
    { id: "m4", address: 192, size: 64, isAllocated: true, isFragmented: false, processId: "P3" },
  ], totalMemory: 256, usedMemory: 224, freeMemory: 32, fragmentation: 0, highlightLines: [3, 4], description: "Allocate 32 bytes for P4 using First Fit. Found free block at address 64." },
  { step: 2, action: "free", blocks: [
    { id: "m0", address: 0, size: 64, isAllocated: true, isFragmented: false, processId: "P1" },
    { id: "m1", address: 64, size: 32, isAllocated: true, isFragmented: false, processId: "P4" },
    { id: "m2", address: 96, size: 64, isAllocated: false, isFragmented: false, processId: null },
    { id: "m3", address: 160, size: 32, isAllocated: false, isFragmented: false, processId: null },
    { id: "m4", address: 192, size: 64, isAllocated: true, isFragmented: false, processId: "P3" },
  ], totalMemory: 256, usedMemory: 160, freeMemory: 96, fragmentation: 0, highlightLines: [5, 6], description: "Free P2 memory (64 bytes at address 96). Coalesce adjacent free blocks?" },
  { step: 3, action: "coalesce", blocks: [
    { id: "m0", address: 0, size: 64, isAllocated: true, isFragmented: false, processId: "P1" },
    { id: "m1", address: 64, size: 32, isAllocated: true, isFragmented: false, processId: "P4" },
    { id: "m2", address: 96, size: 96, isAllocated: false, isFragmented: false, processId: null },
    { id: "m4", address: 192, size: 64, isAllocated: true, isFragmented: false, processId: "P3" },
  ], totalMemory: 256, usedMemory: 160, freeMemory: 96, fragmentation: 0, highlightLines: [7, 8], description: "Coalesced! 64 + 32 = 96 bytes free block. No external fragmentation now." },
  { step: 4, action: "fragment", blocks: [
    { id: "m0", address: 0, size: 64, isAllocated: true, isFragmented: false, processId: "P1" },
    { id: "m1", address: 64, size: 32, isAllocated: true, isFragmented: false, processId: "P4" },
    { id: "m2", address: 96, size: 96, isAllocated: true, isFragmented: true, processId: "P5" },
    { id: "m4", address: 192, size: 64, isAllocated: true, isFragmented: false, processId: "P3" },
  ], totalMemory: 256, usedMemory: 256, freeMemory: 0, fragmentation: 0, highlightLines: [9, 10], description: "Allocate 96 bytes for P5. Memory full! No fragmentation possible now." },
];

export default function MemoryVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => { setTotalSteps(memorySteps.length); }, [setTotalSteps]);
  useEffect(() => { const step = memorySteps[currentStep]; if (step) setActiveLines(step.highlightLines); }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleStep = useCallback((dir: "next" | "prev") => dir === "next" ? nextStep() : prevStep(), [nextStep, prevStep]);
  const step = memorySteps[currentStep] || memorySteps[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Memory Management Visualizer</h3>
        <div className="flex items-center gap-4">
          <span className="text-[#8b949e]">Used: <span className="text-[#58a6ff]">{step.usedMemory}KB</span></span>
          <span className="text-[#8b949e]">Free: <span className="text-[#238636]">{step.freeMemory}KB</span></span>
          <div className="flex items-center gap-2">
            <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">{isPlaying ? "Pause" : "Play"}</button>
            <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Prev</button>
            <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden">
        {/* Memory layout */}
        <div className="flex flex-col gap-1 max-w-2xl mx-auto">
          {step.blocks.map((block) => (
            <motion.div
              key={block.id}
              animate={{
                backgroundColor: block.isAllocated ? (block.isFragmented ? "#f0883e" : "#238636") : "#21262d",
                borderColor: block.isAllocated ? (block.isFragmented ? "#f0883e" : "#3fb950") : "#30363d"
              }}
              className="flex items-center justify-between p-3 rounded-lg border-2"
            >
              <div className="flex items-center gap-4">
                <span className="text-[#8b949e] font-mono text-sm">0x{block.address.toString(16).toUpperCase().padStart(4, "0")}</span>
                <span className="text-white font-bold">{block.size}KB</span>
              </div>
              <span className="text-white font-mono">
                {block.isAllocated ? (block.processId || "Fragment") : "FREE"}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Memory bar */}
        <div className="mt-6 max-w-2xl mx-auto">
          <div className="h-6 bg-[#21262d] rounded-full overflow-hidden flex">
            {step.blocks.map((block) => (
              <motion.div
                key={block.id}
                animate={{
                  backgroundColor: block.isAllocated ? (block.isFragmented ? "#f0883e" : "#238636") : "#8957e5",
                  width: `${(block.size / step.totalMemory) * 100}%`
                }}
                className="h-full border-r border-[#0d1117]"
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-[#8b949e] mt-1">
            <span>0x0000</span>
            <span>Stack ↑ | Heap ↓</span>
            <span>0x{step.totalMemory.toString(16).toUpperCase()}</span>
          </div>
        </div>

        <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <p className="text-white">{step.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#8b949e]">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>Action: <span className="text-[#58a6ff]">{step.action.toUpperCase()}</span></span>
          </div>
        </motion.div>
      </div>

      <div className="p-4 border-t border-[#30363d] flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#238636] rounded" /><span className="text-[#8b949e]">Allocated</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#8957e5] rounded" /><span className="text-[#8b949e]">Free</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#f0883e] rounded" /><span className="text-[#8b949e]">Fragment</span></div>
      </div>
    </div>
  );
}
