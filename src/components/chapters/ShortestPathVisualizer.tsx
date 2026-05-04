"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  dist: number;
  isActive: boolean;
  isVisited: boolean;
  isPath: boolean;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
  isActive: boolean;
  isPath: boolean;
}

interface AlgorithmStep {
  step: number;
  action: string;
  nodes: GraphNode[];
  edges: Edge[];
  currentNode: string | null;
  highlightLines: number[];
  description: string;
}

const initialNodes: GraphNode[] = [
  { id: "A", label: "A", x: 50, y: 150, dist: 0, isActive: true, isVisited: false, isPath: false },
  { id: "B", label: "B", x: 200, y: 80, dist: Infinity, isActive: false, isVisited: false, isPath: false },
  { id: "C", label: "C", x: 200, y: 220, dist: Infinity, isActive: false, isVisited: false, isPath: false },
  { id: "D", label: "D", x: 350, y: 80, dist: Infinity, isActive: false, isVisited: false, isPath: false },
  { id: "E", label: "E", x: 350, y: 220, dist: Infinity, isActive: false, isVisited: false, isPath: false },
  { id: "F", label: "F", x: 500, y: 150, dist: Infinity, isActive: false, isVisited: false, isPath: false },
];

const initialEdges: Edge[] = [
  { from: "A", to: "B", weight: 4, isActive: false, isPath: false },
  { from: "A", to: "C", weight: 2, isActive: false, isPath: false },
  { from: "B", to: "D", weight: 5, isActive: false, isPath: false },
  { from: "C", to: "B", weight: 1, isActive: false, isPath: false },
  { from: "C", to: "E", weight: 3, isActive: false, isPath: false },
  { from: "D", to: "F", weight: 3, isActive: false, isPath: false },
  { from: "E", to: "F", weight: 2, isActive: false, isPath: false },
  { from: "E", to: "D", weight: 2, isActive: false, isPath: false },
];

const algorithmSteps: AlgorithmStep[] = [
  {
    step: 0,
    action: "init",
    nodes: initialNodes.map(n => ({ ...n })),
    edges: initialEdges.map(e => ({ ...e })),
    currentNode: "A",
    highlightLines: [1, 2, 3],
    description: "Dijkstra's Algorithm: Find shortest path from A to F. Initialize distances: A=0, others=∞.",
  },
  {
    step: 1,
    action: "visit",
    nodes: initialNodes.map(n => ({ 
      ...n, 
      dist: n.id === "A" ? 0 : n.id === "B" ? 4 : n.id === "C" ? 2 : Infinity,
      isActive: n.id === "A",
      isVisited: n.id === "A"
    })),
    edges: initialEdges.map(e => ({ 
      ...e, 
      isActive: e.from === "A" 
    })),
    currentNode: "A",
    highlightLines: [4, 5, 6],
    description: "Visit A. Update neighbors: B=4 (via A), C=2 (via A). Mark A as visited.",
  },
  {
    step: 2,
    action: "select",
    nodes: initialNodes.map(n => ({ 
      ...n, 
      dist: n.id === "A" ? 0 : n.id === "B" ? 4 : n.id === "C" ? 2 : Infinity,
      isActive: n.id === "C",
      isVisited: n.id === "A"
    })),
    edges: initialEdges.map(e => ({ ...e, isActive: false })),
    currentNode: "C",
    highlightLines: [7, 8],
    description: "Select unvisited node with min distance: C (dist=2).",
  },
  {
    step: 3,
    action: "visit",
    nodes: initialNodes.map(n => ({ 
      ...n, 
      dist: n.id === "A" ? 0 : n.id === "B" ? 3 : n.id === "C" ? 2 : n.id === "E" ? 5 : Infinity,
      isActive: n.id === "C",
      isVisited: n.id === "A" || n.id === "C"
    })),
    edges: initialEdges.map(e => ({ 
      ...e, 
      isActive: e.from === "C",
      isPath: (e.from === "A" && e.to === "C") || (e.from === "C" && e.to === "B")
    })),
    currentNode: "C",
    highlightLines: [9, 10, 11],
    description: "Visit C. Update: B=3 (better via C!), E=5. Mark C visited.",
  },
  {
    step: 4,
    action: "select",
    nodes: initialNodes.map(n => ({ 
      ...n, 
      dist: n.id === "A" ? 0 : n.id === "B" ? 3 : n.id === "C" ? 2 : n.id === "E" ? 5 : Infinity,
      isActive: n.id === "B",
      isVisited: n.id === "A" || n.id === "C"
    })),
    edges: initialEdges.map(e => ({ ...e, isActive: false })),
    currentNode: "B",
    highlightLines: [7, 8],
    description: "Select unvisited node with min distance: B (dist=3).",
  },
  {
    step: 5,
    action: "visit",
    nodes: initialNodes.map(n => ({ 
      ...n, 
      dist: n.id === "A" ? 0 : n.id === "B" ? 3 : n.id === "C" ? 2 : n.id === "D" ? 8 : n.id === "E" ? 5 : Infinity,
      isActive: n.id === "B",
      isVisited: n.id === "A" || n.id === "B" || n.id === "C"
    })),
    edges: initialEdges.map(e => ({ 
      ...e, 
      isActive: e.from === "B",
      isPath: (e.from === "A" && e.to === "C") || (e.from === "C" && e.to === "B") || (e.from === "B" && e.to === "D")
    })),
    currentNode: "B",
    highlightLines: [9, 10, 11],
    description: "Visit B. Update: D=8 (3+5). Mark B visited.",
  },
  {
    step: 6,
    action: "select",
    nodes: initialNodes.map(n => ({ 
      ...n, 
      dist: n.id === "A" ? 0 : n.id === "B" ? 3 : n.id === "C" ? 2 : n.id === "D" ? 7 : n.id === "E" ? 5 : n.id === "F" ? 7 : Infinity,
      isActive: n.id === "E",
      isVisited: n.id === "A" || n.id === "B" || n.id === "C" || n.id === "E"
    })),
    edges: initialEdges.map(e => ({ 
      ...e, 
      isActive: false,
      isPath: (e.from === "A" && e.to === "C") || (e.from === "C" && e.to === "B") || (e.from === "C" && e.to === "E") || (e.from === "E" && e.to === "D") || (e.from === "E" && e.to === "F")
    })),
    currentNode: "E",
    highlightLines: [7, 8, 9, 10, 11],
    description: "Visit E: Update D=7 (better!), F=7. Path A→C→E→F has distance 7.",
  },
  {
    step: 7,
    action: "found",
    nodes: initialNodes.map(n => ({ 
      ...n, 
      dist: n.id === "A" ? 0 : n.id === "B" ? 3 : n.id === "C" ? 2 : n.id === "D" ? 7 : n.id === "E" ? 5 : n.id === "F" ? 7 : Infinity,
      isActive: n.id === "F",
      isPath: n.id === "A" || n.id === "C" || n.id === "E" || n.id === "F"
    })),
    edges: initialEdges.map(e => ({ 
      ...e, 
      isPath: (e.from === "A" && e.to === "C") || (e.from === "C" && e.to === "E") || (e.from === "E" && e.to === "F")
    })),
    currentNode: "F",
    highlightLines: [12, 13],
    description: "Shortest path found! A → C → E → F with total distance 7.",
  },
];

export default function ShortestPathVisualizer() {
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
    if (direction === "next") nextStep();
    else prevStep();
  }, [nextStep, prevStep]);

  const step = algorithmSteps[currentStep] || algorithmSteps[0];

  const getNodePos = (id: string) => step.nodes.find(n => n.id === id);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Shortest Path (Dijkstra) Visualizer</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Previous</button>
          <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 550 300">
          {/* Edges */}
          {step.edges.map((edge) => {
            const from = getNodePos(edge.from);
            const to = getNodePos(edge.to);
            if (!from || !to) return null;
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <motion.line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={edge.isPath ? "#238636" : edge.isActive ? "#58a6ff" : "#30363d"}
                  strokeWidth={edge.isPath ? 4 : edge.isActive ? 3 : 2}
                  animate={{ pathLength: 1 }}
                />
                {/* Weight label */}
                <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8} fill="#8b949e" fontSize="12" textAnchor="middle" className="font-mono bg-[#0d1117]">
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {step.nodes.map((node) => (
            <motion.g key={node.id}>
              <motion.circle
                cx={node.x} cy={node.y} r={25}
                animate={{
                  fill: node.isPath ? "#238636" : node.isActive ? "#8957e5" : node.isVisited ? "#21262d" : "#161b22",
                  stroke: node.isPath ? "#3fb950" : node.isActive ? "#a371f7" : "#30363d",
                  strokeWidth: node.isActive || node.isPath ? 3 : 2
                }}
              />
              <text x={node.x} y={node.y - 5} fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">{node.label}</text>
              <text x={node.x} y={node.y + 12} fill="#8b949e" fontSize="10" textAnchor="middle" className="font-mono">
                {node.dist === Infinity ? "∞" : node.dist}
              </text>
            </motion.g>
          ))}
        </svg>

        <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <p className="text-white">{step.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#8b949e]">
            <span>Step {currentStep + 1} of {totalSteps || algorithmSteps.length}</span>
            <span>Action: <span className="text-[#58a6ff]">{step.action.toUpperCase()}</span></span>
          </div>
        </motion.div>
      </div>

      <div className="p-4 border-t border-[#30363d] flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#238636] rounded-full" /><span className="text-[#8b949e]">Path</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#8957e5] rounded-full" /><span className="text-[#8b949e]">Current</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#21262d] border border-[#30363d] rounded-full" /><span className="text-[#8b949e]">Visited</span></div>
      </div>
    </div>
  );
}
