"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowUp, ArrowDown } from "lucide-react";
import { useMinigame } from "@/lib/engine/store";

type ValidationFeedback = "correct" | "incorrect" | null;

export default function StackMinigame() {
  const { startMinigame, endMinigame, setValidationResult } = useMinigame();
  const [stack, setStack] = useState<number[]>([3, 7, 2]);
  const [targetStack, setTargetStack] = useState<number[]>([2, 7, 3]);
  const [feedback, setFeedback] = useState<ValidationFeedback>(null);
  const [message, setMessage] = useState("");
  const [gameComplete, setGameComplete] = useState(false);

  const validateStack = useCallback(() => {
    return JSON.stringify(stack) === JSON.stringify(targetStack);
  }, [stack, targetStack]);

  const handlePush = (value: number) => {
    if (gameComplete || stack.length >= 5) return;
    setStack((prev) => [...prev, value]);
    setFeedback(null);
    setMessage("");
  };

  const handlePop = () => {
    if (gameComplete || stack.length === 0) return;
    setStack((prev) => prev.slice(0, -1));
    setFeedback(null);
    setMessage("");
  };

  const handleCheck = () => {
    if (gameComplete) return;

    const isCorrect = validateStack();

    if (isCorrect) {
      setFeedback("correct");
      setMessage("Perfect! You reversed the stack correctly!");
      setGameComplete(true);
      setValidationResult({
        valid: true,
        feedback: "correct",
        message: "Stack reversed correctly",
      });
    } else {
      setFeedback("incorrect");
      setMessage(`Not quite. Your stack: [${stack.join(", ")}]. Target: [${targetStack.join(", ")}]`);
      setValidationResult({
        valid: false,
        feedback: "incorrect",
        message: "Stack doesn't match target",
      });
    }
  };

  const handleReset = () => {
    setStack([3, 7, 2]);
    setTargetStack([2, 7, 3]);
    setFeedback(null);
    setMessage("");
    setGameComplete(false);
    endMinigame();
    startMinigame({ stack: [3, 7, 2] });
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      {/* Instructions */}
      <div className="mb-6 text-center">
        <h3 className="text-lg font-semibold">Challenge: Reverse a Stack</h3>
        <p className="mt-2 text-sm text-muted">
          Use Push and Pop operations to transform [3, 7, 2] → [2, 7, 3]
        </p>
        <p className="mt-1 text-xs text-muted">Remember: Stack is LIFO (Last In, First Out)</p>
      </div>

      {/* Target Stack */}
      <div className="mb-6 text-center">
        <p className="mb-2 text-xs text-muted">Target Stack (bottom to top):</p>
        <div className="flex items-center gap-1">
          {targetStack.map((value, index) => (
            <div
              key={index}
              className="flex h-10 w-10 items-center justify-center rounded border border-green-500/30 bg-green-500/10 text-sm"
            >
              {value}
            </div>
          ))}
        </div>
      </div>

      {/* Current Stack */}
      <div className="mb-6">
        <p className="mb-2 text-center text-xs text-muted">Your Stack:</p>
        <div className="relative">
          {/* Top label */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-blue-400">
            TOP
          </div>

          <div className="flex flex-col-reverse border-2 border-border">
            {stack.length === 0 && (
              <div className="flex h-12 w-24 items-center justify-center text-xs text-muted">
                Empty
              </div>
            )}
            <AnimatePresence>
              {stack.map((value, index) => (
                <motion.div
                  key={`${index}-${value}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className={`flex h-12 w-24 items-center justify-center border-b border-border text-lg font-mono last:border-b-0 ${
                    index === stack.length - 1 ? "bg-blue-400/10" : "bg-[#1a1a1a]"
                  }`}
                >
                  {value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePush(5)}
          disabled={gameComplete || stack.length >= 5}
          className={`flex items-center gap-2 rounded px-4 py-2 ${
            gameComplete || stack.length >= 5
              ? "cursor-not-allowed bg-accent/50 text-muted"
              : "bg-foreground text-background hover:bg-foreground/90"
          }`}
        >
          <ArrowUp size={16} />
          Push 5
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePush(1)}
          disabled={gameComplete || stack.length >= 5}
          className={`flex items-center gap-2 rounded px-4 py-2 ${
            gameComplete || stack.length >= 5
              ? "cursor-not-allowed bg-accent/50 text-muted"
              : "bg-foreground text-background hover:bg-foreground/90"
          }`}
        >
          <ArrowUp size={16} />
          Push 1
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePop}
          disabled={gameComplete || stack.length === 0}
          className={`flex items-center gap-2 rounded border border-border px-4 py-2 ${
            gameComplete || stack.length === 0
              ? "cursor-not-allowed bg-accent/30"
              : "hover:bg-accent"
          }`}
        >
          <ArrowDown size={16} />
          Pop
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCheck}
          disabled={gameComplete}
          className={`rounded px-4 py-2 font-medium ${
            gameComplete
              ? "cursor-not-allowed bg-accent/50 text-muted"
              : "border border-green-500/50 bg-green-500/20 text-green-500 hover:bg-green-500/30"
          }`}
        >
          Check
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="rounded border border-border px-4 py-2 hover:bg-accent"
        >
          Reset
        </motion.button>
      </div>

      {/* Feedback */}
      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div
            key={feedback}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`mt-6 flex items-center gap-2 rounded border px-4 py-2 ${
              feedback === "correct"
                ? "border-green-500/50 bg-green-500/10 text-green-500"
                : "border-red-500/50 bg-red-500/10 text-red-500"
            }`}
          >
            {feedback === "correct" ? <Check size={18} /> : <X size={18} />}
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
