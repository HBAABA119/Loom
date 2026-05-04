"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { useMinigame } from "@/lib/engine/store";

interface ListNode {
  id: string;
  value: number;
  next: string | null;
}

interface LinkedListState {
  nodes: ListNode[];
  head: string | null;
}

type ValidationFeedback = "correct" | "incorrect" | null;

export default function LinkedListMinigame() {
  const { startMinigame, endMinigame, setValidationResult } = useMinigame();
  const [listState, setListState] = useState<LinkedListState>({
    nodes: [
      { id: "a", value: 5, next: "b" },
      { id: "b", value: 10, next: "c" },
      { id: "c", value: 15, next: null },
    ],
    head: "a",
  });
  const [feedback, setFeedback] = useState<ValidationFeedback>(null);
  const [message, setMessage] = useState("");
  const [gameComplete, setGameComplete] = useState(false);
  const [currentValue, setCurrentValue] = useState<number | null>(null);

  const getNodeSequence = useCallback(() => {
    const sequence: ListNode[] = [];
    let current = listState.head;
    while (current) {
      const node = listState.nodes.find((n) => n.id === current);
      if (node) {
        sequence.push(node);
        current = node.next;
      } else {
        break;
      }
    }
    return sequence;
  }, [listState]);

  const handleReverse = () => {
    if (gameComplete) return;

    // Check if the list is actually reversed
    const sequence = getNodeSequence();
    const values = sequence.map((n) => n.value);
    const isReversed = JSON.stringify(values) === JSON.stringify([15, 10, 5]);

    if (isReversed) {
      setFeedback("correct");
      setMessage("Excellent! You successfully reversed the linked list!");
      setGameComplete(true);
      setValidationResult({
        valid: true,
        feedback: "correct",
        message: "List reversed correctly",
      });
    } else {
      setFeedback("incorrect");
      setMessage("Not quite right. Try rearranging the pointers to reverse the order.");
      setValidationResult({
        valid: false,
        feedback: "incorrect",
        message: "List not reversed correctly",
      });
    }
  };

  const handleSwapNodes = (nodeId1: string, nodeId2: string) => {
    if (gameComplete) return;

    setListState((prev) => {
      const newNodes = [...prev.nodes];
      const node1 = newNodes.find((n) => n.id === nodeId1);
      const node2 = newNodes.find((n) => n.id === nodeId2);

      if (node1 && node2) {
        // Swap values
        const temp = node1.value;
        node1.value = node2.value;
        node2.value = temp;
      }

      return { ...prev, nodes: newNodes };
    });
  };

  const handleReset = () => {
    setListState({
      nodes: [
        { id: "a", value: 5, next: "b" },
        { id: "b", value: 10, next: "c" },
        { id: "c", value: 15, next: null },
      ],
      head: "a",
    });
    setFeedback(null);
    setMessage("");
    setGameComplete(false);
    setCurrentValue(null);
    endMinigame();
    startMinigame({ nodes: [], head: null });
  };

  const sequence = getNodeSequence();

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      {/* Instructions */}
      <div className="mb-6 text-center">
        <h3 className="text-lg font-semibold">Challenge: Reverse a Linked List</h3>
        <p className="mt-2 text-sm text-muted">
          Click nodes to swap their values. Reverse the list so it reads 15 → 10 → 5
        </p>
      </div>

      {/* Linked List Visualization */}
      <div className="mb-8 flex items-center gap-2">
        <AnimatePresence mode="popLayout">
          {sequence.map((node, index) => (
            <motion.div
              key={node.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              {/* Node */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (currentValue === null) {
                    setCurrentValue(node.value);
                  } else {
                    // Find node with current value and swap
                    const otherNode = listState.nodes.find((n) => n.value === currentValue);
                    if (otherNode && otherNode.id !== node.id) {
                      handleSwapNodes(node.id, otherNode.id);
                    }
                    setCurrentValue(null);
                  }
                }}
                className={`relative flex h-14 w-14 flex-col items-center justify-center rounded border-2 transition-colors ${
                  currentValue === node.value
                    ? "border-blue-400 bg-blue-400/20"
                    : "border-border bg-[#1a1a1a] hover:border-accent"
                }`}
              >
                <span className="text-lg font-mono">{node.value}</span>
                {index === 0 && (
                  <span className="absolute -top-6 text-xs text-green-400">head</span>
                )}
              </motion.button>

              {/* Arrow */}
              {index < sequence.length - 1 && (
                <ArrowRight size={20} className="text-muted" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Null terminator */}
        <span className="text-muted">→ null</span>
      </div>

      {/* Current selection */}
      {currentValue !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-sm text-blue-400"
        >
          Selected: {currentValue} (click another node to swap)
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReverse}
          disabled={gameComplete}
          className={`rounded px-4 py-2 font-medium ${
            gameComplete
              ? "cursor-not-allowed bg-accent/50 text-muted"
              : "bg-foreground text-background hover:bg-foreground/90"
          }`}
        >
          Check Answer
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

      {/* Success state */}
      {gameComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-green-500">Challenge Complete!</p>
          <p className="text-xs text-muted">You reversed the linked list by swapping node values</p>
        </motion.div>
      )}
    </div>
  );
}
