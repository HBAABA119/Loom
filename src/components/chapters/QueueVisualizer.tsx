"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface QueueState {
  elements: number[];
  capacity: number;
  front: number;
  rear: number;
  size: number;
}

interface AlgorithmStep {
  step: number;
  action: "init" | "enqueue" | "dequeue" | "peek";
  state: QueueState;
  value?: number;
  highlightLines: number[];
  description: string;
}

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    state: { elements: [], capacity: 5, front: 0, rear: -1, size: 0 },
    highlightLines: [1, 2],
    description: "Initialize empty queue with capacity 5",
  },
  {
    step: 1,
    action: "enqueue",
    state: { elements: [10], capacity: 5, front: 0, rear: 0, size: 1 },
    value: 10,
    highlightLines: [5, 6, 7],
    description: "Enqueue 10: Add to rear of queue",
  },
  {
    step: 2,
    action: "enqueue",
    state: { elements: [10, 20], capacity: 5, front: 0, rear: 1, size: 2 },
    value: 20,
    highlightLines: [5, 6, 7],
    description: "Enqueue 20: Rear pointer moves to index 1",
  },
  {
    step: 3,
    action: "enqueue",
    state: { elements: [10, 20, 30], capacity: 5, front: 0, rear: 2, size: 3 },
    value: 30,
    highlightLines: [5, 6, 7],
    description: "Enqueue 30: Queue grows from rear",
  },
  {
    step: 4,
    action: "dequeue",
    state: { elements: [20, 30], capacity: 5, front: 1, rear: 2, size: 2 },
    value: 10,
    highlightLines: [10, 11, 12],
    description: "Dequeue: Remove 10 from front, front pointer moves",
  },
  {
    step: 5,
    action: "enqueue",
    state: { elements: [20, 30, 40], capacity: 5, front: 1, rear: 3, size: 3 },
    value: 40,
    highlightLines: [5, 6, 7],
    description: "Enqueue 40: Continue adding to rear",
  },
  {
    step: 6,
    action: "peek",
    state: { elements: [20, 30, 40], capacity: 5, front: 1, rear: 3, size: 3 },
    value: 20,
    highlightLines: [15, 16],
    description: "Peek: View front element (20) without removing",
  },
];

export default function QueueVisualizer() {
  const { currentStep, setTotalSteps } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  const step = algorithmSteps[currentStep] || algorithmSteps[0];

  useEffect(() => {
    setTotalSteps(algorithmSteps.length);
  }, [setTotalSteps]);

  useEffect(() => {
    setActiveLines(step.highlightLines);
  }, [step]);

  const cellWidth = 80;
  const cellHeight = 60;

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      {/* Description */}
      <motion.div
        key={step.step}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="mb-8 text-center"
      >
        <p className="text-lg">{step.description}</p>
        <p className="mt-2 text-sm text-muted">
          Step {currentStep + 1} / {algorithmSteps.length} • Action: {step.action}
        </p>
      </motion.div>

      {/* Queue Visualization */}
      <div className="relative">
        {/* Front and Rear labels */}
        <div className="absolute -top-8 left-0 right-0 flex justify-between px-4 text-xs">
          <span className="text-green-400">FRONT (Dequeue)</span>
          <span className="text-blue-400">REAR (Enqueue)</span>
        </div>

        {/* Queue container */}
        <div className="flex items-center">
          {/* Front pointer */}
          <motion.div
            initial={false}
            animate={{ x: step.state.front * cellWidth }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute -left-16 top-1/2 -translate-y-1/2 text-xs text-green-400"
          >
            front →
          </motion.div>

          {/* Queue cells */}
          <div className="flex border-2 border-border">
            {Array.from({ length: step.state.capacity }).map((_, index) => {
              // Calculate actual index in circular buffer
              const actualIndex = (step.state.front + index) % step.state.capacity;
              const value = step.state.elements[index];
              const isFilled = index < step.state.size;
              const isFront = index === 0 && step.state.size > 0;
              const isRear = index === step.state.size - 1 && step.state.size > 0;

              return (
                <motion.div
                  key={index}
                  initial={false}
                  animate={{
                    backgroundColor: isFront
                      ? "rgba(100, 255, 150, 0.2)"
                      : isRear
                      ? "rgba(100, 200, 255, 0.2)"
                      : isFilled
                      ? "#1a1a1a"
                      : "transparent",
                    borderColor: isFront ? "#4ade80" : isRear ? "#60a5fa" : "#333",
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex h-[60px] w-[80px] items-center justify-center border-r border-border last:border-r-0"
                  style={{
                    boxShadow: isFront
                      ? "inset 0 0 12px rgba(100, 255, 150, 0.3)"
                      : isRear
                      ? "inset 0 0 12px rgba(100, 200, 255, 0.3)"
                      : undefined,
                  }}
                >
                  {isFilled && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="text-lg font-mono"
                    >
                      {value}
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Rear pointer */}
          <motion.div
            initial={false}
            animate={{ x: step.state.rear * cellWidth }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute -right-16 top-1/2 -translate-y-1/2 text-xs text-blue-400"
          >
            ← rear
          </motion.div>
        </div>

        {/* Index labels */}
        <div className="mt-2 flex">
          {Array.from({ length: step.state.capacity }).map((_, index) => (
            <div
              key={index}
              className="flex w-[80px] justify-center text-xs text-muted"
            >
              {index}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex gap-6 text-xs text-muted">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-green-400 bg-green-400/20" />
          <span>Front (Dequeue)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-blue-400 bg-blue-400/20" />
          <span>Rear (Enqueue)</span>
        </div>
      </div>
    </div>
  );
}

export { algorithmSteps };
export type { AlgorithmStep, QueueState };
