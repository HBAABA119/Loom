"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap } from "lucide-react";

interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  task: "enqueue" | "dequeue" | "process" | "round_robin";
  capacity: number;
  initialQueue: string[];
  targetQueue?: string[];
  operations: string[];
  sequence?: string[];
  hint: string;
  educationalNote: string;
}

const levels: Level[] = [
  {
    id: 1,
    title: "Queue Basics",
    description: "Learn FIFO with simple enqueue operations",
    objective: "Enqueue A, then B, then C in order",
    task: "enqueue",
    capacity: 5,
    initialQueue: [],
    targetQueue: ["A", "B", "C"],
    operations: ["Enqueue A", "Enqueue B", "Enqueue C"],
    sequence: ["Enqueue A", "Enqueue B", "Enqueue C"],
    hint: "Queue is FIFO - First In First Out. First element enqueued will be first to dequeue. Click operations in order.",
    educationalNote: "Unlike stacks (LIFO), queues maintain the original order. They're fair - first come, first served."
  },
  {
    id: 2,
    title: "Printer Queue",
    description: "Simulate a printer processing documents",
    objective: "Process all documents in FIFO order (dequeue all)",
    task: "dequeue",
    capacity: 5,
    initialQueue: ["Doc1", "Doc2", "Doc3"],
    targetQueue: [],
    operations: ["Dequeue", "Dequeue", "Dequeue"],
    sequence: ["Dequeue", "Dequeue", "Dequeue"],
    hint: "Dequeue removes from the FRONT. Doc1 arrived first, so it prints first. That's fairness!",
    educationalNote: "Printer spooling uses queues. Jobs wait their turn. Without queues, later jobs might print before earlier ones."
  },
  {
    id: 3,
    title: "Circular Queue",
    description: "Experience the circular wrap-around behavior",
    objective: "Fill queue, dequeue 2, then enqueue 2 more",
    task: "process",
    capacity: 4,
    initialQueue: ["A", "B"],
    targetQueue: ["C", "D", "A", "B"],
    operations: ["Enqueue C", "Enqueue D", "Dequeue", "Dequeue", "Enqueue E", "Enqueue F"],
    sequence: ["Enqueue C", "Enqueue D", "Dequeue", "Dequeue", "Enqueue E", "Enqueue F"],
    hint: "After filling and dequeuing, rear wraps to index 0. Watch E take the spot A vacated!",
    educationalNote: "Circular queues reuse freed space. Without circularity, we'd need to shift elements or waste space."
  },
  {
    id: 4,
    title: "CPU Round Robin",
    description: "Simulate CPU scheduling with time slices",
    objective: "Each process gets 1 time slice, then back to queue",
    task: "round_robin",
    capacity: 5,
    initialQueue: ["P1", "P2", "P3"],
    targetQueue: ["P1", "P2", "P3"],
    operations: ["Process P1", "Enqueue P1", "Process P2", "Enqueue P2", "Process P3", "Enqueue P3"],
    sequence: ["Process P1", "Enqueue P1", "Process P2", "Enqueue P2", "Process P3", "Enqueue P3"],
    hint: "Dequeue to process, then enqueue same process at rear if not complete. This ensures fair CPU sharing!",
    educationalNote: "Round-robin scheduling gives each process equal CPU time. Prevents starvation - no process waits forever."
  },
  {
    id: 5,
    title: "BFS Simulation",
    description: "Breadth-First Search uses a queue for level-order traversal",
    objective: "Process nodes level by level: Visit neighbors, enqueue unvisited",
    task: "process",
    capacity: 6,
    initialQueue: ["A"],
    targetQueue: ["D", "E", "F"],
    operations: ["Visit A", "Enqueue B", "Enqueue C", "Visit B", "Enqueue D", "Enqueue E", "Visit C", "Enqueue F"],
    sequence: ["Visit A", "Enqueue B", "Enqueue C", "Visit B", "Enqueue D", "Enqueue E", "Visit C", "Enqueue F"],
    hint: "BFS: Visit node, enqueue all unvisited neighbors. This explores level by level, not depth first.",
    educationalNote: "BFS finds shortest paths in unweighted graphs. DFS uses a stack and goes deep; BFS uses a queue and goes wide."
  }
];

export default function QueueMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [queue, setQueue] = useState<string[]>([]);
  const [front, setFront] = useState(0);
  const [rear, setRear] = useState(-1);
  const [size, setSize] = useState(0);
  const [processedLog, setProcessedLog] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);

  const level = levels[currentLevel];

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  const resetLevel = () => {
    setQueue([...level.initialQueue]);
    setFront(0);
    setRear(level.initialQueue.length - 1);
    setSize(level.initialQueue.length);
    setProcessedLog([]);
    setGameState("playing");
    setFeedback("");
    setShowHint(false);
    setScore(0);
    setAttempts(0);
  };

  const handleOperation = (operation: string) => {
    if (gameState !== "playing") return;
    setAttempts(a => a + 1);

    const newQueue = [...queue];
    let newSize = size;
    let newFront = front;
    let newRear = rear;
    const newLog = [...processedLog];

    if (operation.startsWith("Enqueue")) {
      if (size >= level.capacity) {
        setFeedback("❌ Queue is full! Cannot enqueue.");
        return;
      }
      const value = operation.split(" ")[1];
      newRear = (rear + 1) % level.capacity;
      if (newQueue.length <= newRear) {
        newQueue[newRear] = value;
      } else {
        newQueue[newRear] = value;
      }
      newSize++;
      setFeedback(`✅ Enqueued ${value} at position ${newRear}`);
    } else if (operation === "Dequeue" || operation.startsWith("Process") || operation.startsWith("Visit")) {
      if (size === 0) {
        setFeedback("❌ Queue is empty! Nothing to dequeue.");
        return;
      }
      const value = newQueue[newFront];
      newQueue[newFront] = "";
      newFront = (newFront + 1) % level.capacity;
      newSize--;
      newLog.push(value);
      setFeedback(operation.startsWith("Visit") ? `✅ Visited ${value}` : `✅ Dequeued ${value}`);
    }

    setQueue(newQueue);
    setFront(newFront);
    setRear(newRear);
    setSize(newSize);
    setProcessedLog(newLog);

    // Check win
    if (level.targetQueue && arraysEqual(newQueue.filter(x => x), level.targetQueue)) {
      completeLevel(50 - attempts);
    } else if (level.targetQueue?.length === 0 && newSize === 0) {
      completeLevel(50 - attempts);
    }
  };

  const arraysEqual = (a: string[], b: string[]) => {
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

  // Visual queue with circular positions
  const visualQueue = Array(level.capacity).fill("");
  for (let i = 0; i < size; i++) {
    const idx = (front + i) % level.capacity;
    visualQueue[idx] = queue[idx] || "";
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">Queue Challenge</h3>
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
        {/* Left - Queue Visualization */}
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

          {/* Queue Display */}
          <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg p-6 mb-4">
            <div className="flex flex-col items-center justify-center h-full">
              {/* Stats */}
              <div className="flex gap-4 mb-6 text-sm">
                <span className="text-[#8b949e]">Front: <span className="text-[#58a6ff] font-mono">{front}</span></span>
                <span className="text-[#8b949e]">Rear: <span className="text-[#f0883e] font-mono">{rear}</span></span>
                <span className="text-[#8b949e]">Size: <span className="text-white font-mono">{size}</span>/{level.capacity}</span>
              </div>

              {/* Queue Array */}
              <div className="flex gap-2">
                {visualQueue.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={item ? { scale: 0 } : false}
                    animate={{ scale: 1 }}
                    className={`w-16 h-20 border-2 rounded-lg flex items-center justify-center font-bold relative ${
                      item
                        ? idx === front
                          ? "border-[#58a6ff] bg-[#58a6ff]/20 text-[#58a6ff]"
                          : idx === rear
                          ? "border-[#f0883e] bg-[#f0883e]/20 text-[#f0883e]"
                          : "border-[#30363d] bg-[#21262d] text-[#c9d1d9]"
                        : "border-[#21262d] border-dashed bg-[#161b22] text-[#6e7681]"
                    }`}
                  >
                    {item || "∅"}
                    {idx === front && item && <span className="absolute -top-2 text-[10px] bg-[#58a6ff] text-white px-1 rounded">FRONT</span>}
                    {idx === rear && item && <span className="absolute -top-2 text-[10px] bg-[#f0883e] text-white px-1 rounded">REAR</span>}
                    <span className="absolute -bottom-5 text-[10px] text-[#6e7681] font-mono">[{idx}]</span>
                  </motion.div>
                ))}
              </div>

              {/* Direction Arrows */}
              <div className="flex justify-between w-full max-w-md mt-8 text-xs text-[#8b949e]">
                <span className="flex items-center gap-1">← DEQUEUE (Front)</span>
                <span className="flex items-center gap-1">ENQUEUE (Rear) →</span>
              </div>

              {/* Processed Log */}
              {processedLog.length > 0 && (
                <div className="mt-6 p-3 bg-[#238636]/10 rounded-lg">
                  <span className="text-[#3fb950] text-sm">Processed: {processedLog.join(" → ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Operations */}
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <h4 className="text-[#8b949e] text-sm mb-3">Operations:</h4>
            <div className="flex gap-2 flex-wrap">
              {level.operations.map((op) => (
                <motion.button
                  key={op}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOperation(op)}
                  disabled={gameState !== "playing"}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    op.startsWith("Enqueue")
                      ? "bg-[#f0883e]/20 text-[#f0883e] border border-[#f0883e]/50 hover:bg-[#f0883e]/30"
                      : op === "Dequeue" || op.startsWith("Process") || op.startsWith("Visit")
                      ? "bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/50 hover:bg-[#58a6ff]/30"
                      : "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
                  }`}
                >
                  {op}
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
