"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap, ArrowUp, ArrowDown } from "lucide-react";

interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  task: "insert" | "extract" | "build" | "sort" | "heapify";
  initialHeap: number[];
  insertValue?: number;
  hint: string;
  educationalNote: string;
}

const levels: Level[] = [
  {
    id: 1,
    title: "Heap Insertion",
    description: "Insert into heap and bubble up to maintain heap property",
    objective: "Insert 60 into the heap [50, 30, 40, 20, 25]",
    task: "insert",
    initialHeap: [50, 30, 40, 20, 25],
    insertValue: 60,
    hint: "Add at end (index 5). While parent < child: swap with parent. Parent of 5 is at ⌊(5-1)/2⌋ = 2 (value 40). 60 > 40, swap!",
    educationalNote: "Insertion always adds at the end to maintain complete tree property, then bubbles up to restore heap property. Time: O(log n)."
  },
  {
    id: 2,
    title: "Extract Maximum",
    description: "Remove max, replace with last element, then heapify down",
    objective: "Extract max from heap [60, 30, 50, 20, 25, 40]",
    task: "extract",
    initialHeap: [60, 30, 50, 20, 25, 40],
    hint: "1) Remove root (60). 2) Move last element (40) to root. 3) Heapify down: swap with larger child until heap property restored.",
    educationalNote: "Extract removes root (max), fills with last element, then heapifies down. This maintains complete tree while restoring heap property. Time: O(log n)."
  },
  {
    id: 3,
    title: "Build Heap",
    description: "Convert array into heap using heapify",
    objective: "Build max heap from array [3, 1, 4, 1, 5, 9, 2, 6]",
    task: "build",
    initialHeap: [3, 1, 4, 1, 5, 9, 2, 6],
    hint: "Start from last non-leaf node (index ⌊n/2⌋-1 = 3) and heapify each node going backwards to root.",
    educationalNote: "Build heap in O(n) by heapifying from the bottom up. Leaves are already heaps, so start from first non-leaf node."
  },
  {
    id: 4,
    title: "Heap Sort",
    description: "Sort array using heap: build heap, then repeatedly extract max",
    objective: "Sort [5, 2, 8, 1, 9] using heap sort",
    task: "sort",
    initialHeap: [5, 2, 8, 1, 9],
    hint: "1) Build max heap. 2) Swap root with last, heapify root, reduce heap size. 3) Repeat until sorted. Elements end up in ascending order!",
    educationalNote: "Heap sort: O(n log n) guaranteed, O(1) space. Unlike quicksort's O(n²) worst case, heap sort never degrades. Not stable but reliable."
  },
  {
    id: 5,
    title: "Min Heap Conversion",
    description: "Convert max heap operations to min heap",
    objective: "Identify what's different for min heap (parent <= children)",
    task: "heapify",
    initialHeap: [10, 20, 15, 30, 40],
    hint: "In min heap: parent should be <= children. Bubble up when parent > child. Heapify down by swapping with SMALLER child (not larger).",
    educationalNote: "Min heaps are used when you need quick access to minimum (scheduling, Dijkstra). Operations are symmetric to max heap."
  }
];

// Heap utilities
const parent = (i: number) => Math.floor((i - 1) / 2);
const leftChild = (i: number) => 2 * i + 1;
const rightChild = (i: number) => 2 * i + 2;

export default function HeapMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [heap, setHeap] = useState<number[]>([]);
  const [extracted, setExtracted] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [stepPhase, setStepPhase] = useState(0);

  const level = levels[currentLevel];

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  const resetLevel = () => {
    setHeap([...level.initialHeap]);
    setExtracted([]);
    setGameState("playing");
    setFeedback("");
    setShowHint(false);
    setScore(0);
    setAttempts(0);
    setSelectedIndices([]);
    setStepPhase(0);
  };

  const isValidMaxHeap = (arr: number[]) => {
    for (let i = 0; i < arr.length; i++) {
      const left = leftChild(i);
      const right = rightChild(i);
      if (left < arr.length && arr[i] < arr[left]) return false;
      if (right < arr.length && arr[i] < arr[right]) return false;
    }
    return true;
  };

  const handleSwap = (i: number, j: number) => {
    if (gameState !== "playing") return;
    setAttempts(a => a + 1);

    const newHeap = [...heap];
    [newHeap[i], newHeap[j]] = [newHeap[j], newHeap[i]];
    setHeap(newHeap);

    if (level.task === "insert" || level.task === "build" || level.task === "heapify") {
      if (isValidMaxHeap(newHeap)) {
        const points = Math.max(10, 50 - attempts);
        setScore(points);
        setTotalScore(s => s + points);
        setGameState("won");
        setFeedback(`🎉 Valid max heap! +${points} points`);
        if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
          setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
        }
      } else {
        setFeedback("❌ Heap property violated. Parent must be >= children.");
      }
    }
  };

  const handleExtract = () => {
    if (gameState !== "playing" || heap.length === 0) return;
    setAttempts(a => a + 1);

    if (level.task === "extract" || level.task === "sort") {
      const max = heap[0];
      const newExtracted = [...extracted, max];
      
      let newHeap = [...heap];
      newHeap[0] = newHeap[newHeap.length - 1];
      newHeap = newHeap.slice(0, -1);
      
      // Auto heapify for simplicity in game
      // Simple heapify down
      let i = 0;
      while (true) {
        const left = leftChild(i);
        const right = rightChild(i);
        let largest = i;
        
        if (left < newHeap.length && newHeap[left] > newHeap[largest]) largest = left;
        if (right < newHeap.length && newHeap[right] > newHeap[largest]) largest = right;
        
        if (largest === i) break;
        [newHeap[i], newHeap[largest]] = [newHeap[largest], newHeap[i]];
        i = largest;
      }
      
      setHeap(newHeap);
      setExtracted(newExtracted);
      
      if (newHeap.length === 0) {
        const points = Math.max(10, 50 - attempts);
        setScore(points);
        setTotalScore(s => s + points);
        setGameState("won");
        setFeedback(`🎉 All elements extracted in order! +${points} points`);
        if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
          setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
        }
      } else {
        setFeedback(`✅ Extracted ${max}. ${newHeap.length} elements remaining.`);
      }
    }
  };

  const handleIndexClick = (index: number) => {
    if (gameState !== "playing") return;
    
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else if (selectedIndices.length < 2) {
      const newSelected = [...selectedIndices, index];
      setSelectedIndices(newSelected);
      
      if (newSelected.length === 2) {
        handleSwap(newSelected[0], newSelected[1]);
        setSelectedIndices([]);
      }
    } else {
      setSelectedIndices([index]);
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  // Calculate positions for tree visualization
  const getNodePosition = (index: number, totalWidth: number, levelHeight: number) => {
    const level = Math.floor(Math.log2(index + 1));
    const positionInLevel = index - (Math.pow(2, level) - 1);
    const nodesInLevel = Math.pow(2, level);
    return {
      x: (positionInLevel + 0.5) * (totalWidth / nodesInLevel),
      y: level * levelHeight + 30
    };
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">Heap Challenge</h3>
          <span className="text-[#8b949e] text-sm">Level {currentLevel + 1}/{levels.length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
          <Trophy size={16} className="text-[#f0883e]" />
          <span className="text-white font-medium">{totalScore}</span>
        </div>
      </div>

      {/* Level Selector */}
      <div className="flex gap-2 p-3 border-b border-[#30363d] bg-[#0d1117] overflow-x-auto">
        {levels.map((l, i) => (
          <button
            key={l.id}
            onClick={() => unlockedLevels.includes(i) && setCurrentLevel(i)}
            disabled={!unlockedLevels.includes(i)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              i === currentLevel
                ? "bg-[#58a6ff] text-white"
                : unlockedLevels.includes(i)
                ? "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
                : "bg-[#161b22] text-[#6e7681] cursor-not-allowed"
            }`}
          >
            {unlockedLevels.includes(i) ? (i < currentLevel ? <CheckCircle size={14} className="text-[#3fb950]" /> : <Unlock size={14} />) : <Lock size={14} />}
            Level {l.id}
          </button>
        ))}
      </div>

      {/* Main Game */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Heap Area */}
        <div className="flex-1 flex flex-col p-6">
          {/* Objective */}
          <div className="mb-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="flex items-start gap-3">
              <Target size={20} className="text-[#f0883e] mt-0.5" />
              <div>
                <h4 className="text-white font-medium">{level.title}</h4>
                <p className="text-[#8b949e] text-sm mt-1">{level.objective}</p>
              </div>
            </div>
          </div>

          {/* Insert Value Indicator */}
          {level.insertValue && !heap.includes(level.insertValue) && (
            <div className="mb-4 p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg">
              <span className="text-[#f0883e]">Insert: </span>
              <span className="text-white font-bold text-xl">{level.insertValue}</span>
              <span className="text-[#8b949e] text-sm ml-2">(Click two elements to swap them)</span>
            </div>
          )}

          {/* Tree Visualization */}
          <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg relative overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
              {/* Edges */}
              {heap.map((_, index) => {
                const left = leftChild(index);
                const right = rightChild(index);
                const parentPos = getNodePosition(index, 500, 50);
                const elements: React.ReactElement[] = [];
                
                if (left < heap.length) {
                  const childPos = getNodePosition(left, 500, 50);
                  elements.push(
                    <line key={`edge-${index}-${left}`} x1={parentPos.x} y1={parentPos.y + 20} x2={childPos.x} y2={childPos.y - 20} stroke="#30363d" strokeWidth="2" />
                  );
                }
                if (right < heap.length) {
                  const childPos = getNodePosition(right, 500, 50);
                  elements.push(
                    <line key={`edge-${index}-${right}`} x1={parentPos.x} y1={parentPos.y + 20} x2={childPos.x} y2={childPos.y - 20} stroke="#30363d" strokeWidth="2" />
                  );
                }
                return elements;
              })}
              
              {/* Nodes */}
              {heap.map((value, index) => {
                const pos = getNodePosition(index, 500, 50);
                const isSelected = selectedIndices.includes(index);
                const parentIdx = parent(index);
                const hasViolation = parentIdx >= 0 && heap[parentIdx] < value;
                
                return (
                  <motion.g key={index} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={20}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "fill-[#f0883e] stroke-[#f0883e]"
                          : hasViolation
                          ? "fill-[#f85149]/30 stroke-[#f85149]"
                          : "fill-[#21262d] stroke-[#30363d] hover:stroke-[#58a6ff]"
                      }`}
                      strokeWidth="3"
                      onClick={() => handleIndexClick(index)}
                    />
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`font-bold pointer-events-none ${isSelected ? "fill-white" : "fill-[#c9d1d9]"}`}
                    >
                      {value}
                    </text>
                    <text x={pos.x} y={pos.y + 30} textAnchor="middle" className="text-xs fill-[#6e7681] font-mono">
                      [{index}]
                    </text>
                  </motion.g>
                );
              })}
            </svg>
          </div>

          {/* Array Representation */}
          <div className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="text-[#8b949e] text-sm mb-2">Array: (Click two to swap)</div>
            <div className="flex gap-2 flex-wrap">
              {heap.map((value, index) => {
                const parentIdx = parent(index);
                const hasViolation = parentIdx >= 0 && heap[parentIdx] < value;
                
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleIndexClick(index)}
                    className={`w-12 h-12 border-2 rounded-lg font-bold transition-all ${
                      selectedIndices.includes(index)
                        ? "border-[#f0883e] bg-[#f0883e]/20 text-[#f0883e]"
                        : hasViolation
                        ? "border-[#f85149] bg-[#f85149]/20 text-[#f85149]"
                        : "border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:border-[#58a6ff]"
                    }`}
                  >
                    {value}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Extract Button */}
          {(level.task === "extract" || level.task === "sort") && heap.length > 0 && (
            <div className="mt-4">
              <button
                onClick={handleExtract}
                disabled={gameState === "won"}
                className="w-full py-3 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <ArrowUp size={18} /> Extract Max
              </button>
            </div>
          )}

          {/* Extracted Elements */}
          {extracted.length > 0 && (
            <div className="mt-4 p-3 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-lg">
              <span className="text-[#3fb950] text-sm">Extracted (sorted): </span>
              <span className="text-white font-mono">{extracted.join(" → ")}</span>
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 p-4 rounded-lg ${
                  gameState === "won" ? "bg-[#238636]/20 border border-[#238636]" : feedback.startsWith("✅") ? "bg-[#3fb950]/20 border border-[#3fb950]" : "bg-[#f85149]/20 border border-[#f85149]"
                }`}
              >
                <p className={gameState === "won" ? "text-[#3fb950]" : feedback.startsWith("✅") ? "text-[#3fb950]" : "text-[#f85149]"}>{feedback}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-4 border-b border-[#30363d]">
            <h4 className="text-white font-medium mb-2">About This Level</h4>
            <p className="text-[#c9d1d9] text-sm">{level.description}</p>
          </div>

          <div className="p-4 border-b border-[#30363d]">
            <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-[#8b949e] hover:text-white">
              <HelpCircle size={16} />
              <span className="text-sm">{showHint ? "Hide Hint" : "Show Hint"}</span>
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg">
                  <p className="text-[#f0883e] text-sm">{level.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 border-b border-[#30363d] flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-[#3fb950]" />
              <h4 className="text-[#3fb950] font-medium text-sm">Why This Matters</h4>
            </div>
            <p className="text-[#c9d1d9] text-sm leading-relaxed">{level.educationalNote}</p>
          </div>

          <div className="p-4 border-b border-[#30363d]">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#21262d] rounded-lg">
                <span className="text-[#8b949e] text-xs">Level Score</span>
                <p className="text-white font-bold text-lg">{score}</p>
              </div>
              <div className="p-3 bg-[#21262d] rounded-lg">
                <span className="text-[#8b949e] text-xs">Attempts</span>
                <p className="text-white font-bold text-lg">{attempts}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex gap-2">
              <button onClick={resetLevel} className="flex-1 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg font-medium flex items-center justify-center gap-2">
                <RotateCcw size={16} /> Reset
              </button>
              {gameState === "won" && currentLevel < levels.length - 1 && (
                <button onClick={nextLevel} className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  Next <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
