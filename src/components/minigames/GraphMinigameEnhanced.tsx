"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap, Network } from "lucide-react";

interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  task: "bfs" | "dfs" | "shortest" | "path";
  startNode: string;
  endNode?: string;
  graph: Record<string, string[]>;
  nodePositions: Record<string, { x: number; y: number }>;
  hint: string;
  educationalNote: string;
}

const levels: Level[] = [
  {
    id: 1,
    title: "BFS Traversal",
    description: "Visit all nodes using Breadth-First Search",
    objective: "Click nodes in BFS order starting from A",
    task: "bfs",
    startNode: "A",
    graph: {
      A: ["B", "C"],
      B: ["A", "D", "E"],
      C: ["A", "F"],
      D: ["B"],
      E: ["B", "F"],
      F: ["C", "E"]
    },
    nodePositions: {
      A: { x: 200, y: 50 },
      B: { x: 100, y: 150 },
      C: { x: 300, y: 150 },
      D: { x: 50, y: 250 },
      E: { x: 150, y: 250 },
      F: { x: 300, y: 250 }
    },
    hint: "BFS uses a queue. Visit A, then A's neighbors (B, C), then their neighbors. Order: A → B → C → D → E → F",
    educationalNote: "BFS explores level by level. All nodes at distance 1 before distance 2. This finds shortest paths in unweighted graphs."
  },
  {
    id: 2,
    title: "DFS Traversal",
    description: "Visit all nodes using Depth-First Search",
    objective: "Click nodes in DFS order starting from A",
    task: "dfs",
    startNode: "A",
    graph: {
      A: ["B", "C"],
      B: ["A", "D"],
      C: ["A", "F"],
      D: ["B", "E"],
      E: ["D", "F"],
      F: ["C", "E"]
    },
    nodePositions: {
      A: { x: 200, y: 50 },
      B: { x: 100, y: 150 },
      C: { x: 300, y: 150 },
      D: { x: 50, y: 250 },
      E: { x: 150, y: 250 },
      F: { x: 300, y: 250 }
    },
    hint: "DFS uses a stack and goes deep. A → B → D → E → F → C (backtrack when stuck). Go as far as possible before backtracking!",
    educationalNote: "DFS explores one branch fully before backtracking. Uses less memory for deep graphs. Good for maze solving and topological sort."
  },
  {
    id: 3,
    title: "Shortest Path",
    description: "Find the shortest path between two nodes using BFS",
    objective: "Find shortest path from A to F",
    task: "shortest",
    startNode: "A",
    endNode: "F",
    graph: {
      A: ["B", "C"],
      B: ["A", "D", "E"],
      C: ["A", "F"],
      D: ["B"],
      E: ["B", "F"],
      F: ["C", "E"]
    },
    nodePositions: {
      A: { x: 200, y: 50 },
      B: { x: 100, y: 150 },
      C: { x: 300, y: 150 },
      D: { x: 50, y: 250 },
      E: { x: 150, y: 250 },
      F: { x: 300, y: 250 }
    },
    hint: "BFS finds shortest paths! A → C → F is length 2. A → B → E → F is length 3. Click the shortest path nodes in order.",
    educationalNote: "In unweighted graphs, the first time BFS reaches a node is via the shortest path. This is why BFS is used for navigation and network routing."
  },
  {
    id: 4,
    title: "Connected Components",
    description: "Find all disconnected parts of a graph",
    objective: "How many connected components are in this graph?",
    task: "path",
    startNode: "A",
    graph: {
      A: ["B"],
      B: ["A"],
      C: ["D"],
      D: ["C"],
      E: []
    },
    nodePositions: {
      A: { x: 100, y: 100 },
      B: { x: 200, y: 100 },
      C: { x: 100, y: 200 },
      D: { x: 200, y: 200 },
      E: { x: 300, y: 150 }
    },
    hint: "A-B are connected. C-D are connected. E is alone (isolated node). Total: 3 components.",
    educationalNote: "Connected components identify separate networks. Used in social networks (friend circles), image processing (connected pixels), and clustering."
  },
  {
    id: 5,
    title: "Graph Cycle Detection",
    description: "Determine if a graph contains a cycle",
    objective: "Does this graph have a cycle? (Yes/No)",
    task: "path",
    startNode: "A",
    graph: {
      A: ["B", "C"],
      B: ["A", "C"],
      C: ["A", "B"]
    },
    nodePositions: {
      A: { x: 200, y: 50 },
      B: { x: 100, y: 150 },
      C: { x: 300, y: 150 }
    },
    hint: "A triangle! A-B-C-A forms a cycle. In undirected graphs, any back edge creates a cycle. Answer: Yes.",
    educationalNote: "Cycle detection is crucial: deadlock detection, dependency resolution, topological sorting. DFS can detect cycles by finding back edges to visited nodes."
  }
];

// BFS to get correct traversal order
const bfs = (graph: Record<string, string[]>, start: string): string[] => {
  const visited = new Set<string>();
  const queue = [start];
  const result: string[] = [];
  
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (!visited.has(node)) {
      visited.add(node);
      result.push(node);
      for (const neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }
  return result;
};

// DFS to get correct traversal order
const dfs = (graph: Record<string, string[]>, start: string): string[] => {
  const visited = new Set<string>();
  const stack = [start];
  const result: string[] = [];
  
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (!visited.has(node)) {
      visited.add(node);
      result.push(node);
      for (const neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }
  return result;
};

export default function GraphMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [visited, setVisited] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");

  const level = levels[currentLevel];

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  const resetLevel = () => {
    setVisited([]);
    setGameState("playing");
    setFeedback("");
    setShowHint(false);
    setScore(0);
    setAttempts(0);
    setUserAnswer("");
  };

  const handleNodeClick = (nodeId: string) => {
    if (gameState !== "playing") return;

    const newVisited = [...visited, nodeId];
    setVisited(newVisited);
    setAttempts(a => a + 1);

    if (level.task === "bfs") {
      const correct = bfs(level.graph, level.startNode);
      if (newVisited.length <= correct.length) {
        if (correct[newVisited.length - 1] === nodeId) {
          if (newVisited.length === correct.length) {
            completeLevel();
          } else {
            setFeedback(`✅ Good! Next: explore ${level.graph[nodeId].filter(n => !newVisited.includes(n)).join(" or ") || "neighbors"}`);
          }
        } else {
          setFeedback(`❌ Wrong order! Expected ${correct[newVisited.length - 1]} at position ${newVisited.length}. Try again.`);
          setVisited([]);
        }
      }
    } else if (level.task === "dfs") {
      const correct = dfs(level.graph, level.startNode);
      // For DFS, multiple valid orders exist depending on neighbor order
      // Check if this could be a valid DFS
      const isValidSoFar = checkValidDFS(level.graph, level.startNode, newVisited);
      if (!isValidSoFar) {
        setFeedback(`❌ Invalid DFS order. Remember: stack is LIFO - explore neighbors depth-first!`);
        setVisited([]);
      } else if (newVisited.length === Object.keys(level.graph).length) {
        completeLevel();
      } else {
        const unvisitedNeighbors = level.graph[nodeId].filter(n => !newVisited.includes(n));
        setFeedback(`✅ Continue! ${unvisitedNeighbors.length > 0 ? `Explore ${unvisitedNeighbors.join(" or ")}` : "Backtrack to parent"}`);
      }
    } else if (level.task === "shortest") {
      if (nodeId === level.endNode) {
        // Check if path is valid and shortest
        const isValidPath = checkValidPath(level.graph, level.startNode, level.endNode!, newVisited);
        if (isValidPath && newVisited.length <= 3) { // A-C-F is length 3 nodes (2 edges)
          completeLevel();
        } else if (!isValidPath) {
          setFeedback("❌ Invalid path! Nodes must be connected by edges.");
          setVisited([]);
        } else {
          setFeedback("❌ Not the shortest path! Try a different route.");
          setVisited([]);
        }
      } else {
        const unvisitedNeighbors = level.graph[nodeId].filter(n => !newVisited.includes(n));
        setFeedback(`Keep going! Can reach ${level.endNode} via: ${unvisitedNeighbors.join(", ") || "backtrack"}`);
      }
    }
  };

  const checkValidDFS = (graph: Record<string, string[]>, start: string, order: string[]): boolean => {
    // Simplified check - each node must be adjacent to some previously visited node
    if (order[0] !== start) return false;
    for (let i = 1; i < order.length; i++) {
      const prev = order.slice(0, i);
      const current = order[i];
      // Current must be neighbor of some visited node
      const hasNeighbor = prev.some(p => graph[p].includes(current));
      if (!hasNeighbor) return false;
    }
    return true;
  };

  const checkValidPath = (graph: Record<string, string[]>, start: string, end: string, path: string[]): boolean => {
    if (path[0] !== start) return false;
    if (path[path.length - 1] !== end) return false;
    for (let i = 0; i < path.length - 1; i++) {
      if (!graph[path[i]].includes(path[i + 1])) return false;
    }
    return true;
  };

  const handleAnswer = () => {
    if (gameState !== "playing") return;
    setAttempts(a => a + 1);

    if (level.id === 4) {
      // Connected components - answer is 3
      if (userAnswer === "3") {
        completeLevel();
      } else {
        setFeedback("❌ Count the separate groups. Look at which nodes connect to which.");
      }
    } else if (level.id === 5) {
      // Cycle detection - answer is Yes
      if (userAnswer.toLowerCase() === "yes") {
        completeLevel();
      } else {
        setFeedback("❌ Look for a loop! Can you start at a node and return to it?");
      }
    }
  };

  const completeLevel = () => {
    const points = Math.max(10, 50 - attempts);
    setScore(points);
    setTotalScore(s => s + points);
    setGameState("won");
    setFeedback(`🎉 Level Complete! +${points} points`);
    if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
      setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  // Get edges for visualization
  const edges: { from: string; to: string }[] = [];
  Object.entries(level.graph).forEach(([from, neighbors]) => {
    neighbors.forEach(to => {
      if (from < to) edges.push({ from, to }); // Avoid duplicates
    });
  });

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">Graph Challenge</h3>
          <span className="text-[#8b949e] text-sm">Level {currentLevel + 1}/{levels.length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
          <Trophy size={16} className="text-[#f0883e]" />
          <span className="text-white font-medium">{totalScore}</span>
        </div>
      </div>

      {/* Level Selector */}
      <div className="flex gap-2 p-3 border-b border-[#30363d] bg-[#0d1117] overflow-x-auto">
        {levels.map((l, i) => (
          <button
            key={l.id}
            onClick={() => unlockedLevels.includes(i) && setCurrentLevel(i)}
            disabled={!unlockedLevels.includes(i)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              i === currentLevel
                ? "bg-[#58a6ff] text-white"
                : unlockedLevels.includes(i)
                ? "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
                : "bg-[#161b22] text-[#6e7681] cursor-not-allowed"
            }`}
          >
            {unlockedLevels.includes(i) ? (i < currentLevel ? <CheckCircle size={14} className="text-[#3fb950]" /> : <Unlock size={14} />) : <Lock size={14} />}
            Level {l.id}
          </button>
        ))}
      </div>

      {/* Main Game */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Graph Area */}
        <div className="flex-1 flex flex-col p-6">
          {/* Objective */}
          <div className="mb-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="flex items-start gap-3">
              <Target size={20} className="text-[#f0883e] mt-0.5" />
              <div>
                <h4 className="text-white font-medium">{level.title}</h4>
                <p className="text-[#8b949e] text-sm mt-1">{level.objective}</p>
              </div>
            </div>
          </div>

          {/* Graph Visualization */}
          <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg relative overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
              {/* Edges */}
              {edges.map((edge, i) => (
                <line
                  key={i}
                  x1={level.nodePositions[edge.from].x}
                  y1={level.nodePositions[edge.from].y}
                  x2={level.nodePositions[edge.to].x}
                  y2={level.nodePositions[edge.to].y}
                  stroke="#30363d"
                  strokeWidth="2"
                />
              ))}
              
              {/* Nodes */}
              {Object.entries(level.nodePositions).map(([id, pos]) => (
                <motion.g
                  key={id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="cursor-pointer"
                  onClick={() => handleNodeClick(id)}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={25}
                    className={`cursor-pointer transition-all hover:stroke-[#58a6ff] ${
                      visited.includes(id)
                        ? "fill-[#3fb950] stroke-[#3fb950]"
                        : id === level.startNode
                        ? "fill-[#58a6ff] stroke-[#58a6ff]"
                        : "fill-[#21262d] stroke-[#30363d]"
                    }`}
                    strokeWidth="3"
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`font-bold pointer-events-none ${
                      visited.includes(id) || id === level.startNode ? "fill-white" : "fill-[#c9d1d9]"
                    }`}
                  >
                    {id}
                  </text>
                </motion.g>
              ))}
            </svg>
          </div>

          {/* Path Display */}
          {visited.length > 0 && level.task !== "path" && (
            <div className="mt-4 p-3 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-lg">
              <span className="text-[#3fb950] text-sm">Your path: </span>
              <span className="text-white font-mono">{visited.join(" → ")}</span>
            </div>
          )}

          {/* Answer Input for path/cycle levels */}
          {level.task === "path" && (
            <div className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={level.id === 4 ? "Number of components" : "Yes or No"}
                  className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white placeholder-[#6e7681] focus:border-[#58a6ff] focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleAnswer()}
                />
                <button
                  onClick={handleAnswer}
                  className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 p-4 rounded-lg ${
                  gameState === "won" ? "bg-[#238636]/20 border border-[#238636]" : feedback.startsWith("✅") ? "bg-[#3fb950]/20 border border-[#3fb950]" : "bg-[#f85149]/20 border border-[#f85149]"
                }`}
              >
                <p className={gameState === "won" ? "text-[#3fb950]" : feedback.startsWith("✅") ? "text-[#3fb950]" : "text-[#f85149]"}>{feedback}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-4 border-b border-[#30363d]">
            <h4 className="text-white font-medium mb-2">About This Level</h4>
            <p className="text-[#c9d1d9] text-sm">{level.description}</p>
          </div>

          <div className="p-4 border-b border-[#30363d]">
            <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-[#8b949e] hover:text-white">
              <HelpCircle size={16} />
              <span className="text-sm">{showHint ? "Hide Hint" : "Show Hint"}</span>
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg">
                  <p className="text-[#f0883e] text-sm">{level.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 border-b border-[#30363d] flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-[#3fb950]" />
              <h4 className="text-[#3fb950] font-medium text-sm">Why This Matters</h4>
            </div>
            <p className="text-[#c9d1d9] text-sm leading-relaxed">{level.educationalNote}</p>
          </div>

          <div className="p-4 border-b border-[#30363d]">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#21262d] rounded-lg">
                <span className="text-[#8b949e] text-xs">Level Score</span>
                <p className="text-white font-bold text-lg">{score}</p>
              </div>
              <div className="p-3 bg-[#21262d] rounded-lg">
                <span className="text-[#8b949e] text-xs">Attempts</span>
                <p className="text-white font-bold text-lg">{attempts}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex gap-2">
              <button onClick={resetLevel} className="flex-1 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg font-medium flex items-center justify-center gap-2">
                <RotateCcw size={16} /> Reset
              </button>
              {gameState === "won" && currentLevel < levels.length - 1 && (
                <button onClick={nextLevel} className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  Next <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
