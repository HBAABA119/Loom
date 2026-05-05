"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown
} from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface HeapNode {
  value: number;
  index: number;
  isNew?: boolean;
  isSwapping?: boolean;
  isComparing?: boolean;
  isHeapified?: boolean;
}

interface Step {
  step: number;
  title: string;
  description: string;
  codeLines: number[];
  heap: HeapNode[];
  operation: "init" | "insert" | "heapify" | "extract" | "swap" | "compare";
  comparison?: { parent: number; child: number };
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
  "// Max Heap Implementation",
  "class MaxHeap {",
  "  constructor() {",
  "    this.heap = [];  // Array representation",
  "  }",
  "",
  "  // Get parent index",
  "  parent(i) { return Math.floor((i - 1) / 2); }",
  "",
  "  // Get left child index",
  "  leftChild(i) { return 2 * i + 1; }",
  "",
  "  // Get right child index",
  "  rightChild(i) { return 2 * i + 2; }",
  "",
  "  // O(log n) - Insert new value",
  "  insert(value) {",
  "    this.heap.push(value);  // Add at end",
  "    this.bubbleUp(this.heap.length - 1);  // Fix heap",
  "  }",
  "",
  "  // O(log n) - Bubble up to maintain heap property",
  "  bubbleUp(index) {",
  "    while (index > 0) {",
  "      const parent = this.parent(index);",
  "",
  "      // If parent >= child, heap property satisfied",
  "      if (this.heap[parent] >= this.heap[index]) break;",
  "",
  "      // Swap parent and child",
  "      [this.heap[parent], this.heap[index]] = ",
  "        [this.heap[index], this.heap[parent]];",
  "",
  "      index = parent;  // Continue with parent",
  "    }",
  "  }",
  "",
  "  // O(log n) - Extract max element",
  "  extractMax() {",
  "    if (this.heap.length === 0) return null;",
  "",
  "    const max = this.heap[0];  // Root is max",
  "    const last = this.heap.pop();  // Remove last",
  "",
  "    if (this.heap.length > 0) {",
  "      this.heap[0] = last;  // Move last to root",
  "      this.heapify(0);  // Fix heap from root",
  "    }",
  "",
  "    return max;",
  "  }",
  "",
  "  // O(log n) - Heapify down from index",
  "  heapify(index) {",
  "    const left = this.leftChild(index);",
  "    const right = this.rightChild(index);",
  "    let largest = index;",
  "",
  "    // Find largest among parent and children",
  "    if (left < this.heap.length && ",
  "        this.heap[left] > this.heap[largest]) {",
  "      largest = left;",
  "    }",
  "    if (right < this.heap.length &&",
  "        this.heap[right] > this.heap[largest]) {",
  "      largest = right;",
  "    }",
  "",
  "    // If parent is not largest, swap and continue",
  "    if (largest !== index) {",
  "      [this.heap[index], this.heap[largest]] =",
  "        [this.heap[largest], this.heap[index]];",
  "      this.heapify(largest);",
  "    }",
  "  }",
  "}",
];

// Calculate node positions for tree visualization
const getNodePosition = (index: number, totalWidth: number, levelHeight: number) => {
  const level = Math.floor(Math.log2(index + 1));
  const positionInLevel = index - (Math.pow(2, level) - 1);
  const nodesInLevel = Math.pow(2, level);
  const x = (positionInLevel + 0.5) * (totalWidth / nodesInLevel);
  const y = level * levelHeight + 40;
  return { x, y };
};

const generateSteps = (): Step[] => [
  {
    step: 0,
    title: "What is a Heap?",
    description: "A heap is a complete binary tree where each parent node satisfies the heap property with its children.",
    codeLines: [1, 2, 3, 4],
    heap: [],
    operation: "init",
    explanation: "Max Heap: Parent >= Children. Min Heap: Parent <= Children. Heaps are always complete binary trees - all levels filled except possibly the last, filled left to right.",
    theoryConnection: "Heaps are used in: Priority Queues, Heap Sort, Dijkstra's Algorithm (priority queue), and Huffman Coding. They provide O(log n) insert and extract operations.",
    complexity: "All heap operations: O(log n) due to tree height"
  },
  {
    step: 1,
    title: "Array Representation",
    description: "Heaps are stored as arrays, not linked structures. Parent-child relationships are calculated using indices.",
    codeLines: [7, 8, 9, 10, 11, 12],
    heap: [
      { value: 50, index: 0 },
      { value: 30, index: 1 },
      { value: 40, index: 2 },
      { value: 20, index: 3 },
      { value: 25, index: 4 },
    ],
    operation: "init",
    explanation: "Array index i: Parent at ⌊(i-1)/2⌋, Left child at 2i+1, Right child at 2i+2. No pointers needed! This makes heaps cache-friendly and memory efficient.",
    theoryConnection: "The array representation is why heaps are so space-efficient. No need to store left/right pointers for each node. Binary heap uses O(n) space vs O(n log n) for pointer-based trees.",
    complexity: "Space: O(n) - just the array"
  },
  {
    step: 2,
    title: "Heap Property Check",
    description: "Verify that every parent is >= its children in this max heap.",
    codeLines: [1, 2, 3, 4],
    heap: [
      { value: 50, index: 0, isHeapified: true },
      { value: 30, index: 1, isHeapified: true },
      { value: 40, index: 2, isHeapified: true },
      { value: 20, index: 3, isHeapified: true },
      { value: 25, index: 4, isHeapified: true },
    ],
    operation: "compare",
    explanation: "Checking heap property: 50 >= 30 ✓, 50 >= 40 ✓, 30 >= 20 ✓, 30 >= 25 ✓. All parents >= children. This is a valid max heap!",
    theoryConnection: "Heap property must hold for EVERY parent-child relationship. A single violation breaks the heap. This property allows O(1) access to max/min element (always at root).",
    complexity: "Verify heap: O(n) - check all parent-child pairs"
  },
  {
    step: 3,
    title: "Insert 60 - Add at End",
    description: "New elements are always added at the end of the array (last position in the complete tree).",
    codeLines: [15, 16, 17],
    heap: [
      { value: 50, index: 0 },
      { value: 30, index: 1 },
      { value: 40, index: 2 },
      { value: 20, index: 3 },
      { value: 25, index: 4 },
      { value: 60, index: 5, isNew: true },
    ],
    operation: "insert",
    explanation: "Insert 60: Add at index 5 (end). But wait! 60 > 50 (its parent). Heap property violated! We need to 'bubble up' 60 to its correct position.",
    theoryConnection: "Adding at the end maintains the complete tree property. The bubble-up (sift-up) operation restores the heap property. This is O(log n) since we may travel up the height of the tree.",
    complexity: "Insert: O(log n) - bubble up at most height times"
  },
  {
    step: 4,
    title: "Bubble Up - Compare with Parent",
    description: "60 > 50, so we swap them. 60 moves up, 50 moves down.",
    codeLines: [20, 21, 22, 23, 24, 25, 26, 27, 28],
    heap: [
      { value: 50, index: 0, isSwapping: true },
      { value: 30, index: 1 },
      { value: 40, index: 2 },
      { value: 20, index: 3 },
      { value: 25, index: 4 },
      { value: 60, index: 5, isSwapping: true },
    ],
    operation: "swap",
    comparison: { parent: 0, child: 5 },
    explanation: "Compare 60 (index 5) with parent 50 (index 2, parent = ⌊(5-1)/2⌋ = 2). Wait, let me recalculate: parent of 5 is ⌊(5-1)/2⌋ = 2, that's 40! 60 > 40, so swap with 40.",
    theoryConnection: "Parent calculation: ⌊(i-1)/2⌋. For index 5: ⌊4/2⌋ = 2. We compare with the actual parent at index 2. This is why array representation is elegant - no pointer chasing.",
    complexity: "Each comparison: O(1)"
  },
  {
    step: 5,
    title: "Swap 60 with 40",
    description: "After swap: 60 at index 2, 40 at index 5. Check again with new parent.",
    codeLines: [25, 26, 27, 28],
    heap: [
      { value: 50, index: 0 },
      { value: 30, index: 1 },
      { value: 60, index: 2, isNew: true },
      { value: 20, index: 3 },
      { value: 25, index: 4 },
      { value: 40, index: 5 },
    ],
    operation: "swap",
    comparison: { parent: 0, child: 2 },
    explanation: "60 is now at index 2. Its parent is at index ⌊(2-1)/2⌋ = 0, which is 50. 60 > 50, heap still violated! Need another swap.",
    theoryConnection: "Bubble up continues until heap property is restored or we reach root. At most height of tree swaps needed. For n elements, height = ⌊log₂n⌋, so O(log n).",
    complexity: "Max swaps = height of tree = ⌊log₂n⌋"
  },
  {
    step: 6,
    title: "Final Swap - 60 Reaches Root",
    description: "Swap 60 with 50. Now 60 is at root (index 0). Check parent - none exists!",
    codeLines: [25, 26, 27, 28],
    heap: [
      { value: 60, index: 0, isNew: true },
      { value: 30, index: 1 },
      { value: 50, index: 2 },
      { value: 20, index: 3 },
      { value: 25, index: 4 },
      { value: 40, index: 5 },
    ],
    operation: "swap",
    explanation: "60 is now root (index 0). No parent to compare with. Heap property restored! 60 >= 30 ✓, 60 >= 50 ✓, and all other relationships still hold.",
    theoryConnection: "The root always contains the maximum (for max heap). This gives O(1) access to max element. This is why heaps are perfect for priority queues.",
    complexity: "Insert complete! 60 is now at root (max element)"
  },
  {
    step: 7,
    title: "Extract Max - Remove Root",
    description: "To remove max, we take root, replace with last element, then heapify down.",
    codeLines: [32, 33, 34, 35, 36, 37, 38, 39],
    heap: [
      { value: 40, index: 0, isSwapping: true },
      { value: 30, index: 1 },
      { value: 50, index: 2 },
      { value: 20, index: 3 },
      { value: 25, index: 4 },
    ],
    operation: "extract",
    explanation: "Extract Max: 60 is removed (returned). Last element 40 moves to root (index 0). Now we need to 'heapify' - push 40 down to restore heap property.",
    theoryConnection: "Removing root would leave a hole. We fill it with the last element to maintain complete tree property, then restore heap property via heapify (sift-down). Still O(log n).",
    complexity: "Extract: O(log n) - heapify down at most height times"
  },
  {
    step: 8,
    title: "Heapify Down - Find Largest Child",
    description: "Compare 40 with its children 30 and 50. Find the larger child.",
    codeLines: [43, 44, 45, 46, 47, 48, 49, 50, 51],
    heap: [
      { value: 40, index: 0, isComparing: true },
      { value: 30, index: 1 },
      { value: 50, index: 2, isComparing: true },
      { value: 20, index: 3 },
      { value: 25, index: 4 },
    ],
    operation: "compare",
    comparison: { parent: 0, child: 2 },
    explanation: "40's children: left=30 (index 1), right=50 (index 2). Larger child is 50. Since 40 < 50, we need to swap 40 with 50 to restore heap property.",
    theoryConnection: "Heapify compares parent with both children, finds the largest among the three. If parent is not largest, swap with larger child and continue. This ensures the larger values 'bubble up' toward the root.",
    complexity: "Compare 2 children + parent: O(1)"
  },
  {
    step: 9,
    title: "Swap with Larger Child",
    description: "Swap 40 with 50. Now 50 moves up, 40 moves to index 2.",
    codeLines: [53, 54, 55, 56],
    heap: [
      { value: 50, index: 0, isHeapified: true },
      { value: 30, index: 1 },
      { value: 40, index: 2, isComparing: true },
      { value: 20, index: 3 },
      { value: 25, index: 4 },
    ],
    operation: "swap",
    comparison: { parent: 2, child: 5 },
    explanation: "After swap: 50 at root (correct!). 40 at index 2. Check 40's children: left child would be at index 2*2+1=5, but heap size is now 5 (indices 0-4). No children! Heapify complete.",
    theoryConnection: "Heapify stops when: 1) Parent >= both children, or 2) Reaches leaf node (no children). The heap property is now fully restored.",
    complexity: "Heapify complete! New max (50) is at root"
  },
  {
    step: 10,
    title: "Final Valid Heap",
    description: "Verify heap property is satisfied for all nodes.",
    codeLines: [1, 2, 3, 4],
    heap: [
      { value: 50, index: 0, isHeapified: true },
      { value: 30, index: 1, isHeapified: true },
      { value: 40, index: 2, isHeapified: true },
      { value: 20, index: 3, isHeapified: true },
      { value: 25, index: 4, isHeapified: true },
    ],
    operation: "init",
    explanation: "Final heap: 50 >= 30 ✓, 50 >= 40 ✓, 30 >= 20 ✓, 30 >= 25 ✓. All parent >= children. Valid max heap with 5 elements!",
    theoryConnection: "This is a complete binary tree with heap property. The array representation is [50, 30, 40, 20, 25]. With this structure, we can efficiently extract max and insert new elements.",
    complexity: "Heap is valid! Ready for more operations"
  },
  {
    step: 11,
    title: "Heap Applications Summary",
    description: "Heaps are fundamental in many algorithms and systems.",
    codeLines: [1, 15, 16, 32, 33],
    heap: [
      { value: 50, index: 0 },
      { value: 30, index: 1 },
      { value: 40, index: 2 },
      { value: 20, index: 3 },
      { value: 25, index: 4 },
    ],
    operation: "init",
    explanation: "Common uses: 1) Priority Queues (hospital ER, task scheduling), 2) Heap Sort O(n log n), 3) Dijkstra's shortest path, 4) Prim's MST, 5) Huffman coding, 6) Median maintenance.",
    theoryConnection: "Heaps combine the fast access of sorted arrays with efficient insertion of linked lists. O(1) peek at max/min, O(log n) insert and extract. The perfect middle ground!",
    complexity: "Heap is one of the most versatile data structures"
  },
];

export default function HeapVisualizerEnhanced() {
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

  // Render tree connections
  const renderConnections = () => {
    const connections: React.ReactElement[] = [];
    step.heap.forEach((node) => {
      const leftChildIdx = 2 * node.index + 1;
      const rightChildIdx = 2 * node.index + 2;
      
      const parentPos = getNodePosition(node.index, 600, 70);
      
      [leftChildIdx, rightChildIdx].forEach((childIdx) => {
        const child = step.heap.find(n => n.index === childIdx);
        if (child) {
          const childPos = getNodePosition(childIdx, 600, 70);
          connections.push(
            <line
              key={`edge-${node.index}-${childIdx}`}
              x1={parentPos.x}
              y1={parentPos.y + 20}
              x2={childPos.x}
              y2={childPos.y - 20}
              stroke="#30363d"
              strokeWidth="2"
            />
          );
        }
      });
    });
    return connections;
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div>
          <h3 className="text-white font-semibold text-lg">Max Heap Visualization</h3>
          <p className="text-[#8b949e] text-sm">Parent {'>='} Children | Complete Binary Tree | Array Representation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <ArrowUp size={14} className="text-[#3fb950]" />
            <span className="text-[#8b949e] text-xs">Max at Root:</span>
            <span className="text-[#3fb950] font-bold font-mono">
              {step.heap.length > 0 ? Math.max(...step.heap.map(h => h.value)) : "-"}
            </span>
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
          {/* Tree Display */}
          <div className="flex-1 relative overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet">
              {renderConnections()}
              {step.heap.map((node) => {
                const pos = getNodePosition(node.index, 600, 70);
                return (
                  <motion.g key={node.index} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={22}
                      className={`transition-all ${
                        node.isNew
                          ? "fill-[#3fb950] stroke-[#3fb950]"
                          : node.isSwapping
                          ? "fill-[#f0883e] stroke-[#f0883e]"
                          : node.isComparing
                          ? "fill-[#58a6ff] stroke-[#58a6ff]"
                          : node.isHeapified
                          ? "fill-[#8b949e] stroke-[#8b949e]"
                          : "fill-[#21262d] stroke-[#30363d]"
                      }`}
                      strokeWidth="3"
                    />
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`font-bold pointer-events-none ${
                        node.isNew || node.isSwapping || node.isComparing ? "fill-white" : "fill-[#c9d1d9]"
                      }`}
                    >
                      {node.value}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 35}
                      textAnchor="middle"
                      className="text-xs fill-[#6e7681] font-mono"
                    >
                      [{node.index}]
                    </text>
                  </motion.g>
                );
              })}
            </svg>
          </div>

          {/* Array Representation */}
          <div className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="text-[#8b949e] text-sm mb-2">Array Representation:</div>
            <div className="flex gap-2">
              {step.heap.map((node) => (
                <div key={node.index} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold ${
                      node.isNew
                        ? "border-[#3fb950] bg-[#3fb950]/20 text-[#3fb950]"
                        : node.isSwapping
                        ? "border-[#f0883e] bg-[#f0883e]/20 text-[#f0883e]"
                        : node.isComparing
                        ? "border-[#58a6ff] bg-[#58a6ff]/20 text-[#58a6ff]"
                        : "border-[#30363d] bg-[#21262d] text-[#c9d1d9]"
                    }`}
                  >
                    {node.value}
                  </div>
                  <span className="text-[#6e7681] text-xs mt-1">[{node.index}]</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#3fb950]" />
              <span className="text-[#8b949e]">New</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#f0883e]" />
              <span className="text-[#8b949e]">Swapping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#58a6ff]" />
              <span className="text-[#8b949e]">Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#8b949e]" />
              <span className="text-[#8b949e]">Heapified</span>
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
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">What's Happening</h4>
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
