"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  ChevronLeft, ChevronRight, Network
} from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Node {
  id: string;
  x: number;
  y: number;
  isVisited?: boolean;
  isCurrent?: boolean;
  isQueued?: boolean;
}

interface Edge {
  from: string;
  to: string;
}

interface Step {
  step: number;
  title: string;
  description: string;
  codeLines: number[];
  nodes: Node[];
  visited: string[];
  queue: string[];
  stack: string[];
  current: string | null;
  operation: "init" | "visit" | "enqueue" | "dequeue" | "push" | "pop" | "neighbors";
  explanation: string;
  theoryConnection: string;
  complexity: string;
}

const speeds = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
];

const codeLines = [
  "// Breadth-First Search (BFS)",
  "function bfs(graph, start) {",
  "  const visited = new Set();",
  "  const queue = [start];  // Queue for BFS",
  "  const result = [];",
  "",
  "  while (queue.length > 0) {",
  "    const node = queue.shift();  // Dequeue front",
  "",
  "    if (!visited.has(node)) {",
  "      visited.add(node);  // Mark visited",
  "      result.push(node);  // Process node",
  "",
  "      // Add unvisited neighbors to queue",
  "      for (const neighbor of graph[node]) {",
  "        if (!visited.has(neighbor)) {",
  "          queue.push(neighbor);",
  "        }",
  "      }",
  "    }",
  "  }",
  "",
  "  return result;",
  "}",
  "",
  "// Depth-First Search (DFS)",
  "function dfs(graph, start) {",
  "  const visited = new Set();",
  "  const stack = [start];  // Stack for DFS",
  "  const result = [];",
  "",
  "  while (stack.length > 0) {",
  "    const node = stack.pop();  // Pop from stack",
  "",
  "    if (!visited.has(node)) {",
  "      visited.add(node);  // Mark visited",
  "      result.push(node);  // Process node",
  "",
  "      // Add unvisited neighbors to stack",
  "      for (const neighbor of graph[node]) {",
  "        if (!visited.has(neighbor)) {",
  "          stack.push(neighbor);",
  "        }",
  "      }",
  "    }",
  "  }",
  "",
  "  return result;",
  "}",
];

// Graph data
const graphNodes: Node[] = [
  { id: "A", x: 150, y: 100 },
  { id: "B", x: 300, y: 50 },
  { id: "C", x: 450, y: 100 },
  { id: "D", x: 150, y: 200 },
  { id: "E", x: 300, y: 200 },
  { id: "F", x: 450, y: 200 },
];

const edges: Edge[] = [
  { from: "A", to: "B" },
  { from: "A", to: "D" },
  { from: "B", to: "C" },
  { from: "B", to: "E" },
  { from: "C", to: "F" },
  { from: "D", to: "E" },
  { from: "E", to: "F" },
];

const adjacencyList: Record<string, string[]> = {
  A: ["B", "D"],
  B: ["A", "C", "E"],
  C: ["B", "F"],
  D: ["A", "E"],
  E: ["B", "D", "F"],
  F: ["C", "E"],
};

const generateSteps = (): Step[] => [
  {
    step: 0,
    title: "Graph Traversal: BFS vs DFS",
    description: "Graph traversal algorithms visit all nodes in a graph. BFS uses a queue (level-order), DFS uses a stack (depth-first).",
    codeLines: [1, 2, 3, 4, 5],
    nodes: graphNodes,
    visited: [],
    queue: [],
    stack: [],
    current: null,
    operation: "init",
    explanation: "We have an undirected graph with 6 nodes (A-F). We'll demonstrate BFS starting from node A. BFS explores neighbors level by level, like ripples in a pond.",
    theoryConnection: "Graphs model relationships: social networks (friends), maps (cities connected by roads), web pages (links). Traversal is fundamental for finding paths, connected components, and cycles.",
    complexity: "BFS/DFS Time: O(V + E) - visit every vertex and edge. Space: O(V) for visited set and queue/stack."
  },
  {
    step: 1,
    title: "BFS: Initialize Queue with Start Node",
    description: "Start BFS from node A. Add A to the queue.",
    codeLines: [4, 7, 8],
    nodes: graphNodes.map(n => ({ ...n, isQueued: n.id === "A" })),
    visited: [],
    queue: ["A"],
    stack: [],
    current: null,
    operation: "enqueue",
    explanation: "BFS starts at node A. Queue = [A]. Visited = {}. We use a queue because we want First-In-First-Out order - explore oldest discovered nodes first.",
    theoryConnection: "The queue ensures we explore nodes in order of their distance from start. All nodes at distance d are visited before nodes at distance d+1.",
    complexity: "Queue operations: O(1) enqueue/dequeue"
  },
  {
    step: 2,
    title: "BFS: Dequeue A and Visit",
    description: "Remove A from queue, mark as visited, add to result.",
    codeLines: [8, 10, 11],
    nodes: graphNodes.map(n => ({ 
      ...n, 
      isCurrent: n.id === "A",
      isVisited: n.id === "A"
    })),
    visited: ["A"],
    queue: [],
    stack: [],
    current: "A",
    operation: "dequeue",
    explanation: "Dequeue A. Mark A as visited. Add A to result: [A]. Now we explore A's neighbors (B and D).",
    theoryConnection: "Visiting a node means processing it (e.g., printing, collecting data). Once visited, we don't process it again to avoid infinite loops in cyclic graphs.",
    complexity: "Visiting node: O(degree) to check neighbors"
  },
  {
    step: 3,
    title: "BFS: Enqueue Neighbors B and D",
    description: "A's neighbors B and D are unvisited, so add them to queue.",
    codeLines: [14, 15, 16, 17],
    nodes: graphNodes.map(n => ({ 
      ...n, 
      isVisited: n.id === "A",
      isQueued: n.id === "B" || n.id === "D"
    })),
    visited: ["A"],
    queue: ["B", "D"],
    stack: [],
    current: null,
    operation: "enqueue",
    explanation: "A's neighbors: B, D. Both unvisited, so enqueue them. Queue = [B, D]. Notice B before D - B will be processed before D (FIFO order).",
    theoryConnection: "BFS explores in breadth-first manner. A's direct neighbors (distance 1) are queued before their neighbors (distance 2). This gives shortest paths in unweighted graphs.",
    complexity: "Adding neighbors: O(degree(A)) = 2 operations"
  },
  {
    step: 4,
    title: "BFS: Dequeue B, Visit B",
    description: "Remove B from front of queue, mark as visited.",
    codeLines: [8, 10, 11],
    nodes: graphNodes.map(n => ({ 
      ...n, 
      isVisited: n.id === "A" || n.id === "B",
      isCurrent: n.id === "B"
    })),
    visited: ["A", "B"],
    queue: ["D"],
    stack: [],
    current: "B",
    operation: "dequeue",
    explanation: "Dequeue B (front of queue). Mark B as visited. Result: [A, B]. B's neighbors: A (visited), C (unvisited), E (unvisited). A is already visited.",
    theoryConnection: "We check visited before adding to queue. This prevents duplicates in queue and ensures each node is visited once. Essential for efficiency.",
    complexity: "Checking visited: O(1) with hash set"
  },
  {
    step: 5,
    title: "BFS: Enqueue C and E",
    description: "B's unvisited neighbors C and E are added to queue.",
    codeLines: [14, 15, 16, 17],
    nodes: graphNodes.map(n => ({ 
      ...n, 
      isVisited: n.id === "A" || n.id === "B",
      isQueued: n.id === "D" || n.id === "C" || n.id === "E"
    })),
    visited: ["A", "B"],
    queue: ["D", "C", "E"],
    stack: [],
    current: null,
    operation: "enqueue",
    explanation: "Enqueue C and E. Queue = [D, C, E]. D was already in queue from A. Now D, C, E are all at distance 2 from A (B's level).",
    theoryConnection: "BFS naturally finds shortest paths. The order A → B → D → C → E shows nodes in increasing distance from A. Useful for navigation, network routing.",
    complexity: "Queue now has 3 nodes"
  },
  {
    step: 6,
    title: "BFS: Continue Traversal",
    description: "Process D, then C, then E. Each adds their unvisited neighbors.",
    codeLines: [7, 8, 10, 11, 14, 15, 16, 17],
    nodes: graphNodes.map(n => ({ 
      ...n, 
      isVisited: ["A", "B", "D", "C", "E"].includes(n.id),
      isCurrent: n.id === "E"
    })),
    visited: ["A", "B", "D", "C", "E"],
    queue: ["F"],
    stack: [],
    current: "E",
    operation: "dequeue",
    explanation: "Process D (adds E, already queued), then C (adds F), then E (adds F, already queued). Queue = [F]. Only F remains unvisited.",
    theoryConnection: "Notice E connects to F but F was already queued by C. This is fine - we'll check visited status when dequeuing F.",
    complexity: "Each edge examined twice (once from each endpoint)"
  },
  {
    step: 7,
    title: "BFS: Visit F, Complete Traversal",
    description: "Dequeue F, mark as visited. No unvisited neighbors.",
    codeLines: [8, 10, 11, 20],
    nodes: graphNodes.map(n => ({ 
      ...n, 
      isVisited: true,
      isCurrent: n.id === "F"
    })),
    visited: ["A", "B", "D", "C", "E", "F"],
    queue: [],
    stack: [],
    current: "F",
    operation: "dequeue",
    explanation: "Dequeue F. Mark F as visited. F's neighbors C and E are already visited. Queue is now empty! BFS complete. Result: [A, B, D, C, E, F].",
    theoryConnection: "BFS traversal order: A → B → D → C → E → F. All nodes at distance 1 (B, D) before distance 2 (C, E), before distance 3 (F).",
    complexity: "BFS Complete! Visited 6 nodes, 7 edges."
  },
  {
    step: 8,
    title: "DFS: Different Traversal Order",
    description: "DFS uses a stack instead of queue. Last-In-First-Out gives depth-first behavior.",
    codeLines: [24, 25, 26, 27],
    nodes: graphNodes.map(n => ({ 
      ...n, 
      isQueued: n.id === "A"
    })),
    visited: [],
    queue: [],
    stack: ["A"],
    current: null,
    operation: "push",
    explanation: "DFS starts with A on stack. Stack = [A]. DFS goes deep before going wide. It explores one branch fully before backtracking.",
    theoryConnection: "Stack gives LIFO order. Most recently discovered node is processed next. This creates the 'deep dive' characteristic of DFS.",
    complexity: "DFS has same complexity as BFS: O(V + E)"
  },
  {
    step: 9,
    title: "DFS: Pop A, Push Neighbors",
    description: "Pop A, then push neighbors B and D onto stack.",
    codeLines: [29, 30, 31, 32, 33, 34, 35, 36],
    nodes: graphNodes.map(n => ({ 
      ...n, 
      isVisited: n.id === "A",
      isQueued: n.id === "B" || n.id === "D"
    })),
    visited: ["A"],
    queue: [],
    stack: ["B", "D"],
    current: "A",
    operation: "push",
    explanation: "Pop A, mark visited. Push B, then D. Stack = [B, D] (D on top). D was pushed last, so D will be processed before B! This is key difference from BFS.",
    theoryConnection: "Push order matters! If we push B then D, D is on top. Some implementations push in reverse order to get desired traversal direction.",
    complexity: "Stack depth can go up to V in worst case"
  },
  {
    step: 10,
    title: "DFS: Go Deep with D",
    description: "Pop D (top), push its neighbors. Going deeper!",
    codeLines: [29, 30, 31, 32, 33, 34, 35, 36],
    nodes: graphNodes.map(n => ({ 
      ...n, 
      isVisited: ["A", "D"].includes(n.id),
      isCurrent: n.id === "D",
      isQueued: n.id === "B" || n.id === "E"
    })),
    visited: ["A", "D"],
    queue: [],
    stack: ["B", "E"],
    current: "D",
    operation: "push",
    explanation: "Pop D. D's neighbors: A (visited), E (unvisited). Push E. Stack = [B, E]. E is now on top. We're going A → D → E deep into one branch.",
    theoryConnection: "DFS explores one path as far as possible before backtracking. A → D → E → F will be explored before going back to B. Good for maze solving, topological sort.",
    complexity: "DFS can use less memory for wide graphs - only need to store one path"
  },
  {
    step: 11,
    title: "DFS: Complete the Path A-D-E-F",
    description: "Continue popping and pushing until reaching F.",
    codeLines: [29, 30, 31, 32, 33, 34, 35, 36],
    nodes: graphNodes.map(n => ({ 
      ...n, 
      isVisited: ["A", "D", "E", "F"].includes(n.id),
      isCurrent: n.id === "F"
    })),
    visited: ["A", "D", "E", "F"],
    queue: [],
    stack: ["B", "C"],
    current: "F",
    operation: "push",
    explanation: "Pop E (push F), pop F (no unvisited neighbors). Now we backtrack! Stack = [B, C]. After reaching dead end at F, we continue with remaining stack items.",
    theoryConnection: "Backtracking is natural in DFS. When we hit a dead end (no unvisited neighbors), the stack automatically takes us back to explore other branches.",
    complexity: "DFS result so far: [A, D, E, F] - different from BFS!"
  },
  {
    step: 12,
    title: "DFS: Finish Remaining Nodes",
    description: "Process C and B from the stack.",
    codeLines: [29, 30, 31, 32, 20],
    nodes: graphNodes.map(n => ({ 
      ...n, 
      isVisited: true,
      isCurrent: n.id === "B"
    })),
    visited: ["A", "D", "E", "F", "C", "B"],
    queue: [],
    stack: [],
    current: "B",
    operation: "pop",
    explanation: "Pop C (no unvisited neighbors), pop B (neighbors already visited). Stack empty! DFS complete. Result: [A, D, E, F, C, B]. Compare to BFS: [A, B, D, C, E, F].",
    theoryConnection: "Different orders for different use cases: BFS for shortest path, DFS for topological sort, cycle detection, connected components. Both are fundamental graph algorithms.",
    complexity: "Both BFS and DFS: O(V + E) time, O(V) space"
  },
];

export default function GraphTraversalVisualizerEnhanced() {
  const { 
    currentStep: stepIndex, 
    totalSteps, 
    isPlaying, 
    playbackSpeed,
    togglePlay, 
    pause,
    setStep, 
    nextStep, 
    prevStep,
    setTotalSteps,
    setPlaybackSpeed
  } = useTimeline();
  
  const { setActiveLines } = useCodeHighlight();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setTotalSteps(generateSteps().length);
  }, [setTotalSteps]);

  useEffect(() => {
    setCurrentStep(stepIndex);
  }, [stepIndex]);

  const steps = generateSteps();
  const step = steps[currentStep] || steps[0];

  useEffect(() => {
    if (step?.codeLines) {
      setActiveLines(step.codeLines);
    }
  }, [step]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        nextStep();
      }, 2500 / playbackSpeed);
    } else if (currentStep >= steps.length - 1 && isPlaying) {
      pause();
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, playbackSpeed, nextStep, pause]);

  const handleReset = useCallback(() => {
    pause();
    setStep(0);
  }, [pause, setStep]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div>
          <h3 className="text-white font-semibold text-lg">Graph Traversal: BFS & DFS</h3>
          <p className="text-[#8b949e] text-sm">Queue for BFS (level-order) | Stack for DFS (depth-first)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <Network size={14} className="text-[#58a6ff]" />
            <span className="text-[#8b949e] text-xs">Visited:</span>
            <span className="text-[#3fb950] font-bold">{step.visited.length}/6</span>
          </div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full">
            <div 
              className="h-full bg-[#58a6ff] rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visualization */}
        <div className="flex-1 flex flex-col p-6">
          {/* Graph Display */}
          <div className="flex-1 relative">
            <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
              {/* Edges */}
              {edges.map((edge, i) => {
                const fromNode = step.nodes.find(n => n.id === edge.from);
                const toNode = step.nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;
                
                const isVisitedEdge = step.visited.includes(edge.from) && step.visited.includes(edge.to);
                
                return (
                  <line
                    key={i}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isVisitedEdge ? "#238636" : "#30363d"}
                    strokeWidth={isVisitedEdge ? "3" : "2"}
                    className="transition-all"
                  />
                );
              })}
              
              {/* Nodes */}
              {step.nodes.map((node) => (
                <motion.g key={node.id} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={25}
                    className={`transition-all ${
                      node.isCurrent
                        ? "fill-[#f0883e] stroke-[#f0883e]"
                        : node.isVisited
                        ? "fill-[#3fb950] stroke-[#3fb950]"
                        : node.isQueued
                        ? "fill-[#58a6ff] stroke-[#58a6ff]"
                        : "fill-[#21262d] stroke-[#30363d]"
                    }`}
                    strokeWidth="3"
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`font-bold text-lg pointer-events-none ${
                      node.isCurrent || node.isVisited || node.isQueued ? "fill-white" : "fill-[#c9d1d9]"
                    }`}
                  >
                    {node.id}
                  </text>
                </motion.g>
              ))}
            </svg>
          </div>

          {/* Data Structures Display */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            {/* Queue */}
            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#8b949e] text-sm">Queue (BFS):</span>
                <span className="text-[#58a6ff] text-xs">FIFO</span>
              </div>
              <div className="flex gap-2">
                {step.queue.length === 0 ? (
                  <span className="text-[#6e7681] text-sm italic">Empty</span>
                ) : (
                  step.queue.map((id, i) => (
                    <div key={i} className="w-10 h-10 bg-[#58a6ff]/20 border border-[#58a6ff] rounded-lg flex items-center justify-center font-bold text-[#58a6ff]">
                      {id}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stack */}
            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#8b949e] text-sm">Stack (DFS):</span>
                <span className="text-[#f0883e] text-xs">LIFO</span>
              </div>
              <div className="flex gap-2">
                {step.stack.length === 0 ? (
                  <span className="text-[#6e7681] text-sm italic">Empty</span>
                ) : (
                  step.stack.map((id, i) => (
                    <div key={i} className="w-10 h-10 bg-[#f0883e]/20 border border-[#f0883e] rounded-lg flex items-center justify-center font-bold text-[#f0883e]">
                      {id}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Visited Order */}
          <div className="mt-4 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg">
            <span className="text-[#3fb950] text-sm">Visit Order: </span>
            <span className="text-white font-mono">{step.visited.join(" → ") || "-"}</span>
          </div>

          {/* Legend */}
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#f0883e]" />
              <span className="text-[#8b949e]">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#3fb950]" />
              <span className="text-[#8b949e]">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#58a6ff]" />
              <span className="text-[#8b949e]">In Queue/Stack</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-5 border-b border-[#30363d]">
            <span className="text-[#58a6ff] text-xs font-mono uppercase tracking-wider">
              Step {currentStep + 1}: {step.title}
            </span>
            <p className="text-[#c9d1d9] mt-3 leading-relaxed">{step.description}</p>
          </div>

          <div className="p-5 border-b border-[#30363d] flex-1 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">What's Happening</h4>
            <p className="text-[#c9d1d9] text-sm leading-relaxed mb-4">{step.explanation}</p>
            
            <div className="mt-4 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg">
              <h4 className="text-[#3fb950] text-xs uppercase tracking-wider mb-1">💡 Theory Connection</h4>
              <p className="text-[#c9d1d9] text-sm leading-relaxed">{step.theoryConnection}</p>
            </div>

            <div className="mt-4 p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg">
              <h4 className="text-[#58a6ff] text-xs uppercase tracking-wider mb-1">⏱️ Complexity</h4>
              <p className="text-[#c9d1d9] text-sm font-mono">{step.complexity}</p>
            </div>
          </div>

          <div className="p-4 bg-[#0d1117] max-h-56 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">Code Reference</h4>
            <div className="text-xs font-mono">
              {codeLines.map((line, i) => (
                <div 
                  key={i}
                  className={`px-2 py-0.5 rounded ${
                    step.codeLines?.includes(i + 1)
                      ? "bg-[#238636]/30 text-[#7ee787] border-l-2 border-[#238636]"
                      : "text-[#8b949e]"
                  }`}
                >
                  <span className="text-[#6e7681] w-6 inline-block select-none">{i + 1}</span>
                  {line || " "}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => { pause(); setStep(0); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <SkipBack size={18} />
            </button>
            <button onClick={prevStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <ChevronLeft size={20} />
            </button>
            
            <button onClick={togglePlay} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center gap-2">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            
            <button onClick={nextStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <ChevronRight size={20} />
            </button>
            <button onClick={() => { pause(); setStep(steps.length - 1); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <SkipForward size={18} />
            </button>
            <button onClick={handleReset} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#8b949e] text-sm">Speed:</span>
            <div className="flex gap-1">
              {speeds.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setPlaybackSpeed(s.value)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    playbackSpeed === s.value
                      ? "bg-[#58a6ff] text-white"
                      : "bg-[#21262d] text-[#8b949e] hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
