"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, HelpCircle, RotateCcw, ArrowRight, Star, 
  Lock, Unlock, Target, Zap, CheckCircle, XCircle
} from "lucide-react";

interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  task: "fill" | "find" | "insert" | "delete" | "resize";
  initialArray: (number | null)[];
  targetArray?: (number | null)[];
  capacity: number;
  actions: string[];
  targetValue?: number;
  insertIndex?: number;
  hint: string;
  educationalNote: string;
  complexity: string;
}

const levels: Level[] = [
  {
    id: 1,
    title: "Fill 'Er Up!",
    description: "Learn how arrays store data sequentially",
    objective: "Fill the array with values 10, 20, 30, 40 in order",
    task: "fill",
    initialArray: [null, null, null, null],
    targetArray: [10, 20, 30, 40],
    capacity: 4,
    actions: ["10", "20", "30", "40"],
    hint: "Click values in order: 10 goes to index 0, 20 to index 1, etc. Arrays fill from left to right.",
    educationalNote: "Arrays use ZERO-based indexing. First element is at index 0, not 1. This is because memory address = base + (index × element_size).",
    complexity: "O(1) per insertion at end"
  },
  {
    id: 2,
    title: "Index Detective",
    description: "Arrays have O(1) random access - use it!",
    objective: "Find the value at index 3",
    task: "find",
    initialArray: [5, 10, 15, 20, 25, 30],
    capacity: 8,
    actions: ["0:5", "1:10", "2:15", "3:20", "4:25", "5:30"],
    targetValue: 20,
    hint: "You can access any index directly! No need to search. Just pick the element at index 3.",
    educationalNote: "This is arrays' superpower: data[3] gives you the value instantly. With linked lists, you'd have to traverse from head: head→next→next→next.",
    complexity: "O(1) access time"
  },
  {
    id: 3,
    title: "The Shifting Challenge",
    description: "Inserting in the middle requires moving elements",
    objective: "Insert 99 at index 2. Watch the shift happen!",
    task: "insert",
    initialArray: [10, 20, 30, 40, null, null, null, null],
    targetArray: [10, 20, 99, 30, 40, null, null, null],
    capacity: 8,
    actions: ["Insert 99 at 2"],
    insertIndex: 2,
    hint: "When you insert at index 2, elements at indices 2,3,4 must shift right to make room. That's why it's O(n)!",
    educationalNote: "This is why inserting at the beginning is slow - you shift ALL n elements. Inserting at the end is fast - no shifting needed.",
    complexity: "O(n) - must shift elements"
  },
  {
    id: 4,
    title: "The Resize Event",
    description: "Experience the expensive resize operation",
    objective: "Fill array to capacity, then add one more to trigger resize",
    task: "resize",
    initialArray: [1, 2, 3, null],
    targetArray: [1, 2, 3, 4, 5, null, null, null],
    capacity: 4,
    actions: ["4", "5"],
    hint: "Add 4 (fills capacity), then add 5. Watch the resize happen! Capacity doubles from 4 to 8.",
    educationalNote: "Resize is O(n) but happens rarely. Amortized analysis: n insertions take O(n) total, so average is O(1) per insertion.",
    complexity: "O(n) for resize, O(1) amortized overall"
  },
  {
    id: 5,
    title: "Memory Master",
    description: "Calculate memory addresses like the CPU does",
    objective: "If base address is 1000 and each int is 4 bytes, what's at address 1012?",
    task: "find",
    initialArray: [100, 200, 300, 400],
    capacity: 4,
    actions: ["100", "200", "300", "400"],
    targetValue: 300,
    hint: "Address 1012 = 1000 + (3 × 4). So index = 3. (1012-1000)/4 = 3. Pick the element at index 3!",
    educationalNote: "CPUs use this formula: address = base + (index × size). This is why arrays need contiguous memory and fixed element sizes.",
    complexity: "O(1) - direct address calculation"
  }
];

export default function ArrayMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [array, setArray] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResizeAnimation, setShowResizeAnimation] = useState(false);

  const level = levels[currentLevel];

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  const resetLevel = () => {
    setArray([...level.initialArray]);
    setGameState("playing");
    setFeedback("");
    setShowHint(false);
    setSelectedIndex(null);
    setShowResizeAnimation(false);
    setScore(0);
    setAttempts(0);
  };

  const handleAction = (action: string) => {
    if (gameState !== "playing") return;
    setAttempts(a => a + 1);

    if (level.task === "fill") {
      const value = parseInt(action);
      const nextIndex = array.findIndex(v => v === null);
      if (nextIndex !== -1) {
        const newArray = [...array];
        newArray[nextIndex] = value;
        setArray(newArray);
        
        if (level.targetArray && arraysEqual(newArray, level.targetArray)) {
          completeLevel(50 - attempts * 2);
        }
      }
    } else if (level.task === "find") {
      if (action.includes(":")) {
        const [idx, val] = action.split(":");
        const value = parseInt(val);
        if (value === level.targetValue) {
          completeLevel(50);
        } else {
          setFeedback(`❌ That's index ${idx} = ${value}. Try again!`);
          setScore(Math.max(0, score - 5));
        }
      } else {
        const value = parseInt(action);
        if (value === level.targetValue) {
          completeLevel(50);
        } else {
          setFeedback("❌ Not quite! Calculate: (target_address - base) / element_size");
          setScore(Math.max(0, score - 5));
        }
      }
    } else if (level.task === "insert") {
      const insertIdx = level.insertIndex!;
      const newArray = [...array];
      
      // Shift elements
      for (let i = newArray.length - 1; i > insertIdx; i--) {
        newArray[i] = newArray[i - 1];
      }
      newArray[insertIdx] = 99;
      
      setArray(newArray);
      setTimeout(() => {
        if (level.targetArray && arraysEqual(newArray, level.targetArray)) {
          completeLevel(60 - attempts * 2);
        }
      }, 500);
    } else if (level.task === "resize") {
      const value = parseInt(action);
      const nextIndex = array.findIndex(v => v === null);
      
      if (nextIndex !== -1) {
        // Check if this will trigger resize
        const willResize = array.filter(v => v !== null).length + 1 > level.capacity;
        
        if (willResize) {
          setShowResizeAnimation(true);
          setFeedback("⚡ RESIZE TRIGGERED! Creating new array with double capacity...");
          
          setTimeout(() => {
            const newArray = [...array, value, null, null, null, null];
            setArray(newArray);
            setShowResizeAnimation(false);
            
            if (level.targetArray && arraysEqual(newArray, level.targetArray)) {
              completeLevel(70);
            }
          }, 1500);
        } else {
          const newArray = [...array];
          newArray[nextIndex] = value;
          setArray(newArray);
          
          if (level.targetArray && arraysEqual(newArray, level.targetArray)) {
            completeLevel(70);
          } else {
            setFeedback(`✅ Added ${value}. Array is now full - next insertion will trigger resize!`);
          }
        }
      }
    }
  };

  const arraysEqual = (a: (number | null)[], b: (number | null)[]) => {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  };

  const completeLevel = (points: number) => {
    const finalPoints = Math.max(10, points);
    setScore(finalPoints);
    setTotalScore(s => s + finalPoints);
    setGameState("won");
    setFeedback(`🎉 Level Complete! +${finalPoints} points`);
    
    if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
      setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">Array Challenge</h3>
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
        {/* Left - Game Area */}
        <div className="flex-1 flex flex-col p-6">
          {/* Objective */}
          <div className="mb-6 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="flex items-start gap-3">
              <Target size={20} className="text-[#f0883e] mt-0.5" />
              <div>
                <h4 className="text-white font-medium">{level.title}</h4>
                <p className="text-[#8b949e] text-sm mt-1">{level.objective}</p>
              </div>
            </div>
          </div>

          {/* Array Visualization */}
          <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg p-8 mb-4 relative">
            {showResizeAnimation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-[#0d1117]/90 z-10"
              >
                <div className="text-center">
                  <Zap size={48} className="text-[#f0883e] mx-auto mb-4 animate-pulse" />
                  <p className="text-[#f0883e] text-xl font-bold">RESIZING!</p>
                  <p className="text-[#8b949e] mt-2">Doubling capacity...</p>
                </div>
              </motion.div>
            )}

            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-[#8b949e] text-sm mb-4">
                Capacity: {array.length} | Used: {array.filter(v => v !== null).length}
              </div>
              
              <div className="flex items-end gap-2">
                <AnimatePresence mode="popLayout">
                  {array.map((value, idx) => (
                    <motion.div
                      key={idx}
                      initial={value !== null ? { scale: 0, y: -30 } : false}
                      animate={{ scale: 1, y: 0 }}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-14 h-14 border-2 rounded-lg flex items-center justify-center font-bold transition-all ${
                          value !== null
                            ? "border-[#58a6ff] bg-[#58a6ff]/20 text-white"
                            : "border-[#21262d] bg-[#161b22] border-dashed text-[#6e7681]"
                        }`}
                      >
                        {value !== null ? value : "∅"}
                      </div>
                      <span className="text-[#6e7681] text-xs mt-1 font-mono">[{idx}]</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <h4 className="text-[#8b949e] text-sm mb-3">Available Actions:</h4>
            <div className="flex gap-2 flex-wrap">
              {level.actions.map((action) => (
                <motion.button
                  key={action}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction(action)}
                  disabled={gameState !== "playing"}
                  className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#58a6ff] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {action}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 p-4 rounded-lg ${
                  gameState === "won" ? "bg-[#238636]/20 border border-[#238636]" : "bg-[#f0883e]/20 border border-[#f0883e]"
                }`}
              >
                <p className={gameState === "won" ? "text-[#3fb950]" : "text-[#f0883e]"}>{feedback}</p>
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
            
            <div className="mt-4 p-2 bg-[#58a6ff]/10 rounded">
              <span className="text-[#58a6ff] text-xs font-mono">{level.complexity}</span>
            </div>
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
