"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, CheckCircle, XCircle, 
  Trophy, BookOpen, Target, Zap, ArrowRight,
  HelpCircle, Star, Lock, Unlock
} from "lucide-react";

interface Node {
  id: string;
  value: string;
  next: string | null;
  isNew?: boolean;
  isDeleting?: boolean;
  isTarget?: boolean;
}

interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  instruction: string;
  nodes: Node[];
  availableValues: string[];
  targetSequence?: string[];
  task: "build" | "delete" | "insert_at" | "reverse" | "find";
  position?: number;
  hint: string;
  educationalNote: string;
}

const levels: Level[] = [
  {
    id: 1,
    title: "Building Your First List",
    description: "Learn to create nodes and link them together",
    objective: "Create a list: A → B → C",
    instruction: "Click nodes in order to build the linked list",
    nodes: [],
    availableValues: ["A", "B", "C"],
    targetSequence: ["A", "B", "C"],
    task: "build",
    hint: "Click 'A' first, then 'B' will appear. A should point to B, and B to C.",
    educationalNote: "Each insertion at the END requires traversing the entire list. This is O(n) time complexity."
  },
  {
    id: 2,
    title: "Insertion at the Front",
    description: "The fastest insertion operation - O(1) time!",
    objective: "Insert 'New' at the front of: B → C → D",
    instruction: "Prepend a new node to become the new head",
    nodes: [
      { id: "1", value: "B", next: "2" },
      { id: "2", value: "C", next: "3" },
      { id: "3", value: "D", next: null }
    ],
    availableValues: ["New"],
    targetSequence: ["New", "B", "C", "D"],
    task: "insert_at",
    position: 0,
    hint: "When inserting at front: 1) Create new node, 2) Set new.next = old_head, 3) Update head = new",
    educationalNote: "Insertion at front is O(1) - constant time! No traversal needed. This is linked lists' superpower."
  },
  {
    id: 3,
    title: "The Traversal Challenge",
    description: "Find a specific node by traversing from head",
    objective: "Find node 'Target' in the list",
    instruction: "Click each node to traverse until you find the target",
    nodes: [
      { id: "1", value: "Apple", next: "2" },
      { id: "2", value: "Banana", next: "3" },
      { id: "3", value: "Cherry", next: "4" },
      { id: "4", value: "Target", next: "5", isTarget: true },
      { id: "5", value: "Grape", next: null }
    ],
    availableValues: [],
    task: "find",
    hint: "Start at head. Check each node's value. If not target, follow next pointer. Count your steps!",
    educationalNote: "Searching is O(n) in worst case. If the target is last, you visit every node. Compare to arrays: O(1) access but O(n) insertion."
  },
  {
    id: 4,
    title: "Deletion in the Middle",
    description: "Remove a node without breaking the chain",
    objective: "Delete node 'B' from: A → B → C → D",
    instruction: "Click 'B' to remove it, then reconnect A to C",
    nodes: [
      { id: "1", value: "A", next: "2" },
      { id: "2", value: "B", next: "3" },
      { id: "3", value: "C", next: "4" },
      { id: "4", value: "D", next: null }
    ],
    availableValues: [],
    task: "delete",
    hint: "To delete B: Find the node BEFORE B (A), then set A.next = B.next (which is C). B is now unreachable!",
    educationalNote: "Deletion is O(n) because we must find the previous node. Once found, the actual unlinking is O(1)."
  },
  {
    id: 5,
    title: "Reverse a Linked List",
    description: "A classic interview problem - reverse all pointers!",
    objective: "Reverse: 1 → 2 → 3 → null to: 3 → 2 → 1 → null",
    instruction: "Click in the correct order to reverse the list",
    nodes: [
      { id: "1", value: "1", next: "2" },
      { id: "2", value: "2", next: "3" },
      { id: "3", value: "3", next: null }
    ],
    availableValues: [],
    task: "reverse",
    hint: "Use three pointers: prev, current, next. For each node: save next, point current to prev, move all pointers forward.",
    educationalNote: "List reversal uses O(1) extra space (iterative) and O(n) time. The recursive version uses O(n) stack space."
  }
];

export default function LinkedListMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [userList, setUserList] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  const level = levels[currentLevel];

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  const resetLevel = () => {
    setNodes(level.nodes.map(n => ({ ...n })));
    setUserList([]);
    setGameState("playing");
    setFeedback("");
    setShowHint(false);
  };

  const handleNodeClick = (value: string) => {
    if (gameState !== "playing") return;

    const newList = [...userList, value];
    setUserList(newList);
    setAttempts(a => a + 1);

    // Check progress
    if (level.targetSequence) {
      const soFar = newList.every((val, i) => val === level.targetSequence![i]);
      if (!soFar) {
        setFeedback("❌ Wrong order! Reset and try again.");
        setScore(Math.max(0, score - 5));
      } else if (newList.length === level.targetSequence.length) {
        // Level complete!
        const levelScore = Math.max(10, 50 - attempts * 2);
        setScore(s => s + levelScore);
        setTotalScore(s => s + levelScore);
        setGameState("won");
        setFeedback(`🎉 Level Complete! +${levelScore} points`);
        
        // Unlock next level
        if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
          setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
        }
      } else {
        setFeedback(`✅ Good! ${newList.length}/${level.targetSequence.length} nodes placed`);
      }
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
          <h3 className="text-white font-semibold text-lg">Linked List Challenge</h3>
          <span className="text-[#8b949e] text-sm">
            Level {currentLevel + 1}/{levels.length}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <Trophy size={16} className="text-[#f0883e]" />
            <span className="text-white font-medium">{totalScore}</span>
          </div>
          <button
            onClick={() => setShowTutorial(!showTutorial)}
            className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e]"
          >
            <BookOpen size={18} />
          </button>
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
            {unlockedLevels.includes(i) ? (
              i < currentLevel ? <CheckCircle size={14} className="text-[#3fb950]" /> : <Unlock size={14} />
            ) : (
              <Lock size={14} />
            )}
            Level {l.id}
          </button>
        ))}
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Game */}
        <div className="flex-1 flex flex-col p-6">
          {/* Objective Card */}
          <div className="mb-6 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="flex items-start gap-3">
              <Target size={20} className="text-[#f0883e] mt-0.5" />
              <div>
                <h4 className="text-white font-medium">{level.title}</h4>
                <p className="text-[#8b949e] text-sm mt-1">{level.objective}</p>
              </div>
            </div>
          </div>

          {/* Current List Visualization */}
          <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg p-6 mb-4">
            <h4 className="text-[#8b949e] text-sm mb-4">Your List:</h4>
            <div className="flex items-center flex-wrap gap-2 min-h-[80px]">
              <AnimatePresence mode="popLayout">
                {userList.length === 0 ? (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[#6e7681] italic"
                  >
                    Empty list - start building!
                  </motion.span>
                ) : (
                  userList.map((value, index) => (
                    <motion.div
                      key={`${value}-${index}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center"
                    >
                      <div className="w-16 h-12 bg-[#238636] border-2 border-[#3fb950] rounded-lg flex items-center justify-center text-white font-bold">
                        {value}
                      </div>
                      {index < userList.length - 1 && (
                        <ArrowRight size={20} className="text-[#8b949e] mx-1" />
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
              {userList.length > 0 && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#6e7681] ml-2"
                >
                  → null
                </motion.span>
              )}
            </div>
          </div>

          {/* Available Values */}
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <h4 className="text-[#8b949e] text-sm mb-3">{level.instruction}</h4>
            <div className="flex gap-2 flex-wrap">
              {level.availableValues.map((value) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNodeClick(value)}
                  disabled={gameState !== "playing"}
                  className="w-16 h-16 bg-[#21262d] hover:bg-[#30363d] border-2 border-[#58a6ff] rounded-lg text-white font-bold text-lg transition-colors disabled:opacity-50"
                >
                  {value}
                </motion.button>
              ))}
              {level.availableValues.length === 0 && level.task === "find" && (
                <div className="text-[#8b949e]">
                  Click nodes in the visualization above to traverse!
                </div>
              )}
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
                  gameState === "won" 
                    ? "bg-[#238636]/20 border border-[#238636]" 
                    : "bg-[#f0883e]/20 border border-[#f0883e]"
                }`}
              >
                <p className={gameState === "won" ? "text-[#3fb950]" : "text-[#f0883e]"}>
                  {feedback}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - Info & Controls */}
        <div className="w-80 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          {/* Level Info */}
          <div className="p-4 border-b border-[#30363d]">
            <h4 className="text-white font-medium mb-2">About This Level</h4>
            <p className="text-[#c9d1d9] text-sm">{level.description}</p>
          </div>

          {/* Hint Section */}
          <div className="p-4 border-b border-[#30363d]">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-[#8b949e] hover:text-white transition-colors"
            >
              <HelpCircle size={16} />
              <span className="text-sm">{showHint ? "Hide Hint" : "Show Hint"}</span>
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg"
                >
                  <p className="text-[#f0883e] text-sm">{level.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Educational Note */}
          <div className="p-4 border-b border-[#30363d] flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-[#3fb950]" />
              <h4 className="text-[#3fb950] font-medium text-sm">Why This Matters</h4>
            </div>
            <p className="text-[#c9d1d9] text-sm leading-relaxed">
              {level.educationalNote}
            </p>
          </div>

          {/* Stats */}
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

          {/* Controls */}
          <div className="p-4">
            <div className="flex gap-2">
              <button
                onClick={resetLevel}
                className="flex-1 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              {gameState === "won" && currentLevel < levels.length - 1 && (
                <button
                  onClick={nextLevel}
                  className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  Next Level
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
