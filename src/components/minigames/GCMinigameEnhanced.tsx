"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw, ArrowRight, Target, Zap, Trash2, CheckCircle } from "lucide-react";

interface ObjectNode {
  id: number;
  name: string;
  reachable: boolean;
  marked: boolean;
}

interface Level {
  id: number;
  objects: ObjectNode[];
  hint: string;
  description: string;
}

const levels: Level[] = [
  { id: 1, objects: [{ id: 0, name: "root", reachable: true, marked: false }, { id: 1, name: "A", reachable: true, marked: false }, { id: 2, name: "B", reachable: false, marked: false }], hint: "Click white objects reachable from root to mark them", description: "Mark all reachable objects from root" },
  { id: 2, objects: [{ id: 0, name: "root", reachable: true, marked: false }, { id: 1, name: "X", reachable: true, marked: false }, { id: 2, name: "Y", reachable: true, marked: false }, { id: 3, name: "Z", reachable: false, marked: false }, { id: 4, name: "W", reachable: false, marked: false }], hint: "Only objects reachable from root survive GC", description: "Identify garbage vs reachable objects" },
];

export default function GCMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [objects, setObjects] = useState<ObjectNode[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"marking" | "sweeping" | "won">("marking");
  const [unlocked, setUnlocked] = useState([0]);

  const level = levels[currentLevel];

  React.useEffect(() => { setObjects(level.objects.map(o => ({ ...o }))); }, [currentLevel]);

  const handleMark = (id: number) => {
    if (gameState !== "marking") return;
    const obj = objects.find(o => o.id === id);
    if (!obj || !obj.reachable) {
      setGameState("sweeping");
      return;
    }
    setObjects(prev => prev.map(o => o.id === id ? { ...o, marked: true } : o));
    if (objects.filter(o => o.reachable && o.id !== id).every(o => o.marked)) {
      setGameState("sweeping");
    }
  };

  const sweep = () => {
    setObjects(prev => prev.map(o => o.marked ? o : { ...o, name: "💀 " + o.name }));
    const allCorrect = objects.filter(o => o.reachable).every(o => o.marked) && objects.filter(o => !o.reachable).every(o => !o.marked);
    if (allCorrect) {
      setGameState("won");
      setScore(s => s + 100);
      if (currentLevel < levels.length - 1 && !unlocked.includes(currentLevel + 1)) setUnlocked([...unlocked, currentLevel + 1]);
    }
  };

  const reset = () => {
    setObjects(level.objects.map(o => ({ ...o, marked: false })));
    setGameState("marking");
  };

  const next = () => { if (currentLevel < levels.length - 1) { setCurrentLevel(c => c + 1); setTimeout(reset, 0); } };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">Garbage Collector</h3>
          <span className="text-[#8b949e] text-sm">Level {currentLevel + 1}/{levels.length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
          <Trophy size={16} className="text-[#f0883e]" />
          <span className="text-white font-medium">{score}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 flex flex-col p-6 border-r border-[#30363d]">
          <div className="mb-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <h4 className="text-white font-medium mb-1">{level.description}</h4>
            <p className="text-[#8b949e] text-sm">Phase: <span className={gameState === "marking" ? "text-[#f0883e]" : gameState === "sweeping" ? "text-[#f85149]" : "text-[#3fb950]"}>{gameState.toUpperCase()}</span></p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-wrap gap-4 justify-center">
              {objects.map((obj) => (
                <motion.button key={obj.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleMark(obj.id)} disabled={gameState !== "marking"}
                  className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center font-bold text-lg transition-all ${
                    obj.marked ? "bg-[#238636]/30 border-2 border-[#238636] text-[#3fb950]" : 
                    obj.name.startsWith("💀") ? "bg-[#f85149]/20 border-2 border-[#f85149] text-[#f85149]" :
                    "bg-[#21262d] border-2 border-[#8b949e] text-[#8b949e] hover:border-[#f0883e]"
                  } ${obj.id === 0 ? "ring-2 ring-[#58a6ff]" : ""}`}
                >
                  {obj.name.startsWith("💀") ? "💀" : obj.name}
                  {obj.id === 0 && <span className="text-xs text-[#58a6ff] mt-1">ROOT</span>}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {gameState === "sweeping" && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={sweep} className="flex-1 py-3 bg-[#f85149] hover:bg-[#ff7b72] text-white rounded-lg font-bold flex items-center justify-center gap-2">
                <Trash2 size={18} /> SWEEP (Collect Garbage)
              </motion.button>
            )}
            <button onClick={reset} className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg"><RotateCcw size={16} /></button>
          </div>
        </div>

        <div className="w-1/2 flex flex-col bg-[#161b22]">
          <div className="p-4 border-b border-[#30363d]">
            <h4 className="text-white font-medium mb-2">Progress</h4>
            <div className="flex gap-2">{levels.map((l, i) => (
              <button key={l.id} onClick={() => unlocked.includes(i) && (setCurrentLevel(i), setTimeout(reset, 0))} disabled={!unlocked.includes(i)}
                className={`w-8 h-8 rounded-lg text-sm font-bold ${i === currentLevel ? "bg-[#58a6ff] text-white" : unlocked.includes(i) ? "bg-[#21262d] text-[#c9d1d9]" : "bg-[#161b22] text-[#6e7681]"}`}
              >{i + 1}</button>
            ))}</div>
          </div>

          <div className="flex-1 p-4">
            <div className="p-4 bg-[#0d1117] rounded-lg">
              <div className="flex items-center gap-2 mb-3"><Zap size={16} className="text-[#f0883e]" /><h4 className="text-[#f0883e] font-medium text-sm">Hint</h4></div>
              <p className="text-[#c9d1d9] text-sm">{level.hint}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#21262d] rounded-lg"><div className="text-[#8b949e] text-xs">Marked</div><div className="text-white font-bold text-lg">{objects.filter(o => o.marked).length}</div></div>
              <div className="p-3 bg-[#21262d] rounded-lg"><div className="text-[#8b949e] text-xs">Garbage</div><div className="text-white font-bold text-lg">{objects.filter(o => !o.reachable).length}</div></div>
            </div>

            {gameState === "won" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-[#238636]/20 border border-[#238636] rounded-lg">
                <div className="flex items-center gap-2 text-[#3fb950]"><CheckCircle size={18} /><span>GC completed successfully!</span></div>
                {currentLevel < levels.length - 1 && (
                  <button onClick={next} className="mt-3 w-full py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium">Next Level</button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
