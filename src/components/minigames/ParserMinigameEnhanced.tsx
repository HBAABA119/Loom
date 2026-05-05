"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw, ArrowRight, Target, Zap, GitBranch, Layers } from "lucide-react";

interface Level {
  id: number;
  tokens: string[];
  tree: { type: string; value: string; children?: number[] }[];
  hint: string;
}

const levels: Level[] = [
  { id: 1, tokens: ["3", "+", "5"], tree: [{ type: "+", value: "+", children: [1, 2] }, { type: "num", value: "3" }, { type: "num", value: "5" }], hint: "+ is root, 3 and 5 are leaves" },
  { id: 2, tokens: ["2", "+", "3", "*", "4"], tree: [{ type: "+", value: "+", children: [1, 2] }, { type: "num", value: "2" }, { type: "*", value: "*", children: [3, 4] }, { type: "num", value: "3" }, { type: "num", value: "4" }], hint: "* has higher precedence, becomes child of +" },
  { id: 3, tokens: ["(", "2", "+", "3", ")", "*", "4"], tree: [{ type: "*", value: "*", children: [1, 2] }, { type: "+", value: "+", children: [3, 4] }, { type: "num", value: "4" }, { type: "num", value: "2" }, { type: "num", value: "3" }], hint: "Parentheses group 2+3 first, making it a subtree" },
];

type DropZone = { level: number; index: number; parent: number | null };

export default function ParserMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [dropped, setDropped] = useState<(string | null)[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [unlocked, setUnlocked] = useState([0]);

  const level = levels[currentLevel];

  const handleDrop = (nodeIndex: number, value: string) => {
    const newDropped = [...dropped];
    newDropped[nodeIndex] = value;
    setDropped(newDropped);
    if (newDropped.every((v, i) => v === level.tree[i].value)) {
      setGameState("won");
      setScore(s => s + 100);
      if (currentLevel < levels.length - 1 && !unlocked.includes(currentLevel + 1)) {
        setUnlocked([...unlocked, currentLevel + 1]);
      }
    }
  };

  const reset = () => { setDropped(new Array(level.tree.length).fill(null)); setGameState("playing"); };
  const next = () => { if (currentLevel < levels.length - 1) { setCurrentLevel(c => c + 1); reset(); } };

  const renderNode = (nodeIdx: number, x: number, y: number) => {
    const node = level.tree[nodeIdx];
    const value = dropped[nodeIdx];
    return (
      <motion.div key={nodeIdx} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: nodeIdx * 0.1 }}
        className="absolute" style={{ left: x, top: y }}
      >
        <div onClick={() => !value && gameState === "playing" && level.tokens.forEach((t, i) => { if (!dropped.includes(t)) { handleDrop(nodeIdx, t); return; } })}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border-2 cursor-pointer transition-all ${
            value ? "bg-[#238636]/30 border-[#238636] text-[#7ee787]" : "bg-[#21262d] border-[#30363d] text-[#6e7681] hover:border-[#58a6ff]"
          }`}
        >{value || "?"}</div>
        {node.children?.map((childIdx, i) => (
          <div key={childIdx}>
            <svg className="absolute top-7 left-7 w-20 h-16 pointer-events-none" style={{ left: i === 0 ? -40 : 40 }}>
              <line x1="28" y1="28" x2={i === 0 ? "-12" : "68"} y2="64" stroke="#30363d" strokeWidth="2" />
            </svg>
            {renderNode(childIdx, x + (i === 0 ? -60 : 60), y + 80)}
          </div>
        ))}
      </motion.div>
    );
  };

  const tokenPool = level.tokens.filter(t => !dropped.includes(t));

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">AST Builder</h3>
          <span className="text-[#8b949e] text-sm">Level {currentLevel + 1}/{levels.length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
          <Trophy size={16} className="text-[#f0883e]" />
          <span className="text-white font-medium">{score}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 flex flex-col border-r border-[#30363d]">
          <div className="p-4 bg-[#161b22]">
            <div className="flex items-center gap-2 mb-2">
              <Layers size={18} className="text-[#58a6ff]" />
              <span className="text-[#58a6ff] font-mono text-lg">{level.tokens.join(" ")}</span>
            </div>
            <p className="text-[#8b949e] text-sm">Build the AST by placing tokens in the tree nodes</p>
          </div>

          <div className="flex-1 relative bg-[#0d1117] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {renderNode(0, 0, 0)}
            </div>
          </div>

          <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
            <div className="text-[#8b949e] text-sm mb-2">Available tokens:</div>
            <div className="flex gap-2">
              {tokenPool.map((t, i) => (
                <motion.button key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => { const emptyIdx = dropped.findIndex(v => v === null); if (emptyIdx >= 0) handleDrop(emptyIdx, t); }}
                  className="px-4 py-2 bg-[#21262d] border border-[#58a6ff] text-[#58a6ff] rounded-lg font-mono font-bold"
                >{t}</motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col bg-[#161b22]">
          <div className="p-4 border-b border-[#30363d]">
            <h4 className="text-white font-medium mb-2">Progress</h4>
            <div className="flex gap-2">{levels.map((l, i) => (
              <button key={l.id} onClick={() => unlocked.includes(i) && (setCurrentLevel(i), reset())} disabled={!unlocked.includes(i)}
                className={`w-8 h-8 rounded-lg text-sm font-bold ${i === currentLevel ? "bg-[#58a6ff] text-white" : unlocked.includes(i) ? "bg-[#21262d] text-[#c9d1d9]" : "bg-[#161b22] text-[#6e7681]"}`}
              >{i + 1}</button>
            ))}</div>
          </div>

          <div className="flex-1 p-4">
            <div className="p-4 bg-[#0d1117] rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-[#f0883e]" />
                <h4 className="text-[#f0883e] font-medium text-sm">Hint</h4>
              </div>
              <p className="text-[#c9d1d9] text-sm">{level.hint}</p>
            </div>

            {gameState === "won" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-[#238636]/20 border border-[#238636] rounded-lg">
                <p className="text-[#3fb950]">Perfect! AST built correctly!</p>
              </motion.div>
            )}
          </div>

          <div className="p-4 border-t border-[#30363d]">
            <div className="flex gap-2">
              <button onClick={reset} className="flex-1 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg font-medium flex items-center justify-center gap-2"><RotateCcw size={16} /> Reset</button>
              {gameState === "won" && currentLevel < levels.length - 1 && (
                <button onClick={next} className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center justify-center gap-2">Next <ArrowRight size={16} /></button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
