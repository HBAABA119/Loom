"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useVisualizer, useTimeline, useCodeHighlight } from "@/lib/engine/store";
import Node from "@/components/visualizers/Node";
import Edge from "@/components/visualizers/Edge";

interface BSTNode {
  id: string;
  value: number;
  left: string | null;
  right: string | null;
  parent: string | null;
  x: number;
  y: number;
}

interface AlgorithmStep {
  step: number;
  action: "init" | "insert" | "search" | "delete" | "traverse";
  nodes: BSTNode[];
  activeNode: string | null;
  comparingNode: string | null;
  highlightLines: number[];
  description: string;
}

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    nodes: [{ id: "root", value: 50, left: null, right: null, parent: null, x: 350, y: 50 }],
    activeNode: "root",
    comparingNode: null,
    highlightLines: [1, 2],
    description: "Initialize BST with root node (50)",
  },
  {
    step: 1,
    action: "insert",
    nodes: [
      { id: "root", value: 50, left: "n30", right: null, parent: null, x: 350, y: 50 },
      { id: "n30", value: 30, left: null, right: null, parent: "root", x: 200, y: 150 },
    ],
    activeNode: "n30",
    comparingNode: "root",
    highlightLines: [5, 6, 7, 8],
    description: "Insert 30: 30 < 50, go left. Add as left child of 50",
  },
  {
    step: 2,
    action: "insert",
    nodes: [
      { id: "root", value: 50, left: "n30", right: "n70", parent: null, x: 350, y: 50 },
      { id: "n30", value: 30, left: null, right: null, parent: "root", x: 200, y: 150 },
      { id: "n70", value: 70, left: null, right: null, parent: "root", x: 500, y: 150 },
    ],
    activeNode: "n70",
    comparingNode: "root",
    highlightLines: [5, 6, 9, 10],
    description: "Insert 70: 70 > 50, go right. Add as right child of 50",
  },
  {
    step: 3,
    action: "insert",
    nodes: [
      { id: "root", value: 50, left: "n30", right: "n70", parent: null, x: 350, y: 50 },
      { id: "n30", value: 30, left: "n20", right: null, parent: "root", x: 200, y: 150 },
      { id: "n70", value: 70, left: null, right: null, parent: "root", x: 500, y: 150 },
      { id: "n20", value: 20, left: null, right: null, parent: "n30", x: 125, y: 250 },
    ],
    activeNode: "n20",
    comparingNode: "n30",
    highlightLines: [5, 6, 7, 8],
    description: "Insert 20: 20 < 50 → 20 < 30, go left. Add as left child of 30",
  },
  {
    step: 4,
    action: "insert",
    nodes: [
      { id: "root", value: 50, left: "n30", right: "n70", parent: null, x: 350, y: 50 },
      { id: "n30", value: 30, left: "n20", right: "n40", parent: "root", x: 200, y: 150 },
      { id: "n70", value: 70, left: null, right: null, parent: "root", x: 500, y: 150 },
      { id: "n20", value: 20, left: null, right: null, parent: "n30", x: 125, y: 250 },
      { id: "n40", value: 40, left: null, right: null, parent: "n30", x: 275, y: 250 },
    ],
    activeNode: "n40",
    comparingNode: "n30",
    highlightLines: [5, 6, 9, 10],
    description: "Insert 40: 40 < 50 → 40 > 30, go right. Add as right child of 30",
  },
  {
    step: 5,
    action: "search",
    nodes: [
      { id: "root", value: 50, left: "n30", right: "n70", parent: null, x: 350, y: 50 },
      { id: "n30", value: 30, left: "n20", right: "n40", parent: "root", x: 200, y: 150 },
      { id: "n70", value: 70, left: null, right: null, parent: "root", x: 500, y: 150 },
      { id: "n20", value: 20, left: null, right: null, parent: "n30", x: 125, y: 250 },
      { id: "n40", value: 40, left: null, right: null, parent: "n30", x: 275, y: 250 },
    ],
    activeNode: "n40",
    comparingNode: "n30",
    highlightLines: [13, 14, 15, 16],
    description: "Search 40: 40 < 50 → 40 > 30 → Found!",
  },
];

export default function BSTVisualizer() {
  const { setNodes, setEdges, resetVisualizer } = useVisualizer();
  const { currentStep, setTotalSteps } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  const step = algorithmSteps[currentStep] || algorithmSteps[0];

  useEffect(() => {
    setTotalSteps(algorithmSteps.length);
    return () => resetVisualizer();
  }, [setTotalSteps, resetVisualizer]);

  useEffect(() => {
    const visualizerNodes = step.nodes.map((node) => ({
      id: node.id,
      x: node.x,
      y: node.y,
      value: node.value,
      isActive: node.id === step.activeNode,
      isHighlighted: node.id === step.comparingNode,
      glowColor: node.id === step.activeNode 
        ? "rgba(100, 255, 150, 0.5)" 
        : "rgba(255, 200, 100, 0.5)",
    }));

    const edges: { id: string; from: string; to: string; isActive: boolean }[] = [];
    step.nodes.forEach((node) => {
      if (node.left) {
        edges.push({
          id: `${node.id}-${node.left}`,
          from: node.id,
          to: node.left,
          isActive: node.id === step.comparingNode || node.left === step.activeNode,
        });
      }
      if (node.right) {
        edges.push({
          id: `${node.id}-${node.right}`,
          from: node.id,
          to: node.right,
          isActive: node.id === step.comparingNode || node.right === step.activeNode,
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

      {/* BST Visualization */}
      <svg width="650" height="350" className="overflow-visible">
        {/* Edges */}
        {step.nodes.map((node) => (
          <g key={node.id}>
            {node.left && (
              <Edge
                id={`${node.id}-${node.left}`}
                x1={node.x}
                y1={node.y + 20}
                x2={step.nodes.find((n) => n.id === node.left)?.x!}
                y2={step.nodes.find((n) => n.id === node.left)?.y! - 20}
                isActive={node.id === step.comparingNode}
                isDirected={false}
                curve={0}
              />
            )}
            {node.right && (
              <Edge
                id={`${node.id}-${node.right}`}
                x1={node.x}
                y1={node.y + 20}
                x2={step.nodes.find((n) => n.id === node.right)?.x!}
                y2={step.nodes.find((n) => n.id === node.right)?.y! - 20}
                isActive={node.id === step.comparingNode}
                isDirected={false}
                curve={0}
              />
            )}
          </g>
        ))}

        {/* Nodes */}
        {step.nodes.map((node) => (
          <Node
            key={node.id}
            id={node.id}
            x={node.x}
            y={node.y}
            value={node.value}
            isActive={node.id === step.activeNode}
            isHighlighted={node.id === step.comparingNode}
            glowColor={
              node.id === step.activeNode
                ? "rgba(100, 255, 150, 0.5)"
                : "rgba(255, 200, 100, 0.5)"
            }
            size={44}
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex gap-6 text-xs text-muted">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-400/50" />
          <span>Current / Found</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-400/50" />
          <span>Comparing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full border border-white/30" />
          <span>Tree Structure</span>
        </div>
      </div>
    </div>
  );
}

export { algorithmSteps };
export type { AlgorithmStep, BSTNode };
