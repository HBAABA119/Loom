"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useVisualizer, useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface StackState {
  elements: number[];
  capacity: number;
  top: number;
}

interface AlgorithmStep {
  step: number;
  action: "init" | "push" | "pop" | "peek";
  state: StackState;
  value?: number;
  highlightLines: number[];
  description: string;
}

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    state: { elements: [], capacity: 5, top: -1 },
    highlightLines: [1, 2],
    description: "Initialize empty stack with capacity 5",
  },
  {
    step: 1,
    action: "push",
    state: { elements: [10], capacity: 5, top: 0 },
    value: 10,
    highlightLines: [5, 6, 7],
    description: "Push 10: Add to top of stack",
  },
  {
    step: 2,
    action: "push",
    state: { elements: [10, 20], capacity: 5, top: 1 },
    value: 20,
    highlightLines: [5, 6, 7],
    description: "Push 20: Stack grows upward",
  },
  {
    step: 3,
    action: "push",
    state: { elements: [10, 20, 30], capacity: 5, top: 2 },
    value: 30,
    highlightLines: [5, 6, 7],
    description: "Push 30: Top pointer moves to index 2",
  },
  {
    step: 4,
    action: "pop",
    state: { elements: [10, 20], capacity: 5, top: 1 },
    value: 30,
    highlightLines: [10, 11, 12],
    description: "Pop: Remove 30 from top, return value",
  },
  {
    step: 5,
    action: "peek",
    state: { elements: [10, 20], capacity: 5, top: 1 },
    value: 20,
    highlightLines: [15, 16],
    description: "Peek: View top element (20) without removing",
  },
  {
    step: 6,
    action: "push",
    state: { elements: [10, 20, 40], capacity: 5, top: 2 },
    value: 40,
    highlightLines: [5, 6, 7],
    description: "Push 40: Add new element after pop",
  },
];

export default function StackVisualizer() {
  const { currentStep, setTotalSteps } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  const step = algorithmSteps[currentStep] || algorithmSteps[0];

  useEffect(() => {
    setTotalSteps(algorithmSteps.length);
  }, [setTotalSteps]);

  useEffect(() => {
    setActiveLines(step.highlightLines);
  }, [step, setActiveLines]);

  const maxCapacity = 5;
  const cellHeight = 50;
  const cellWidth = 120;

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

      {/* Stack Visualization */}
      <div className="relative flex items-end">
        {/* Stack container */}
        <div className="relative">
          {/* Top label */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-muted">
            TOP
          </div>

          {/* Stack cells (render bottom to top visually) */}
          <div className="flex flex-col-reverse border-2 border-border">
            {Array.from({ length: maxCapacity }).map((_, index) => {
              const elementIndex = index;
              const value = step.state.elements[elementIndex];
              const isFilled = value !== undefined;
              const isTop = elementIndex === step.state.top;

              return (
                <motion.div
                  key={index}
                  initial={false}
                  animate={{
                    backgroundColor: isTop
                      ? "rgba(100, 200, 255, 0.2)"
                      : isFilled
                      ? "#1a1a1a"
                      : "transparent",
                    borderColor: isTop ? "#60a5fa" : "#333",
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex h-[50px] w-[120px] items-center justify-center border-b border-border last:border-b-0"
                  style={{
                    boxShadow: isTop ? "0 0 12px rgba(100, 200, 255, 0.3)" : undefined,
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

                  {/* Top indicator */}
                  {isTop && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute -right-16 text-xs text-blue-400"
                    >
                      ← top
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Index labels */}
        <div className="ml-4 flex flex-col-reverse">
          {Array.from({ length: maxCapacity }).map((_, index) => (
            <div key={index} className="flex h-[50px] items-center text-xs text-muted">
              {index}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex gap-6 text-xs text-muted">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-blue-400 bg-blue-400/20" />
          <span>Top of Stack</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-border bg-[#1a1a1a]" />
          <span>Element</span>
        </div>
      </div>
    </div>
  );
}

export { algorithmSteps };
export type { AlgorithmStep, StackState };
