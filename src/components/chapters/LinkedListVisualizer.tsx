"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useVisualizer, useTimeline, useCodeHighlight } from "@/lib/engine/store";
import Node from "@/components/visualizers/Node";
import Edge from "@/components/visualizers/Edge";

interface ListNode {
  id: string;
  value: number;
  next: string | null;
  x: number;
  y: number;
}

interface AlgorithmStep {
  step: number;
  action: string;
  nodes: ListNode[];
  activeNode: string | null;
  highlightLines: number[];
  description: string;
}

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    nodes: [
      { id: "head", value: 10, next: "n2", x: 100, y: 200 },
      { id: "n2", value: 20, next: "n3", x: 220, y: 200 },
      { id: "n3", value: 30, next: null, x: 340, y: 200 },
    ],
    activeNode: null,
    highlightLines: [1, 2, 3],
    description: "Initialize linked list with 3 nodes: 10 → 20 → 30",
  },
  {
    step: 1,
    action: "traverse",
    nodes: [
      { id: "head", value: 10, next: "n2", x: 100, y: 200 },
      { id: "n2", value: 20, next: "n3", x: 220, y: 200 },
      { id: "n3", value: 30, next: null, x: 340, y: 200 },
    ],
    activeNode: "head",
    highlightLines: [6, 7],
    description: "Traverse: Start at head node (value: 10)",
  },
  {
    step: 2,
    action: "traverse",
    nodes: [
      { id: "head", value: 10, next: "n2", x: 100, y: 200 },
      { id: "n2", value: 20, next: "n3", x: 220, y: 200 },
      { id: "n3", value: 30, next: null, x: 340, y: 200 },
    ],
    activeNode: "n2",
    highlightLines: [6, 7],
    description: "Traverse: Move to next node (value: 20)",
  },
  {
    step: 3,
    action: "traverse",
    nodes: [
      { id: "head", value: 10, next: "n2", x: 100, y: 200 },
      { id: "n2", value: 20, next: "n3", x: 220, y: 200 },
      { id: "n3", value: 30, next: null, x: 340, y: 200 },
    ],
    activeNode: "n3",
    highlightLines: [6, 7],
    description: "Traverse: At tail node (value: 30), next is null",
  },
  {
    step: 4,
    action: "insert",
    nodes: [
      { id: "head", value: 10, next: "n2", x: 100, y: 200 },
      { id: "n2", value: 20, next: "n3", x: 220, y: 200 },
      { id: "n3", value: 30, next: "n4", x: 340, y: 200 },
      { id: "n4", value: 40, next: null, x: 460, y: 200 },
    ],
    activeNode: "n4",
    highlightLines: [10, 11, 12],
    description: "Insert: Append 40 at tail. List is now 10 → 20 → 30 → 40",
  },
  {
    step: 5,
    action: "insert-head",
    nodes: [
      { id: "newHead", value: 5, next: "head", x: 100, y: 200 },
      { id: "head", value: 10, next: "n2", x: 220, y: 200 },
      { id: "n2", value: 20, next: "n3", x: 340, y: 200 },
      { id: "n3", value: 30, next: "n4", x: 460, y: 200 },
      { id: "n4", value: 40, next: null, x: 580, y: 200 },
    ],
    activeNode: "newHead",
    highlightLines: [15, 16, 17],
    description: "Insert at head: Prepend 5. List is now 5 → 10 → 20 → 30 → 40",
  },
  {
    step: 6,
    action: "delete",
    nodes: [
      { id: "newHead", value: 5, next: "n2", x: 100, y: 200 },
      { id: "n2", value: 20, next: "n3", x: 220, y: 200 },
      { id: "n3", value: 30, next: "n4", x: 340, y: 200 },
      { id: "n4", value: 40, next: null, x: 460, y: 200 },
    ],
    activeNode: "head",
    highlightLines: [20, 21, 22],
    description: "Delete: Remove node with value 10. List is now 5 → 20 → 30 → 40",
  },
];

export default function LinkedListVisualizer() {
  const { setNodes, setEdges, resetVisualizer } = useVisualizer();
  const { currentStep, setTotalSteps } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  const step = algorithmSteps[currentStep] || algorithmSteps[0];

  useEffect(() => {
    setTotalSteps(algorithmSteps.length);
    return () => resetVisualizer();
  }, [setTotalSteps, resetVisualizer]);

  useEffect(() => {
    // Convert list nodes to visualizer nodes
    const visualizerNodes = step.nodes.map((node) => ({
      id: node.id,
      x: node.x,
      y: node.y,
      value: node.value,
      isActive: node.id === step.activeNode,
      isHighlighted: node.id === step.activeNode,
      glowColor: "rgba(100, 200, 255, 0.5)",
    }));

    // Create edges from next pointers
    const edges: { id: string; from: string; to: string; isActive: boolean }[] = [];
    step.nodes.forEach((node) => {
      if (node.next) {
        edges.push({
          id: `${node.id}-${node.next}`,
          from: node.id,
          to: node.next,
          isActive: node.id === step.activeNode,
        });
      }
    });

    setNodes(visualizerNodes);
    setEdges(edges);
    setActiveLines(step.highlightLines);
  }, [step, setNodes, setEdges, setActiveLines]);

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

      {/* Linked List Visualization */}
      <svg width="700" height="300" className="overflow-visible">
        {/* Edges */}
        {step.nodes.map((node) =>
          node.next ? (
            <Edge
              key={`${node.id}-${node.next}`}
              id={`${node.id}-${node.next}`}
              x1={node.x + 20}
              y1={node.y}
              x2={step.nodes.find((n) => n.id === node.next)?.x! - 20}
              y2={step.nodes.find((n) => n.id === node.next)?.y!}
              isActive={node.id === step.activeNode}
              isDirected={true}
              curve={0}
            />
          ) : null
        )}

        {/* Nodes */}
        {step.nodes.map((node) => (
          <Node
            key={node.id}
            id={node.id}
            x={node.x}
            y={node.y}
            value={node.value}
            isActive={node.id === step.activeNode}
            isHighlighted={node.id === step.activeNode}
            glowColor="rgba(100, 200, 255, 0.5)"
            size={40}
          />
        ))}
      </svg>

      {/* Head pointer label */}
      <div className="mt-8 flex items-center gap-4 text-xs text-muted">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500/50" />
          <span>Head Pointer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 bg-white" />
          <span>Next Pointer</span>
        </div>
      </div>
    </div>
  );
}

export { algorithmSteps };
export type { AlgorithmStep, ListNode };
