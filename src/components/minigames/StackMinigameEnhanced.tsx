"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap } from "lucide-react";

interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  task: "push" | "pop" | "balance" | "reverse" | "calculate";
  initialStack: string[];
  targetStack?: string[];
  operations: string[];
  sequence?: string[];
  hint: string;
  educationalNote: string;
}

const levels: Level[] = [
  {
    id: 1,
    title: "Push & Build",
    description: "Learn the fundamental push operation",
    objective: "Push A, then B, then C onto the stack",
    task: "push",
    initialStack: [],
    targetStack: ["C", "B", "A"],
    operations: ["Push A", "Push B", "Push C"],
    sequence: ["Push A", "Push B", "Push C"],
    hint: "Remember: Last In, First Out. The last thing you push will be on top.",
    educationalNote: "Push adds to the top. It's always O(1) - the most efficient stack operation."
  },
  {
    id: 2,
    title: "Pop It Off",
    description: "Remove elements from the top",
    objective: "Pop twice from the stack [D, C, B, A]",
    task: "pop",
    initialStack: ["D", "C", "B", "A"],
    targetStack: ["B", "A"],
    operations: ["Pop", "Pop"],
    sequence: ["Pop", "Pop"],
    hint: "Pop removes from the top. D is on top, so D goes first, then C.",
    educationalNote: "Pop also O(1)! Both push and pop are incredibly fast because they only work with the top element."
  },
  {
    id: 3,
    title: "Balanced Parentheses",
    description: "Stacks are perfect for checking matching pairs",
    objective: "Check if '(()())' is balanced using a stack",
    task: "balance",
    initialStack: [],
    operations: ["Push (", "Push (", "Pop", "Push (", "Pop", "Pop"],
    sequence: ["Push (", "Push (", "Pop", "Push (", "Pop", "Pop"],
    hint: "Push for '(', Pop for ')'. If you try to pop from empty, it's unbalanced. If stack isn't empty at end, it's unbalanced.",
    educationalNote: "This is a classic stack interview problem. Time: O(n), Space: O(n) for the stack."
  },
  {
    id: 4,
    title: "Reverse With Stacks",
    description: "Use a stack to reverse a sequence",
    objective: "Reverse [1, 2, 3] using stack operations",
    task: "reverse",
    initialStack: [],
    targetStack: ["3", "2", "1"],
    operations: ["Push 1", "Push 2", "Push 3", "Pop", "Pop", "Pop"],
    sequence: ["Push 1", "Push 2", "Push 3", "Pop", "Pop", "Pop"],
    hint: "Push all elements first (they stack up), then pop all. LIFO naturally reverses the order!",
    educationalNote: "This demonstrates a key property: pushing then popping reverses the sequence. Useful for undo systems!"
  },
  {
    id: 5,
    title: "Expression Evaluation",
    description: "Evaluate postfix (Reverse Polish) notation",
    objective: "Evaluate '5 3 + 2 *' using a stack",
    task: "calculate",
    initialStack: [],
    operations: ["Push 5", "Push 3", "+", "Push 2", "*"],
    sequence: ["Push 5", "Push 3", "+", "Push 2", "*"],
    hint: "Push numbers. When you see an operator, pop two numbers, apply operator, push result. Final answer is the only element left.",
    educationalNote: "Postfix notation needs no parentheses! Stack-based evaluation is O(n). This is how old HP calculators worked."
  }
];

export default function StackMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [stack, setStack] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);
  const [intermediateResult, setIntermediateResult] = useState<string | null>(null);

  const level = levels[currentLevel];

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  const resetLevel = () => {
    setStack([...level.initialStack]);
    setUserSequence([]);
    setGameState("playing");
    setFeedback("");
    setShowHint(false);
    setScore(0);
    setAttempts(0);
    setIntermediateResult(null);
  };

  const handleOperation = (operation: string) => {
    if (gameState !== "playing") return;
    setAttempts(a => a + 1);

    let newStack = [...stack];
    let result = null;

    if (operation.startsWith("Push")) {
      const value = operation.split(" ")[1];
      newStack = [value, ...newStack];
      setFeedback(`✅ Pushed ${value} onto stack`);
    } else if (operation === "Pop") {
      if (newStack.length === 0) {
        setFeedback("❌ Cannot pop from empty stack!");
        setScore(Math.max(0, score - 5));
        return;
      }
      const popped = newStack[0];
      newStack = newStack.slice(1);
      setFeedback(`✅ Popped ${popped} from stack`);
      result = popped;
    } else if (["+", "-", "*", "/"].includes(operation)) {
      if (newStack.length < 2) {
        setFeedback("❌ Need at least 2 numbers to operate!");
        return;
      }
      const b = parseInt(newStack[0]);
      const a = parseInt(newStack[1]);
      newStack = newStack.slice(2);
      let calcResult = 0;
      switch (operation) {
        case "+": calcResult = a + b; break;
        case "-": calcResult = a - b; break;
        case "*": calcResult = a * b; break;
        case "/": calcResult = Math.floor(a / b); break;
      }
      newStack = [calcResult.toString(), ...newStack];
      setFeedback(`✅ Calculated: ${a} ${operation} ${b} = ${calcResult}`);
      result = calcResult.toString();
    }

    setStack(newStack);
    const newSequence = [...userSequence, operation];
    setUserSequence(newSequence);
    setIntermediateResult(result);

    // Check win conditions
    if (level.task === "push" || level.task === "reverse") {
      if (level.targetStack && arraysEqual(newStack, level.targetStack)) {
        completeLevel(50 - attempts);
      }
    } else if (level.task === "pop") {
      if (level.targetStack && arraysEqual(newStack, level.targetStack) && newSequence.length === level.sequence?.length) {
        completeLevel(50 - attempts);
      }
    } else if (level.task === "balance") {
      if (newStack.length === 0 && newSequence.length === level.sequence?.length) {
        completeLevel(60 - attempts);
      }
    } else if (level.task === "calculate") {
      if (newStack.length === 1 && newSequence.length === level.sequence?.length) {
        completeLevel(70 - attempts);
      }
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

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">Stack Challenge</h3>
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
        {/* Left - Stack Visualization */}
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

          {/* Stack Display */}
          <div className="flex-1 flex gap-8 items-center justify-center">
            {/* Current Stack */}
            <div className="flex flex-col items-center">
              <h4 className="text-[#8b949e] text-sm mb-4">Your Stack</h4>
              <div className="border-2 border-[#30363d] rounded-lg p-4 min-w-[160px] min-h-[250px] flex flex-col-reverse items-center gap-2 bg-[#161b22]/50">
                <AnimatePresence mode="popLayout">
                  {stack.length === 0 ? (
                    <span className="text-[#6e7681] italic text-sm">Empty</span>
                  ) : (
                    stack.map((item, idx) => (
                      <motion.div
                        key={`${item}-${idx}`}
                        initial={{ y: -50, opacity: 0, scale: 0.5 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -50, opacity: 0, scale: 0.5 }}
                        className={`w-24 h-12 border-2 rounded-lg flex items-center justify-center font-bold ${
                          idx === 0
                            ? "border-[#f0883e] bg-[#f0883e]/20 text-[#f0883e]"
                            : "border-[#30363d] bg-[#21262d] text-[#c9d1d9]"
                        }`}
                      >
                        {idx === 0 && <span className="text-xs mr-1">TOP</span>}
                        {item}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Target Stack (if applicable) */}
            {level.targetStack && (
              <div className="flex flex-col items-center">
                <h4 className="text-[#8b949e] text-sm mb-4">Target</h4>
                <div className="border-2 border-dashed border-[#3fb950]/50 rounded-lg p-4 min-w-[160px] min-h-[250px] flex flex-col-reverse items-center gap-2 bg-[#238636]/5">
                  {level.targetStack.map((item, idx) => (
                    <div
                      key={idx}
                      className={`w-24 h-12 border-2 rounded-lg flex items-center justify-center font-bold border-[#3fb950]/50 bg-[#238636]/10 text-[#3fb950]`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Operations */}
          <div className="mt-6 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
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
                    op.startsWith("Push")
                      ? "bg-[#3fb950]/20 text-[#3fb950] border border-[#3fb950]/50 hover:bg-[#3fb950]/30"
                      : op === "Pop"
                      ? "bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/50 hover:bg-[#f85149]/30"
                      : ["+", "-", "*", "/"].includes(op)
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
