"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, TrendingUp, Play, RotateCcw } from "lucide-react";

interface GameState {
  score: number;
  level: number;
  operations: number[];
  currentN: number;
  isRunning: boolean;
}

const complexities = [
  { name: "O(1)", color: "#3fb950", multiplier: 1 },
  { name: "O(log n)", color: "#f0883e", multiplier: 5 },
  { name: "O(n)", color: "#d2a8ff", multiplier: 10 },
  { name: "O(n log n)", color: "#79c0ff", multiplier: 20 },
  { name: "O(n²)", color: "#f85149", multiplier: 50 },
];

function BigOMinigameEnhanced() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    operations: [],
    currentN: 10,
    isRunning: false,
  });

  const [selectedComplexity, setSelectedComplexity] = useState(0);

  useEffect(() => {
    if (gameState.isRunning) {
      const interval = setInterval(() => {
        setGameState((prev) => {
          const newOps = prev.operations.map((op, i) => {
            const complexity = complexities[i];
            return op + complexity.multiplier * prev.currentN;
          });
          return {
            ...prev,
            operations: newOps,
            currentN: prev.currentN + 5,
          };
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [gameState.isRunning]);

  const startSimulation = () => {
    setGameState({
      ...gameState,
      operations: complexities.map(() => 0),
      currentN: 10,
      isRunning: true,
    });
  };

  const resetGame = () => {
    setGameState({
      score: 0,
      level: 1,
      operations: [],
      currentN: 10,
      isRunning: false,
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <TrendingUp size={24} className="text-[#f0883e]" />
          Big O Complexity Simulator
        </h2>
        <div className="flex gap-2">
          <button
            onClick={startSimulation}
            disabled={gameState.isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Play size={16} />
            Run
          </button>
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4">
        <div className="bg-[#161b22] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-[#58a6ff]" />
            <span className="text-white font-semibold">Input Size (n)</span>
            <span className="ml-auto text-2xl font-bold text-[#58a6ff]">{gameState.currentN}</span>
          </div>
          <div className="space-y-2">
            {complexities.map((comp, i) => (
              <motion.div
                key={comp.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-[#21262d]"
              >
                <span className="text-white font-mono font-bold" style={{ color: comp.color }}>
                  {comp.name}
                </span>
                <span className="text-[#8b949e] font-mono">
                  {gameState.operations[i]?.toLocaleString() || 0} ops
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-[#161b22] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={20} className="text-[#f0883e]" />
            <span className="text-white font-semibold">Complexity Guide</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-[#21262d] rounded-lg">
              <span className="text-[#3fb950] font-bold">O(1)</span>
              <p className="text-[#8b949e] mt-1">Constant time - always same operations</p>
            </div>
            <div className="p-3 bg-[#21262d] rounded-lg">
              <span className="text-[#f0883e] font-bold">O(log n)</span>
              <p className="text-[#8b949e] mt-1">Logarithmic - halves input each step</p>
            </div>
            <div className="p-3 bg-[#21262d] rounded-lg">
              <span className="text-[#d2a8ff] font-bold">O(n)</span>
              <p className="text-[#8b949e] mt-1">Linear - processes each element once</p>
            </div>
            <div className="p-3 bg-[#21262d] rounded-lg">
              <span className="text-[#f85149] font-bold">O(n²)</span>
              <p className="text-[#8b949e] mt-1">Quadratic - nested loops over input</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BigOMinigameEnhanced;
