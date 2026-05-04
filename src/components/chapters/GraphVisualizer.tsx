"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  isActive: boolean;
  isVisited: boolean;
  distance?: number;
}

interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  isActive: boolean;
}

interface AlgorithmStep {
  step: number;
  action: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  activeNode: string | null;
  highlightLines: number[];
  description: string;
}

const initialNodes: GraphNode[] = [
  { id: "A", label: "A", x: 100, y: 100, isActive: false, isVisited: false, distance: Infinity },
  { id: "B", label: "B", x: 250, y: 50, isActive: false, isVisited: false, distance: Infinity },
  { id: "C", label: "C", x: 400, y: 100, isActive: false, isVisited: false, distance: Infinity },
  { id: "D", label: "D", x: 175, y: 200, isActive: false, isVisited: false, distance: Infinity },
  { id: "E", label: "E", x: 325, y: 200, isActive: false, isVisited: false, distance: Infinity },
  { id: "F", label: "F", x: 250, y: 300, isActive: false, isVisited: false, distance: Infinity },
];

const initialEdges: GraphEdge[] = [
  { from: "A", to: "B", weight: 4, isActive: false },
  { from: "A", to: "D", weight: 2, isActive: false },
  { from: "B", to: "C", weight: 3, isActive: false },
  { from: "B", to: "E", weight: 1, isActive: false },
  { from: "C", to: "E", weight: 2, isActive: false },
  { from: "D", to: "E", weight: 3, isActive: false },
  { from: "D", to: "F", weight: 2, isActive: false },
  { from: "E", to: "F", weight: 4, isActive: false },
];

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    nodes: initialNodes.map(n => ({ ...n })),
    edges: initialEdges.map(e => ({ ...e })),
    activeNode: null,
    highlightLines: [1, 2, 3],
    description: "Initialize graph with 6 nodes and weighted edges",
  },
  {
    step: 1,
    action: "bfs",
    nodes: initialNodes.map((n, i) => ({ ...n, isActive: i === 0, isVisited: i === 0, distance: i === 0 ? 0 : Infinity })),
    edges: initialEdges.map(e => ({ ...e, isActive: e.from === "A" })),
    activeNode: "A",
    highlightLines: [5, 6, 7],
    description: "BFS: Start from node A. Mark as visited. Explore neighbors B and D.",
  },
  {
    step: 2,
    action: "bfs",
    nodes: initialNodes.map((n, i) => ({ 
      ...n, 
      isActive: i === 1, 
      isVisited: i <= 1,
      distance: i === 0 ? 0 : i === 1 ? 1 : Infinity
    })),
    edges: initialEdges.map(e => ({ ...e, isActive: e.from === "A" || e.from === "B" })),
    activeNode: "B",
    highlightLines: [8, 9, 10],
    description: "BFS: Visit B (distance 1). Mark as visited. Explore neighbors C and E.",
  },
  {
    step: 3,
    action: "bfs",
    nodes: initialNodes.map((n, i) => ({ 
      ...n, 
      isActive: i === 3, 
      isVisited: i === 0 || i === 1 || i === 3,
      distance: i === 0 ? 0 : i === 1 ? 1 : i === 3 ? 1 : Infinity
    })),
    edges: initialEdges.map(e => ({ ...e, isActive: e.from === "A" || e.from === "B" || e.from === "D" })),
    activeNode: "D",
    highlightLines: [8, 9, 10],
    description: "BFS: Visit D (distance 1). Mark as visited. Explore neighbors E and F.",
  },
  {
    step: 4,
    action: "dfs",
    nodes: initialNodes.map((n, i) => ({ ...n, isActive: i === 0, isVisited: i === 0 })),
    edges: initialEdges.map(e => ({ ...e, isActive: e.from === "A" })),
    activeNode: "A",
    highlightLines: [13, 14, 15],
    description: "DFS: Start from A. Recursively explore neighbors.",
  },
  {
    step: 5,
    action: "dfs",
    nodes: initialNodes.map((n, i) => ({ ...n, isActive: i === 1, isVisited: i === 0 || i === 1 })),
    edges: initialEdges.map((e, i) => ({ ...e, isActive: i <= 2 })),
    activeNode: "B",
    highlightLines: [16, 17, 18],
    description: "DFS: Visit B. Recurse to C.",
  },
  {
    step: 6,
    action: "dfs",
    nodes: initialNodes.map((n, i) => ({ ...n, isActive: i === 2, isVisited: i <= 2 })),
    edges: initialEdges.map((e, i) => ({ ...e, isActive: i <= 4 })),
    activeNode: "C",
    highlightLines: [16, 17, 18],
    description: "DFS: Visit C. No unvisited neighbors. Backtrack to B, then to A.",
  },
  {
    step: 7,
    action: "dijkstra",
    nodes: initialNodes.map((n, i) => ({ 
      ...n, 
      isActive: i === 0, 
      isVisited: i === 0, 
      distance: i === 0 ? 0 : Infinity 
    })),
    edges: initialEdges.map(e => ({ ...e })),
    activeNode: "A",
    highlightLines: [21, 22, 23],
    description: "Dijkstra: Start from A with distance 0. Other nodes have ∞.",
  },
  {
    step: 8,
    action: "dijkstra",
    nodes: initialNodes.map((n, i) => ({ 
      ...n, 
      isActive: i === 3, 
      isVisited: i === 0 || i === 3, 
      distance: i === 0 ? 0 : i === 3 ? 2 : i === 1 ? 4 : Infinity 
    })),
    edges: initialEdges.map((e, i) => ({ ...e, isActive: i === 0 || i === 1 })),
    activeNode: "D",
    highlightLines: [24, 25, 26],
    description: "Dijkstra: Process A. Update distances: B=4, D=2. Pick D (smallest).",
  },
  {
    step: 9,
    action: "dijkstra",
    nodes: initialNodes.map((n, i) => ({ 
      ...n, 
      isActive: i === 4, 
      isVisited: i === 0 || i === 3 || i === 4, 
      distance: i === 0 ? 0 : i === 3 ? 2 : i === 4 ? 5 : i === 1 ? 4 : i === 5 ? 4 : Infinity 
    })),
    edges: initialEdges.map((e, i) => ({ ...e, isActive: i === 0 || i === 1 || i === 5 || i === 6 })),
    activeNode: "E",
    highlightLines: [24, 25, 26],
    description: "Dijkstra: Process D. Update distances: E=5, F=4. Pick B (smallest=4).",
  },
];

export default function GraphVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => {
    setTotalSteps(algorithmSteps.length);
  }, [setTotalSteps]);

  useEffect(() => {
    const step = algorithmSteps[currentStep];
    if (step) {
      setActiveLines(step.highlightLines);
    }
  }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => {
    togglePlay();
  }, [togglePlay]);

  const handleStep = useCallback((direction: "next" | "prev") => {
    if (direction === "next") {
      nextStep();
    } else {
      prevStep();
    }
  }, [nextStep, prevStep]);

  const step = algorithmSteps[currentStep] || algorithmSteps[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Graph Traversal Visualizer</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlay}
            className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => handleStep("prev")}
            className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d] transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => handleStep("next")}
            className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d] transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="flex-1 p-8 relative overflow-hidden">
        {/* Graph SVG */}
        <svg className="w-full h-full" viewBox="0 0 500 350">
          {/* Edges */}
          {step.edges.map((edge, index) => {
            const fromNode = step.nodes.find(n => n.id === edge.from)!;
            const toNode = step.nodes.find(n => n.id === edge.to)!;
            return (
              <g key={index}>
                <motion.line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: 1,
                    stroke: edge.isActive ? "#238636" : "#30363d",
                    strokeWidth: edge.isActive ? 3 : 2
                  }}
                  transition={{ duration: 0.5 }}
                  strokeLinecap="round"
                />
                {/* Weight label */}
                <motion.text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 10}
                  fill={edge.isActive ? "#238636" : "#8b949e"}
                  fontSize="12"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {edge.weight}
                </motion.text>
              </g>
            );
          })}

          {/* Nodes */}
          {step.nodes.map((node, index) => (
            <motion.g
              key={node.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={30}
                animate={{
                  fill: node.isActive 
                    ? "#238636" 
                    : node.isVisited 
                      ? "#1f6feb" 
                      : "#21262d",
                  stroke: node.isActive ? "#3fb950" : "#30363d",
                  strokeWidth: node.isActive ? 3 : 2
                }}
                transition={{ duration: 0.3 }}
              />
              <text
                x={node.x}
                y={node.y}
                dy="5"
                fill="white"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                className="font-mono"
              >
                {node.label}
              </text>
              {/* Distance label for Dijkstra */}
              {node.distance !== undefined && node.distance !== Infinity && (
                <text
                  x={node.x}
                  y={node.y - 45}
                  fill="#58a6ff"
                  fontSize="12"
                  textAnchor="middle"
                  className="font-mono"
                >
                  d: {node.distance}
                </text>
              )}
            </motion.g>
          ))}
        </svg>

        {/* Description */}
        <motion.div
          key={step.step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg"
        >
          <p className="text-white">{step.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#8b949e]">
            <span>Step {currentStep + 1} of {totalSteps || algorithmSteps.length}</span>
            <span>Action: <span className="text-[#58a6ff]">{step.action.toUpperCase()}</span></span>
          </div>
        </motion.div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-[#30363d] flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#238636] rounded-full" />
          <span className="text-[#8b949e]">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#1f6feb] rounded-full" />
          <span className="text-[#8b949e]">Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#21262d] border border-[#30363d] rounded-full" />
          <span className="text-[#8b949e]">Unvisited</span>
        </div>
      </div>
    </div>
  );
}
