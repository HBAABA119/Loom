"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, X } from "lucide-react";
import { useMinigame } from "@/lib/engine/store";
import ArrayVisualizer from "@/components/visualizers/Array";

interface ArrayState {
  elements: (number | null)[];
  capacity: number;
  isResized: boolean;
}

type ValidationFeedback = "correct" | "early" | "late" | null;

export default function ArrayResizeGame() {
  const { startMinigame, endMinigame, setValidationResult } = useMinigame();
  const [arrayState, setArrayState] = useState<ArrayState>({
    elements: [1, 2, 3, null],
    capacity: 4,
    isResized: false,
  });
  const [feedback, setFeedback] = useState<ValidationFeedback>(null);
  const [message, setMessage] = useState("");
  const [gameComplete, setGameComplete] = useState(false);

  const validateResize = useCallback((): ValidationFeedback => {
    const filledCount = arrayState.elements.filter((e) => e !== null).length;

    if (filledCount < 4) {
      return "early";
    } else if (filledCount === 4) {
      return "correct";
    } else {
      return "late";
    }
  }, [arrayState.elements]);

  const handlePush = () => {
    if (gameComplete) return;

    const firstEmptyIndex = arrayState.elements.findIndex((e) => e === null);

    if (firstEmptyIndex === -1) {
      // Array is full, show warning
      setFeedback("late");
      setMessage("Array is full! You need to resize first.");
      return;
    }

    const newElements = [...arrayState.elements];
    newElements[firstEmptyIndex] = Math.floor(Math.random() * 90) + 10;

    setArrayState((prev) => ({
      ...prev,
      elements: newElements,
    }));

    setFeedback(null);
    setMessage("");
  };

  const handleResize = () => {
    if (gameComplete || arrayState.isResized) return;

    const validation = validateResize();
    setFeedback(validation);

    if (validation === "correct") {
      setArrayState((prev) => ({
        elements: [...prev.elements, null, null, null, null],
        capacity: 8,
        isResized: true,
      }));
      setMessage("Perfect timing! Array resized from 4 → 8");
      setGameComplete(true);
      setValidationResult({
        valid: true,
        feedback: "correct",
        message: "Perfect resize timing!",
      });
    } else if (validation === "early") {
      setMessage("Too early! The array isn't full yet.");
      setValidationResult({
        valid: false,
        feedback: "early",
        message: "Resized too early",
      });
    } else {
      setMessage("Too late! Array was already over capacity.");
      setValidationResult({
        valid: false,
        feedback: "late",
        message: "Resized too late",
      });
    }
  };

  const handleReset = () => {
    setArrayState({
      elements: [1, 2, 3, null],
      capacity: 4,
      isResized: false,
    });
    setFeedback(null);
    setMessage("");
    setGameComplete(false);
    endMinigame();
    startMinigame({ elements: [1, 2, 3, null], capacity: 4 });
  };

  const filledCount = arrayState.elements.filter((e) => e !== null).length;
  const isFull = filledCount === 4;

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      {/* Instructions */}
      <div className="mb-6 text-center">
        <h3 className="text-lg font-semibold">Challenge: Resize at Capacity</h3>
        <p className="mt-2 text-sm text-muted">
          Fill the array, then resize exactly when it reaches capacity (4 elements)
        </p>
      </div>

      {/* Array Visualization */}
      <motion.div
        className="relative"
        animate={{
          x: feedback === "early" ? [-5, 5, -5, 5, 0] : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <ArrayVisualizer
          id="minigame"
          elements={arrayState.elements}
          capacity={arrayState.capacity}
          activeIndex={null}
          cellSize={60}
          gap={6}
          showIndices={true}
        />

        {/* Capacity warning indicator */}
        <AnimatePresence>
          {isFull && !arrayState.isResized && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm text-yellow-500"
            >
              Full! Time to resize
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Status */}
      <div className="mt-6 flex items-center gap-4 text-sm">
        <span className={isFull ? "text-yellow-500" : "text-muted"}>
          Size: {filledCount} / {arrayState.capacity}
        </span>
        {arrayState.isResized && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-500"
          >
            Resized!
          </motion.span>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePush}
          disabled={gameComplete || filledCount >= arrayState.capacity}
          className={`rounded px-4 py-2 font-medium ${
            gameComplete || filledCount >= arrayState.capacity
              ? "cursor-not-allowed bg-accent/50 text-muted"
              : "bg-foreground text-background hover:bg-foreground/90"
          }`}
        >
          Push Element
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleResize}
          disabled={arrayState.isResized}
          className={`rounded border px-4 py-2 font-medium ${
            arrayState.isResized
              ? "cursor-not-allowed border-border bg-accent/50 text-muted"
              : isFull
              ? "border-yellow-500 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
              : "border-border hover:bg-accent"
          }`}
        >
          Resize Array
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
                : feedback === "early"
                ? "border-red-500/50 bg-red-500/10 text-red-500"
                : "border-yellow-500/50 bg-yellow-500/10 text-yellow-500"
            }`}
          >
            {feedback === "correct" && <Check size={18} />}
            {feedback === "early" && <X size={18} />}
            {feedback === "late" && <AlertCircle size={18} />}
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success state */}
      {gameComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-green-500">Challenge Complete!</p>
          <p className="text-xs text-muted">You successfully resized at capacity</p>
        </motion.div>
      )}
    </div>
  );
}
