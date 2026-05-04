"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface HashEntry {
  id: string;
  key: string;
  value: string;
  hash: number;
  isActive: boolean;
  isColliding: boolean;
}

interface AlgorithmStep {
  step: number;
  action: string;
  buckets: (HashEntry | null)[];
  activeBucket: number | null;
  highlightLines: number[];
  description: string;
}

const bucketCount = 8;

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    buckets: Array(bucketCount).fill(null),
    activeBucket: null,
    highlightLines: [1, 2],
    description: "Initialize hash table with 8 empty buckets",
  },
  {
    step: 1,
    action: "insert",
    buckets: [
      null, null, null,
      { id: "e1", key: "apple", value: "fruit", hash: 3, isActive: true, isColliding: false },
      null, null, null, null
    ],
    activeBucket: 3,
    highlightLines: [4, 5, 6],
    description: "Insert 'apple' → hash('apple') % 8 = 3. Stored at bucket 3.",
  },
  {
    step: 2,
    action: "insert",
    buckets: [
      null, null, null,
      { id: "e1", key: "apple", value: "fruit", hash: 3, isActive: false, isColliding: false },
      null, null,
      { id: "e2", key: "banana", value: "fruit", hash: 6, isActive: true, isColliding: false },
      null
    ],
    activeBucket: 6,
    highlightLines: [4, 5, 6],
    description: "Insert 'banana' → hash('banana') % 8 = 6. Stored at bucket 6.",
  },
  {
    step: 3,
    action: "collision",
    buckets: [
      null, null, null,
      { id: "e1", key: "apple", value: "fruit", hash: 3, isActive: false, isColliding: false },
      null, null,
      { id: "e2", key: "banana", value: "fruit", hash: 6, isActive: false, isColliding: false },
      { id: "e3", key: "grape", value: "fruit", hash: 6, isActive: true, isColliding: true }
    ],
    activeBucket: 7,
    highlightLines: [9, 10, 11],
    description: "Insert 'grape' → hash('grape') % 8 = 6. Collision! Using linear probing, stored at bucket 7.",
  },
  {
    step: 4,
    action: "search",
    buckets: [
      null, null, null,
      { id: "e1", key: "apple", value: "fruit", hash: 3, isActive: true, isColliding: false },
      null, null,
      { id: "e2", key: "banana", value: "fruit", hash: 6, isActive: false, isColliding: false },
      { id: "e3", key: "grape", value: "fruit", hash: 6, isActive: false, isColliding: true }
    ],
    activeBucket: 3,
    highlightLines: [14, 15, 16],
    description: "Search 'apple' → hash('apple') % 8 = 3. Found at bucket 3!",
  },
  {
    step: 5,
    action: "search",
    buckets: [
      null, null, null,
      { id: "e1", key: "apple", value: "fruit", hash: 3, isActive: false, isColliding: false },
      null, null,
      { id: "e2", key: "banana", value: "fruit", hash: 6, isActive: false, isColliding: true },
      { id: "e3", key: "grape", value: "fruit", hash: 6, isActive: true, isColliding: false }
    ],
    activeBucket: 7,
    highlightLines: [14, 15, 16, 17],
    description: "Search 'grape' → hash('grape') % 8 = 6. Check 6 (banana), probe to 7. Found at bucket 7!",
  },
  {
    step: 6,
    action: "delete",
    buckets: [
      null, null, null,
      { id: "e1", key: "apple", value: "fruit", hash: 3, isActive: false, isColliding: false },
      null, null,
      { id: "e2", key: "banana", value: "fruit", hash: 6, isActive: false, isColliding: false },
      null
    ],
    activeBucket: 7,
    highlightLines: [20, 21, 22],
    description: "Delete 'grape'. Bucket 7 marked as deleted (tombstone).",
  },
];

export default function HashTableVisualizer() {
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
        <h3 className="text-white font-semibold">Hash Table Visualizer</h3>
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
        {/* Hash Table Buckets */}
        <div className="flex flex-col gap-2 max-w-2xl mx-auto">
          {step.buckets.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-3 rounded-lg border-2 ${
                step.activeBucket === index
                  ? "border-[#238636] bg-[#238636]/20"
                  : entry?.isColliding
                    ? "border-[#d29922] bg-[#d29922]/20"
                    : entry
                      ? "border-[#30363d] bg-[#21262d]"
                      : "border-[#30363d] bg-[#0d1117]"
              }`}
            >
              {/* Bucket Index */}
              <div className="w-10 h-10 flex items-center justify-center bg-[#21262d] rounded text-white font-mono font-bold">
                {index}
              </div>

              {/* Arrow */}
              <div className="text-[#8b949e]">→</div>

              {/* Entry or Empty */}
              {entry ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                    entry.isActive
                      ? "bg-[#238636]"
                      : entry.isColliding
                        ? "bg-[#d29922]"
                        : "bg-[#30363d]"
                  }`}
                >
                  <span className="text-white font-mono">{entry.key}</span>
                  <span className="text-[#8b949e]">:</span>
                  <span className="text-[#58a6ff]">{entry.value}</span>
                  <span className="text-xs text-[#8b949e] ml-2">(hash: {entry.hash})</span>
                </motion.div>
              ) : (
                <span className="text-[#8b949e] italic">empty</span>
              )}
            </motion.div>
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
          <span className="text-[#8b949e]">Collision</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#30363d] rounded" />
          <span className="text-[#8b949e]">Stored</span>
        </div>
      </div>
    </div>
  );
}
