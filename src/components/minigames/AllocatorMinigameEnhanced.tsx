"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw, ArrowRight, Target, Zap, Plus, Trash2 } from "lucide-react";

interface Block { id: number; size: number; allocated: boolean; name?: string; }

interface Level { id: number; initial: Block[]; requests: { size: number; name: string }[]; strategy: string; hint: string; description: string; }

const levels: Level[] = [
  { id: 1, initial: [{ id: 0, size: 4, allocated: true, name: "A" }, { id: 1, size: 6, allocated: false }], requests: [{ size: 2, name: "B" }, { size: 3, name: "C" }], strategy: "first-fit", hint: "First-fit uses the first block that fits", description: "Allocate 2KB and 3KB using first-fit" },
  { id: 2, initial: [{ id: 0, size: 2, allocated: false }, { id: 1, size: 4, allocated: true, name: "X" }, { id: 2, size: 3, allocated: false }, { id: 3, size: 5, allocated: false }], requests: [{ size: 2, name: "Y" }], strategy: "best-fit", hint: "Best-fit finds the smallest adequate block", description: "Allocate 2KB using best-fit strategy" },
];

export default function AllocatorMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [heap, setHeap] = useState<Block[]>([]);
  const [requestIdx, setRequestIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [unlocked, setUnlocked] = useState([0]);

  const level = levels[currentLevel];

  React.useEffect(() => { setHeap(level.initial.map(b => ({ ...b }))); setRequestIdx(0); }, [currentLevel]);

  const allocate = (blockId: number) => {
    const block = heap.find(b => b.id === blockId);
    if (!block || block.allocated || block.size < level.requests[requestIdx].size) return;

    const req = level.requests[requestIdx];
    const remaining = block.size - req.size;

    let newHeap;
    if (remaining > 0) {
      const idx = heap.findIndex(b => b.id === blockId);
      newHeap = [...heap];
      newHeap.splice(idx, 1,
        { id: Date.now(), size: req.size, allocated: true, name: req.name },
        { id: block.id, size: remaining, allocated: false }
      );
    } else {
      newHeap = heap.map(b => b.id === blockId ? { ...b, allocated: true, name: req.name } : b);
    }

    setHeap(newHeap);
    if (requestIdx + 1 >= level.requests.length) {
      setGameState("won");
      setScore(s => s + 100);
      if (currentLevel < levels.length - 1 && !unlocked.includes(currentLevel + 1)) setUnlocked([...unlocked, currentLevel + 1]);
    } else {
      setRequestIdx(requestIdx + 1);
    }
  };

  const free = (blockId: number) => {
    setHeap(prev => {
      const newHeap = prev.map(b => b.id === blockId ? { ...b, allocated: false, name: undefined } : b);
      const coalesced: Block[] = [];
      for (const b of newHeap) {
        if (coalesced.length > 0 && !coalesced[coalesced.length - 1].allocated && !b.allocated) {
          coalesced[coalesced.length - 1].size += b.size;
        } else {
          coalesced.push({ ...b });
        }
      }
      return coalesced;
    });
  };

  const reset = () => { setHeap(level.initial.map(b => ({ ...b }))); setRequestIdx(0); setGameState("playing"); };
  const next = () => { if (currentLevel < levels.length - 1) { setCurrentLevel(c => c + 1); setTimeout(reset, 0); } };

  const currentRequest = level.requests[requestIdx];
  const freeBlocks = heap.filter(b => !b.allocated).reduce((sum, b) => sum + b.size, 0);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">Memory Allocator</h3>
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
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">{level.description}</h4>
              <span className="px-2 py-1 bg-[#58a6ff]/20 text-[#58a6ff] text-xs rounded">{level.strategy}</span>
            </div>
            {currentRequest && gameState === "playing" && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-[#f0883e]/20 border border-[#f0883e] rounded-lg">
                <div className="flex items-center gap-2">
                  <Plus size={18} className="text-[#f0883e]" />
                  <span className="text-[#f0883e] font-medium">Allocate {currentRequest.size}KB for "{currentRequest.name}"</span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="flex h-24 rounded-xl overflow-hidden border-2 border-[#30363d]">
                {heap.map((block) => (
                  <motion.button key={block.id} whileHover={{ opacity: 0.8 }} onClick={() => block.allocated ? free(block.id) : allocate(block.id)}
                    className={`relative flex flex-col items-center justify-center border-r border-[#30363d] last:border-r-0 transition-all ${
                      block.allocated ? "bg-[#58a6ff]/30 hover:bg-[#58a6ff]/40" : "bg-[#238636]/20 hover:bg-[#238636]/30"
                    }`}
                    style={{ flex: block.size }}
                  >
                    <span className={`font-bold ${block.allocated ? "text-[#58a6ff]" : "text-[#238636]"}`}>{block.allocated ? block.name : "FREE"}</span>
                    <span className="text-xs text-[#8b949e]">{block.size}KB</span>
                    {block.allocated && <span className="absolute top-1 right-1 text-[#f85149] text-xs opacity-0 hover:opacity-100">Click to free</span>}
                  </motion.button>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#6e7681]">
                <span>0</span>
                <span>{heap.reduce((s, b) => s + b.size, 0) / 2}KB</span>
                <span>{heap.reduce((s, b) => s + b.size, 0)}KB</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-[#30363d] flex gap-2">
            <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg"><RotateCcw size={16} /> Reset</button>
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
              <div className="p-3 bg-[#21262d] rounded-lg"><div className="text-[#8b949e] text-xs">Free Memory</div><div className="text-[#238636] font-bold text-lg">{freeBlocks}KB</div></div>
              <div className="p-3 bg-[#21262d] rounded-lg"><div className="text-[#8b949e] text-xs">Blocks</div><div className="text-white font-bold text-lg">{heap.length}</div></div>
            </div>

            {gameState === "won" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-[#238636]/20 border border-[#238636] rounded-lg">
                <p className="text-[#3fb950] text-center font-medium">All allocations completed!</p>
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
