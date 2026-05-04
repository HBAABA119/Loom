"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useVisualizer, useTimeline, useCodeHighlight } from "@/lib/engine/store";
import ArrayVisualizer from "@/components/visualizers/Array";

interface AlgorithmStep {
  step: number;
  action: string;
  value?: number;
  arrayState: (number | null)[];
  capacity: number;
  activeIndex: number | null;
  highlightLines: number[];
  description: string;
}

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    arrayState: [],
    capacity: 4,
    activeIndex: null,
    highlightLines: [1, 2],
    description: "Initialize array with capacity 4",
  },
  {
    step: 1,
    action: "push",
    value: 5,
    arrayState: [5, null, null, null],
    capacity: 4,
    activeIndex: 0,
    highlightLines: [5, 6],
    description: "Push 5 - size < capacity, insert at index 0",
  },
  {
    step: 2,
    action: "push",
    value: 3,
    arrayState: [5, 3, null, null],
    capacity: 4,
    activeIndex: 1,
    highlightLines: [5, 6],
    description: "Push 3 - insert at index 1",
  },
  {
    step: 3,
    action: "push",
    value: 7,
    arrayState: [5, 3, 7, null],
    capacity: 4,
    activeIndex: 2,
    highlightLines: [5, 6],
    description: "Push 7 - insert at index 2",
  },
  {
    step: 4,
    action: "push",
    value: 1,
    arrayState: [5, 3, 7, 1],
    capacity: 4,
    activeIndex: 3,
    highlightLines: [5, 6],
    description: "Push 1 - array is now full",
  },
  {
    step: 5,
    action: "resize",
    value: 2,
    arrayState: [5, 3, 7, 1, 2, null, null, null],
    capacity: 8,
    activeIndex: 4,
    highlightLines: [9, 10, 11, 12],
    description: "Push 2 - capacity reached, resize to 8",
  },
  {
    step: 6,
    action: "push",
    value: 9,
    arrayState: [5, 3, 7, 1, 2, 9, null, null],
    capacity: 8,
    activeIndex: 5,
    highlightLines: [5, 6],
    description: "Push 9 - insert after resize",
  },
  {
    step: 7,
    action: "pop",
    arrayState: [5, 3, 7, 1, 2, null, null, null],
    capacity: 8,
    activeIndex: 5,
    highlightLines: [15, 16],
    description: "Pop - remove last element",
  },
];

export default function DynamicArrayChapter() {
  const { arrays, setArrayData } = useVisualizer();
  const { currentStep, setTotalSteps } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  const step = algorithmSteps[currentStep] || algorithmSteps[0];

  useEffect(() => {
    setTotalSteps(algorithmSteps.length);
  }, [setTotalSteps]);

  useEffect(() => {
    setArrayData("main", {
      elements: step.arrayState,
      capacity: step.capacity,
      isActive: true,
    });
    setActiveLines(step.highlightLines);
  }, [step, setArrayData, setActiveLines]);

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

      {/* Array Visualization */}
      <div className="relative">
        {/* Capacity indicator */}
        <motion.div
          className="absolute -top-8 left-0 text-xs text-muted"
          initial={false}
          animate={{
            color: step.arrayState.filter(Boolean).length === step.capacity ? "#fbbf24" : "#666",
          }}
          transition={{ duration: 0.2 }}
        >
          Capacity: {step.capacity}
        </motion.div>

        <ArrayVisualizer
          id="main"
          elements={step.arrayState}
          capacity={step.capacity}
          activeIndex={step.activeIndex}
          cellSize={60}
          gap={6}
          showIndices={true}
        />

        {/* Size indicator */}
        <motion.div
          className="absolute -bottom-8 left-0 text-xs"
          initial={false}
          animate={{
            color: step.arrayState.filter(Boolean).length === step.capacity ? "#fbbf24" : "#666",
          }}
          transition={{ duration: 0.2 }}
        >
          Size: {step.arrayState.filter(Boolean).length}
          {step.arrayState.filter(Boolean).length === step.capacity && (
            <span className="ml-2 text-yellow-500">Full!</span>
          )}
        </motion.div>
      </div>

      {/* Visual cue for resize */}
      {step.action === "resize" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 rounded border border-yellow-500/50 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-500"
        >
          Array Resized: {step.capacity / 2} → {step.capacity}
        </motion.div>
      )}
    </div>
  );
}

export { algorithmSteps };
export type { AlgorithmStep };
