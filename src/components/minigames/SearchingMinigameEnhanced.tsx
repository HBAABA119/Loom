"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap, Search } from "lucide-react";

interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  task: "linear" | "binary";
  array: number[];
  target: number;
  hint: string;
  educationalNote: string;
}

const levels: Level[] = [
  {
    id: 1,
    title: "Linear Search",
    description: "Find the target by checking each element one by one",
    objective: "Find 23 in the array using linear search",
    task: "linear",
    array: [10, 15, 23, 42, 8, 16],
    target: 23,
    hint: "Linear search checks each element from index 0. Click index 0, then 1, then 2... until you find 23.",
    educationalNote: "Linear search works on any array (sorted or unsorted). Time: O(n). Simple but slow for large arrays."
  },
  {
    id: 2,
    title: "Binary Search",
    description: "Find the target efficiently in a sorted array",
    objective: "Find 56 using binary search (sorted array)",
    task: "binary",
    array: [2, 8, 15, 23, 42, 56, 71, 89],
    target: 56,
    hint: "Binary search: Check middle (index 3 = 23). 56 > 23, so search right half [42, 56, 71, 89]. New middle is index 5 = 56. Found!",
    educationalNote: "Binary search halves the search space each step. Requires sorted array. Time: O(log n). Much faster than linear!"
  },
  {
    id: 3,
    title: "Binary Search - Not Found",
    description: "Binary search determines when target does not exist",
    objective: "Search for 50 (not in array). How many comparisons?",
    task: "binary",
    array: [2, 8, 15, 23, 42, 56, 71, 89],
    target: 50,
    hint: "Mid(3)=23 < 50, go right. Mid(5)=56 > 50, go left. Now left=4, right=4. Mid(4)=42 < 50, left becomes 5. Now left > right, stop. Not found in 3 comparisons!",
    educationalNote: "Binary search efficiently determines 'not found'. When left > right, target cannot exist. Still O(log n) comparisons."
  },
  {
    id: 4,
    title: "Find Minimum Comparisons",
    description: "Choose the best search algorithm for each scenario",
    objective: "Sorted array of 1000 elements. Which algorithm is faster?",
    task: "binary",
    array: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    target: 7,
    hint: "For sorted data: Binary search is O(log n) ≈ 10 comparisons. Linear is O(n) = up to 1000. Binary is ~100x faster!",
    educationalNote: "Always use binary search for sorted data. The difference grows exponentially: for 1M elements, binary = 20 steps, linear = up to 1M steps."
  },
  {
    id: 5,
    title: "Search in Rotated Array",
    description: "Modified binary search for rotated sorted arrays",
    objective: "Find 5 in [6, 7, 8, 1, 2, 3, 4, 5]",
    task: "binary",
    array: [6, 7, 8, 1, 2, 3, 4, 5],
    target: 5,
    hint: "Rotated array: One half is always sorted. Check which half is sorted, then determine if target is in that half. If not, search the other half.",
    educationalNote: "Modified binary search handles rotated arrays by checking which half is sorted. Still O(log n). Common interview question!"
  }
];

export default function SearchingMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [clickedIndices, setClickedIndices] = useState<number[]>([]);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);
  const [comparisons, setComparisons] = useState(0);

  const level = levels[currentLevel];

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  const resetLevel = () => {
    setClickedIndices([]);
    setLeft(0);
    setRight(level.array.length - 1);
    setGameState("playing");
    setFeedback("");
    setShowHint(false);
    setScore(0);
    setAttempts(0);
    setComparisons(0);
  };

  const handleIndexClick = (index: number) => {
    if (gameState !== "playing") return;

    const newClicked = [...clickedIndices, index];
    setClickedIndices(newClicked);
    setComparisons(c => c + 1);
    setAttempts(a => a + 1);

    if (level.task === "linear") {
      // Linear search validation
      if (level.array[index] === level.target) {
        const points = Math.max(10, 50 - comparisons);
        setScore(points);
        setTotalScore(s => s + points);
        setGameState("won");
        setFeedback(`🎉 Found ${level.target} at index ${index} in ${newClicked.length} comparisons! +${points} points`);
        if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
          setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
        }
      } else {
        setFeedback(`❌ ${level.array[index]} ≠ ${level.target}. Keep searching forward!`);
      }
    } else if (level.task === "binary") {
      // Binary search validation
      const mid = Math.floor((left + right) / 2);
      
      if (index !== mid) {
        setFeedback(`❌ In binary search, you must check the MIDDLE element (index ${mid}), not ${index}!`);
        return;
      }

      if (level.array[index] === level.target) {
        const points = Math.max(10, 50 - comparisons);
        setScore(points);
        setTotalScore(s => s + points);
        setGameState("won");
        setFeedback(`🎉 Found ${level.target} at index ${index} in ${comparisons + 1} comparisons! +${points} points`);
        if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
          setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
        }
      } else if (level.array[index] < level.target) {
        setLeft(index + 1);
        setFeedback(`✅ ${level.array[index]} < ${level.target}. Target is in RIGHT half. New range: [${index + 1}, ${right}]`);
      } else {
        setRight(index - 1);
        setFeedback(`✅ ${level.array[index]} > ${level.target}. Target is in LEFT half. New range: [${left}, ${index - 1}]`);
      }

      if (left > right && level.array[index] !== level.target) {
        setFeedback(`❌ Target ${level.target} not found in array!`);
        if (level.id === 3) {
          // Level 3 expects "not found"
          const points = Math.max(10, 50 - comparisons);
          setScore(points);
          setTotalScore(s => s + points);
          setGameState("won");
          setFeedback(`🎉 Correct! ${level.target} is not in the array. Found in ${comparisons + 1} comparisons! +${points} points`);
          if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
            setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
          }
        }
      }
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  const mid = Math.floor((left + right) / 2);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">Search Challenge</h3>
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
        {/* Left - Array Area */}
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

          {/* Target Display */}
          <div className="mb-4 p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg">
            <span className="text-[#f0883e]">Target: </span>
            <span className="text-white font-bold text-xl">{level.target}</span>
            <span className="text-[#8b949e] text-sm ml-2">({level.task === "linear" ? "Linear" : "Binary"} Search)</span>
          </div>

          {/* Array Visualization */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Indices */}
            <div className="flex justify-center gap-2 mb-2">
              {level.array.map((_, i) => (
                <div key={i} className="w-14 text-center">
                  <span className={`text-xs font-mono ${
                    i === mid && level.task === "binary" ? "text-[#f0883e] font-bold" : 
                    (i >= left && i <= right) ? "text-[#58a6ff]" : "text-[#6e7681]"
                  }`}>
                    {i}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Values */}
            <div className="flex justify-center gap-2">
              {level.array.map((val, i) => {
                const isClicked = clickedIndices.includes(i);
                const isMid = level.task === "binary" && i === mid;
                const inRange = i >= left && i <= right;
                const eliminated = !inRange && level.task === "binary";

                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleIndexClick(i)}
                    disabled={gameState === "won"}
                    className={`w-14 h-14 border-2 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                      isClicked && val === level.target ? "border-[#3fb950] bg-[#3fb950] text-white" :
                      isClicked ? "border-[#f0883e] bg-[#f0883e]/20 text-[#f0883e]" :
                      isMid ? "border-[#f0883e] bg-[#f0883e]/20 text-[#f0883e] animate-pulse" :
                      eliminated ? "border-[#30363d] bg-[#161b22] text-[#6e7681] opacity-50" :
                      "border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:border-[#58a6ff]"
                    }`}
                  >
                    {val}
                  </motion.button>
                );
              })}
            </div>

            {/* Pointers (Binary Search) */}
            {level.task === "binary" && (
              <div className="flex justify-center gap-2 mt-4">
                {level.array.map((_, i) => (
                  <div key={i} className="w-14 text-center">
                    {i === left && <span className="text-xs text-[#3fb950] font-bold">L</span>}
                    {i === right && <span className="text-xs text-[#f0883e] font-bold">R</span>}
                    {i === mid && <span className="text-xs text-[#58a6ff] font-bold">M</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]">
              <span className="text-[#8b949e] text-xs">Comparisons</span>
              <p className="text-white font-bold text-xl">{comparisons}</p>
            </div>
            {level.task === "binary" && (
              <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]">
                <span className="text-[#8b949e] text-xs">Search Range</span>
                <p className="text-white font-bold text-xl font-mono">[{left}, {right}]</p>
              </div>
            )}
          </div>

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
