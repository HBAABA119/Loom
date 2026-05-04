"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { useMinigame } from "@/lib/engine/store";

type ValidationFeedback = "correct" | "incorrect" | null;

export default function QueueMinigame() {
  const { startMinigame, endMinigame, setValidationResult } = useMinigame();
  const [queue, setQueue] = useState<number[]>([1, 2, 3]);
  const [targetQueue, setTargetQueue] = useState<number[]>([1, 2, 3, 4, 5]);
  const [feedback, setFeedback] = useState<ValidationFeedback>(null);
  const [message, setMessage] = useState("");
  const [gameComplete, setGameComplete] = useState(false);

  const validateQueue = useCallback(() => {
    return JSON.stringify(queue) === JSON.stringify(targetQueue);
  }, [queue, targetQueue]);

  const handleEnqueue = (value: number) => {
    if (gameComplete || queue.length >= 6) return;
    setQueue((prev) => [...prev, value]);
    setFeedback(null);
    setMessage("");
  };

  const handleDequeue = () => {
    if (gameComplete || queue.length === 0) return;
    setQueue((prev) => prev.slice(1));
    setFeedback(null);
    setMessage("");
  };

  const handleCheck = () => {
    if (gameComplete) return;

    const isCorrect = validateQueue();

    if (isCorrect) {
      setFeedback("correct");
      setMessage("Excellent! You matched the target queue!");
      setGameComplete(true);
      setValidationResult({
        valid: true,
        feedback: "correct",
        message: "Queue matches target",
      });
    } else {
      setFeedback("incorrect");
      setMessage(`Not quite. Your queue: [${queue.join(", ")}]. Target: [${targetQueue.join(", ")}]`);
      setValidationResult({
        valid: false,
        feedback: "incorrect",
        message: "Queue doesn't match target",
      });
    }
  };

  const handleReset = () => {
    setQueue([1, 2, 3]);
    setTargetQueue([1, 2, 3, 4, 5]);
    setFeedback(null);
    setMessage("");
    setGameComplete(false);
    endMinigame();
    startMinigame({ queue: [1, 2, 3] });
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      {/* Instructions */}
      <div className="mb-6 text-center">
        <h3 className="text-lg font-semibold">Challenge: Build the Queue</h3>
        <p className="mt-2 text-sm text-muted">
          Use Enqueue and Dequeue to match [1, 2, 3] → [1, 2, 3, 4, 5]
        </p>
        <p className="mt-1 text-xs text-muted">Remember: Queue is FIFO (First In, First Out)</p>
      </div>

      {/* Target Queue */}
      <div className="mb-6 text-center">
        <p className="mb-2 text-xs text-muted">Target Queue (front to rear):</p>
        <div className="flex items-center gap-1">
          {targetQueue.map((value, index) => (
            <div
              key={index}
              className="flex h-10 w-10 items-center justify-center rounded border border-green-500/30 bg-green-500/10 text-sm"
            >
              {value}
            </div>
          ))}
        </div>
      </div>

      {/* Current Queue */}
      <div className="mb-6">
        <p className="mb-2 text-center text-xs text-muted">Your Queue:</p>
        <div className="relative">
          {/* Front/Rear labels */}
          <div className="absolute -top-6 left-2 text-xs text-green-400">front</div>
          <div className="absolute -top-6 right-2 text-xs text-blue-400">rear</div>

          <div className="flex border-2 border-border">
            {queue.length === 0 && (
              <div className="flex h-12 w-48 items-center justify-center text-xs text-muted">
                Empty Queue
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {queue.map((value, index) => (
                <motion.div
                  key={`${index}-${value}`}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className={`flex h-12 w-16 items-center justify-center border-r border-border text-lg font-mono last:border-r-0 ${
                    index === 0
                      ? "bg-green-400/10"
                      : index === queue.length - 1
                      ? "bg-blue-400/10"
                      : "bg-[#1a1a1a]"
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
          onClick={() => handleEnqueue(4)}
          disabled={gameComplete || queue.length >= 6}
          className={`flex items-center gap-2 rounded px-4 py-2 ${
            gameComplete || queue.length >= 6
              ? "cursor-not-allowed bg-accent/50 text-muted"
              : "bg-foreground text-background hover:bg-foreground/90"
          }`}
        >
          <ArrowRight size={16} />
          Enqueue 4
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleEnqueue(5)}
          disabled={gameComplete || queue.length >= 6}
          className={`flex items-center gap-2 rounded px-4 py-2 ${
            gameComplete || queue.length >= 6
              ? "cursor-not-allowed bg-accent/50 text-muted"
              : "bg-foreground text-background hover:bg-foreground/90"
          }`}
        >
          <ArrowRight size={16} />
          Enqueue 5
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDequeue}
          disabled={gameComplete || queue.length === 0}
          className={`flex items-center gap-2 rounded border border-border px-4 py-2 ${
            gameComplete || queue.length === 0
              ? "cursor-not-allowed bg-accent/30"
              : "hover:bg-accent"
          }`}
        >
          <ArrowLeft size={16} />
          Dequeue
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
