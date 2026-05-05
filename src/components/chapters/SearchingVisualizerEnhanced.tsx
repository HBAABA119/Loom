"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  ChevronLeft, ChevronRight, Search, Target
} from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Step {
  step: number;
  title: string;
  description: string;
  codeLines: number[];
  array: number[];
  target: number;
  left: number;
  right: number;
  mid: number;
  found: boolean;
  comparisons: number;
  operation: "init" | "linear" | "binary" | "compare" | "found" | "notfound";
  explanation: string;
  theoryConnection: string;
  complexity: string;
}

const speeds = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
];

const codeLines = [
  "// Linear Search - O(n)",
  "function linearSearch(arr, target) {",
  "  for (let i = 0; i < arr.length; i++) {",
  "    if (arr[i] === target) {",
  "      return i;  // Found at index i",
  "    }",
  "  }",
  "  return -1;  // Not found",
  "}",
  "",
  "// Binary Search - O(log n)",
  "function binarySearch(arr, target) {",
  "  let left = 0;",
  "  let right = arr.length - 1;",
  "",
  "  while (left <= right) {",
  "    const mid = Math.floor((left + right) / 2);",
  "",
  "    if (arr[mid] === target) {",
  "      return mid;  // Found at mid",
  "    } else if (arr[mid] < target) {",
  "      left = mid + 1;  // Search right half",
  "    } else {",
  "      right = mid - 1;  // Search left half",
  "    }",
  "  }",
  "",
  "  return -1;  // Not found",
  "}",
];

const array = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
const target = 23;

const generateSteps = (): Step[] => [
  {
    step: 0,
    title: "Searching Algorithms",
    description: "Find an element in an array. Linear Search checks each element. Binary Search halves the search space.",
    codeLines: [1, 2, 3, 4, 5, 6],
    array,
    target,
    left: 0,
    right: array.length - 1,
    mid: -1,
    found: false,
    comparisons: 0,
    operation: "init",
    explanation: "We have a sorted array of 10 elements. Target = 23. Linear search would check each element from index 0. Binary search will be much faster on this sorted data.",
    theoryConnection: "Searching is fundamental. Linear works on any array. Binary requires sorted data but is exponentially faster. Hash tables give O(1) but need extra space.",
    complexity: "Linear: O(n), Binary: O(log n). For n=1,000,000: linear = 1M steps, binary = 20 steps!"
  },
  {
    step: 1,
    title: "Linear Search: Check Index 0",
    description: "Compare array[0] = 2 with target = 23. Not equal.",
    codeLines: [3, 4],
    array,
    target,
    left: 0,
    right: array.length - 1,
    mid: 0,
    found: false,
    comparisons: 1,
    operation: "linear",
    explanation: "Linear search: Check index 0. array[0] = 2. 2 !== 23. Move to next index. 1 comparison used.",
    theoryConnection: "Linear search is simple but slow. Must check every element until found. Worst case: check all n elements.",
    complexity: "Comparison 1 of 10 (worst case)"
  },
  {
    step: 2,
    title: "Linear Search: Check Index 1",
    description: "Compare array[1] = 5 with target = 23. Not equal.",
    codeLines: [3, 4],
    array,
    target,
    left: 1,
    right: array.length - 1,
    mid: 1,
    found: false,
    comparisons: 2,
    operation: "linear",
    explanation: "Check index 1. array[1] = 5. 5 !== 23. Keep searching. 2 comparisons used.",
    theoryConnection: "Linear search doesn't use sorted property. Even on sorted data, it checks sequentially. Inefficient for large sorted datasets.",
    complexity: "Comparison 2 of 10"
  },
  {
    step: 3,
    title: "Linear Search: Check Index 2, 3, 4, 5",
    description: "Continue checking until we find 23 at index 5.",
    codeLines: [3, 4, 5],
    array,
    target,
    left: 5,
    right: array.length - 1,
    mid: 5,
    found: true,
    comparisons: 6,
    operation: "found",
    explanation: "Check indices 2(8), 3(12), 4(16), 5(23). Found! array[5] = 23. Linear search took 6 comparisons.",
    theoryConnection: "Found at index 5. Linear search doesn't know that data is sorted, so it can't skip ahead intelligently.",
    complexity: "Found! 6 comparisons needed"
  },
  {
    step: 4,
    title: "Binary Search: Initialize Pointers",
    description: "Binary search on sorted array. left = 0, right = 9.",
    codeLines: [11, 12, 13, 14],
    array,
    target,
    left: 0,
    right: 9,
    mid: -1,
    found: false,
    comparisons: 0,
    operation: "init",
    explanation: "Binary search requires sorted array. left = 0 (start), right = 9 (end). We'll calculate middle and eliminate half the array each step.",
    theoryConnection: "Binary search leverages sorted order. By comparing with middle element, we know which half contains target (if it exists). Half eliminated each step.",
    complexity: "Binary search: O(log n) = O(log 10) ≈ 4 comparisons max"
  },
  {
    step: 5,
    title: "Binary Search: First Midpoint",
    description: "mid = (0 + 9) / 2 = 4. array[4] = 16. 16 < 23, so search right half.",
    codeLines: [16, 17, 18],
    array,
    target,
    left: 0,
    right: 9,
    mid: 4,
    found: false,
    comparisons: 1,
    operation: "binary",
    explanation: "Calculate mid = ⌊(0+9)/2⌋ = 4. array[4] = 16. Target 23 > 16, so target must be in right half (indices 5-9). Set left = mid + 1 = 5.",
    theoryConnection: "One comparison eliminates half the array! This is the power of binary search. 10 elements → 5 elements after 1 step.",
    complexity: "1 comparison: eliminated 5 elements (50%)"
  },
  {
    step: 6,
    title: "Binary Search: Second Midpoint",
    description: "New range: left=5, right=9. mid = (5+9)/2 = 7. array[7] = 56. 56 > 23, search left.",
    codeLines: [16, 17, 20, 21],
    array,
    target,
    left: 5,
    right: 9,
    mid: 7,
    found: false,
    comparisons: 2,
    operation: "binary",
    explanation: "New range [5, 9]. mid = ⌊(5+9)/2⌋ = 7. array[7] = 56. Target 23 < 56, so search left half. Set right = mid - 1 = 6.",
    theoryConnection: "Second comparison eliminated another half. Now only indices 5-6 remain (2 elements). Getting close!",
    complexity: "2 comparisons: 2 elements remaining"
  },
  {
    step: 7,
    title: "Binary Search: Third Midpoint - Found!",
    description: "New range: left=5, right=6. mid = (5+6)/2 = 5. array[5] = 23. Found!",
    codeLines: [16, 17, 18, 19],
    array,
    target,
    left: 5,
    right: 6,
    mid: 5,
    found: true,
    comparisons: 3,
    operation: "found",
    explanation: "Range [5, 6]. mid = ⌊(5+6)/2⌋ = 5. array[5] = 23. Target found! Binary search took only 3 comparisons vs 6 for linear search.",
    theoryConnection: "Binary search is 2x faster here. For larger arrays, the difference is dramatic. 1 million elements: binary = 20 comparisons, linear = up to 1 million!",
    complexity: "Found in 3 comparisons! O(log n) efficiency demonstrated"
  },
  {
    step: 8,
    title: "Not Found Case: Binary Search",
    description: "What if target = 25 (not in array)?",
    codeLines: [16, 17, 20, 21, 24],
    array,
    target: 25,
    left: 5,
    right: 6,
    mid: 5,
    found: false,
    comparisons: 3,
    operation: "notfound",
    explanation: "Searching for 25: Check 16, 56, 23. 25 > 23, so left becomes 6. Now left > right, loop ends. Return -1 (not found). Still only 3 comparisons!",
    theoryConnection: "Binary search quickly determines 'not found'. When left > right, we've searched all possible positions. The sorted property guarantees no element was missed.",
    complexity: "Not found: still O(log n) comparisons"
  },
  {
    step: 9,
    title: "Binary Search Requirements",
    description: "Binary search ONLY works on sorted arrays.",
    codeLines: [11, 12, 13, 14],
    array: [23, 5, 91, 12, 56, 2, 38, 16, 8, 72],
    target: 23,
    left: 4,
    right: 9,
    mid: 4,
    found: false,
    comparisons: 1,
    operation: "compare",
    explanation: "Unsorted array: [23, 5, 91, 12, 56...]. Binary search would fail! First mid = 56. 23 < 56, search left. But 23 is at index 0, not in left half! Binary search requires sorted data.",
    theoryConnection: "The sorted property is essential. It lets us make the 'target must be in this half' decision. Without it, we could eliminate the half containing the target.",
    complexity: "Sort first: O(n log n), then binary search: O(log n)"
  },
  {
    step: 10,
    title: "Real-World Applications",
    description: "Searching is everywhere in computing.",
    codeLines: [1, 2, 11, 12],
    array,
    target,
    left: 0,
    right: 0,
    mid: 0,
    found: true,
    comparisons: 0,
    operation: "found",
    explanation: "Uses: Database indexes (binary search trees), Looking up words in spell checkers, Finding user in sorted list, Debugging (git bisect uses binary search!), Auto-suggest.",
    theoryConnection: "Binary search is one of the most important algorithms. Simple yet powerful. Variations: lower bound, upper bound, finding first/last occurrence, finding rotation point in rotated sorted array.",
    complexity: "Master binary search - it appears in countless interview questions!"
  },
];

export default function SearchingVisualizerEnhanced() {
  const { 
    currentStep: stepIndex, 
    totalSteps, 
    isPlaying, 
    playbackSpeed,
    togglePlay, 
    pause,
    setStep, 
    nextStep, 
    prevStep,
    setTotalSteps,
    setPlaybackSpeed
  } = useTimeline();
  
  const { setActiveLines } = useCodeHighlight();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setTotalSteps(generateSteps().length);
  }, [setTotalSteps]);

  useEffect(() => {
    setCurrentStep(stepIndex);
  }, [stepIndex]);

  const steps = generateSteps();
  const step = steps[currentStep] || steps[0];

  useEffect(() => {
    if (step?.codeLines) {
      setActiveLines(step.codeLines);
    }
  }, [step]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        nextStep();
      }, 2500 / playbackSpeed);
    } else if (currentStep >= steps.length - 1 && isPlaying) {
      pause();
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, playbackSpeed, nextStep, pause]);

  const handleReset = useCallback(() => {
    pause();
    setStep(0);
  }, [pause, setStep]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div>
          <h3 className="text-white font-semibold text-lg">Searching Algorithms</h3>
          <p className="text-[#8b949e] text-sm">Linear: O(n) | Binary: O(log n) | Requires sorted data</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <Target size={14} className="text-[#f0883e]" />
            <span className="text-[#8b949e] text-xs">Target:</span>
            <span className="text-[#f0883e] font-bold font-mono">{step.target}</span>
          </div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full">
            <div 
              className="h-full bg-[#58a6ff] rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visualization */}
        <div className="flex-1 flex flex-col p-6">
          {/* Array Display */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Indices */}
            <div className="flex justify-center gap-2 mb-2">
              {step.array.map((_, i) => (
                <div key={i} className="w-14 text-center">
                  <span className={`text-xs font-mono ${
                    i === step.mid ? "text-[#f0883e] font-bold" : 
                    (i >= step.left && i <= step.right) ? "text-[#58a6ff]" : "text-[#6e7681]"
                  }`}>
                    {i}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Values */}
            <div className="flex justify-center gap-2">
              {step.array.map((val, i) => {
                let state = "default";
                if (i === step.mid) state = "mid";
                else if (step.found && i === step.mid) state = "found";
                else if (i >= step.left && i <= step.right) state = "range";
                else if (step.comparisons > 0 && step.operation === "linear" && i < step.left) state = "checked";
                else if (step.operation === "binary" && (i < step.left || i > step.right)) state = "eliminated";

                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-14 h-14 border-2 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                      state === "mid" ? "border-[#f0883e] bg-[#f0883e]/20 text-[#f0883e]" :
                      state === "found" ? "border-[#3fb950] bg-[#3fb950] text-white" :
                      state === "range" ? "border-[#58a6ff] bg-[#58a6ff]/10 text-[#58a6ff]" :
                      state === "checked" ? "border-[#8b949e] bg-[#21262d] text-[#8b949e]" :
                      state === "eliminated" ? "border-[#30363d] bg-[#161b22] text-[#6e7681] opacity-50" :
                      "border-[#30363d] bg-[#21262d] text-[#c9d1d9]"
                    }`}
                  >
                    {val}
                  </motion.div>
                );
              })}
            </div>

            {/* Pointers */}
            {step.operation === "binary" && (
              <div className="flex justify-center gap-2 mt-4">
                {step.array.map((_, i) => (
                  <div key={i} className="w-14 text-center">
                    {i === step.left && <span className="text-xs text-[#3fb950]">L</span>}
                    {i === step.right && <span className="text-xs text-[#f0883e]">R</span>}
                    {i === step.mid && <span className="text-xs text-[#58a6ff]">M</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="p-4 bg-[#21262d] rounded-lg border border-[#30363d]">
              <span className="text-[#8b949e] text-xs">Comparisons</span>
              <p className="text-white font-bold text-2xl">{step.comparisons}</p>
            </div>
            <div className="p-4 bg-[#21262d] rounded-lg border border-[#30363d]">
              <span className="text-[#8b949e] text-xs">Search Range</span>
              <p className="text-white font-bold text-2xl font-mono">
                {step.operation === "binary" ? `[${step.left}, ${step.right}]` : "-"}
              </p>
            </div>
            <div className="p-4 bg-[#21262d] rounded-lg border border-[#30363d]">
              <span className="text-[#8b949e] text-xs">Status</span>
              <p className={`font-bold text-lg ${step.found ? "text-[#3fb950]" : step.comparisons > 0 ? "text-[#f0883e]" : "text-[#8b949e]"}`}>
                {step.found ? "Found!" : step.comparisons > 0 ? "Searching..." : "Ready"}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#f0883e] bg-[#f0883e]/20 rounded" />
              <span className="text-[#8b949e]">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#3fb950] bg-[#3fb950] rounded" />
              <span className="text-[#8b949e]">Found</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#58a6ff] bg-[#58a6ff]/10 rounded" />
              <span className="text-[#8b949e]">In Range</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#30363d] bg-[#161b22] opacity-50 rounded" />
              <span className="text-[#8b949e]">Eliminated</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-5 border-b border-[#30363d]">
            <span className="text-[#58a6ff] text-xs font-mono uppercase tracking-wider">
              Step {currentStep + 1}: {step.title}
            </span>
            <p className="text-[#c9d1d9] mt-3 leading-relaxed">{step.description}</p>
          </div>

          <div className="p-5 border-b border-[#30363d] flex-1 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">What is Happening</h4>
            <p className="text-[#c9d1d9] text-sm leading-relaxed mb-4">{step.explanation}</p>
            
            <div className="mt-4 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg">
              <h4 className="text-[#3fb950] text-xs uppercase tracking-wider mb-1">💡 Theory Connection</h4>
              <p className="text-[#c9d1d9] text-sm leading-relaxed">{step.theoryConnection}</p>
            </div>

            <div className="mt-4 p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg">
              <h4 className="text-[#58a6ff] text-xs uppercase tracking-wider mb-1">⏱️ Complexity</h4>
              <p className="text-[#c9d1d9] text-sm font-mono">{step.complexity}</p>
            </div>
          </div>

          <div className="p-4 bg-[#0d1117] max-h-56 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">Code Reference</h4>
            <div className="text-xs font-mono">
              {codeLines.map((line, i) => (
                <div 
                  key={i}
                  className={`px-2 py-0.5 rounded ${
                    step.codeLines?.includes(i + 1)
                      ? "bg-[#238636]/30 text-[#7ee787] border-l-2 border-[#238636]"
                      : "text-[#8b949e]"
                  }`}
                >
                  <span className="text-[#6e7681] w-6 inline-block select-none">{i + 1}</span>
                  {line || " "}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => { pause(); setStep(0); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <SkipBack size={18} />
            </button>
            <button onClick={prevStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <ChevronLeft size={20} />
            </button>
            
            <button onClick={togglePlay} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center gap-2">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            
            <button onClick={nextStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <ChevronRight size={20} />
            </button>
            <button onClick={() => { pause(); setStep(steps.length - 1); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <SkipForward size={18} />
            </button>
            <button onClick={handleReset} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#8b949e] text-sm">Speed:</span>
            <div className="flex gap-1">
              {speeds.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setPlaybackSpeed(s.value)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    playbackSpeed === s.value
                      ? "bg-[#58a6ff] text-white"
                      : "bg-[#21262d] text-[#8b949e] hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
