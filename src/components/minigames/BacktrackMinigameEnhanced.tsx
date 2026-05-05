"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Play, RotateCcw } from "lucide-react";

interface State {
  path: number[];
  current: number;
  target: number;
  visited: boolean[];
}

export default function BacktrackMinigameEnhanced() {
  const [state, setState] = useState<State>({
    path: [],
    current: 0,
    target: 7,
    visited: Array(8).fill(false),
  });

  const [isRunning, setIsRunning] = useState(false);
  const [solutions, setSolutions] = useState<number[][]>([]);

  const graph = [
    [1, 2],
    [0, 3],
    [0, 4],
    [1, 5, 6],
    [2, 6],
    [3, 7],
    [3, 4, 7],
    [5, 6],
  ];

  const solve = async () => {
    setIsRunning(true);
    setSolutions([]);
    const foundSolutions: number[][] = [];
    const visited = Array(8).fill(false);
    const path: number[] = [];

    const backtrack = (node: number) => {
      visited[node] = true;
      path.push(node);

      if (node === state.target) {
        foundSolutions.push([...path]);
      } else {
        for (const neighbor of graph[node]) {
          if (!visited[neighbor]) {
            backtrack(neighbor);
          }
        }
      }

      path.pop();
      visited[node] = false;
    };

    backtrack(0);
    setSolutions(foundSolutions);
    setIsRunning(false);
  };

  const reset = () => {
    setState({
      path: [],
      current: 0,
      target: 7,
      visited: Array(8).fill(false),
    });
    setSolutions([]);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <GitBranch size={24} className="text-[#d2a8ff]" />
          Backtracking Maze
        </h2>
        <div className="flex gap-2">
          <button onClick={solve} disabled={isRunning} className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg">
            <Play size={16} />
            Solve
          </button>
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg">
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4">
        <div className="flex-1 bg-[#161b22] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Graph</h3>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: state.path.includes(i) ? 1.1 : 1,
                  backgroundColor: i === state.target ? "#f0883e" : state.path.includes(i) ? "#238636" : "#21262d",
                }}
                className="p-4 rounded-lg text-white font-bold text-center"
              >
                {i}
              </motion.div>
            ))}
          </div>
          <div className="mt-4 text-[#8b949e] text-sm">
            Start: 0 | Target: {state.target}
          </div>
        </div>

        <div className="w-64 bg-[#161b22] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Solutions Found</h3>
          <div className="space-y-2">
            {solutions.map((sol, i) => (
              <div key={i} className="p-2 bg-[#21262d] rounded text-[#7ee787] text-sm font-mono">
                {sol.join(" → ")}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
