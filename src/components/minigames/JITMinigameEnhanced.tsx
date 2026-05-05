"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw, ArrowRight, Zap, Flame, Layers, Cpu, ArrowUp, CheckCircle } from "lucide-react";

interface Level { id: number; code: string; hot: boolean; threshold: number; optimizations: string[]; hint: string; description: string; }

const levels: Level[] = [
  { id: 1, code: "sum = a + b", hot: true, threshold: 10, optimizations: ["Constant Folding", "Inlining"], hint: "Warm up the code by running it many times", description: "Trigger JIT compilation by reaching threshold" },
  { id: 2, code: "for (i=0; i<100; i++) sum += i", hot: true, threshold: 5, optimizations: ["Loop Unrolling", "Bounds Check Elimination"], hint: "Loops are prime candidates for JIT optimization", description: "Optimize a hot loop" },
];

export default function JITMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [invocations, setInvocations] = useState(0);
  const [phase, setPhase] = useState<"interpreting" | "compiling" | "native">("interpreting");
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [unlocked, setUnlocked] = useState([0]);
  const [appliedOpts, setAppliedOpts] = useState<string[]>([]);

  const level = levels[currentLevel];

  useEffect(() => {
    if (invocations >= level.threshold && phase === "interpreting") {
      setPhase("compiling");
      setTimeout(() => {
        setPhase("native");
        setAppliedOpts(level.optimizations);
        setGameState("won");
        setScore(s => s + 100);
        if (currentLevel < levels.length - 1 && !unlocked.includes(currentLevel + 1)) setUnlocked([...unlocked, currentLevel + 1]);
      }, 2000);
    }
  }, [invocations, level.threshold, phase]);

  const invoke = () => { if (phase !== "native") setInvocations(i => i + 1); };

  const reset = () => { setInvocations(0); setPhase("interpreting"); setGameState("playing"); setAppliedOpts([]); };

  const next = () => { if (currentLevel < levels.length - 1) { setCurrentLevel(c => c + 1); setTimeout(reset, 0); } };

  const getSpeed = () => phase === "interpreting" ? 100 : phase === "compiling" ? 0 : 10;

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">JIT Trigger</h3>
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
            <h4 className="text-white font-medium mb-2">{level.description}</h4>
            <div className="flex items-center gap-2">
              <span className="text-[#8b949e] text-sm">Threshold: {level.threshold} invocations</span>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm p-4 bg-[#21262d] rounded-lg mb-6">
              <code className="text-[#58a6ff] font-mono text-sm">{level.code}</code>
            </div>

            <div className="w-full max-w-sm mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#8b949e]">Warm-up Progress</span>
                <span className="text-white font-bold">{invocations}/{level.threshold}</span>
              </div>
              <div className="h-3 bg-[#21262d] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((invocations / level.threshold) * 100, 100)}%` }} className={`h-full ${phase === "native" ? "bg-[#238636]" : "bg-[#f0883e]"}`} />
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className={`px-4 py-2 rounded-lg font-medium ${phase === "interpreting" ? "bg-[#8b949e]/20 text-[#8b949e]" : "opacity-50"}`}>
                <Layers size={16} className="inline mr-2" />Bytecode
              </div>
              <ArrowRight size={20} className="text-[#6e7681]" />
              <div className={`px-4 py-2 rounded-lg font-medium ${phase === "compiling" ? "bg-[#d2a8ff]/20 text-[#d2a8ff] animate-pulse" : "opacity-50"}`}>
                <Cpu size={16} className="inline mr-2" />Compiling
              </div>
              <ArrowRight size={20} className="text-[#6e7681]" />
              <div className={`px-4 py-2 rounded-lg font-medium ${phase === "native" ? "bg-[#238636]/20 text-[#3fb950]" : "opacity-50"}`}>
                <Zap size={16} className="inline mr-2" />Native
              </div>
            </div>

            <div className="text-center">
              <div className="text-[#8b949e] text-sm mb-1">Execution Time</div>
              <div className={`text-2xl font-bold ${phase === "native" ? "text-[#3fb950]" : "text-[#f0883e]"}`}>{getSpeed()}ms/iter</div>
              {phase === "native" && <div className="text-[#3fb950] text-sm mt-1">10x speedup!</div>}
            </div>
          </div>

          <div className="p-4 border-t border-[#30363d] flex gap-2">
            <button onClick={invoke} disabled={phase === "native"} className="flex-1 py-3 bg-[#f0883e] hover:bg-[#ffa657] disabled:opacity-50 text-white rounded-lg font-bold flex items-center justify-center gap-2">
              <ArrowUp size={18} /> Invoke ({invocations})
            </button>
            <button onClick={reset} className="p-3 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg"><RotateCcw size={18} /></button>
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
            <div className="p-4 bg-[#0d1117] rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-3"><Zap size={16} className="text-[#f0883e]" /><h4 className="text-[#f0883e] font-medium text-sm">Hint</h4></div>
              <p className="text-[#c9d1d9] text-sm">{level.hint}</p>
            </div>

            {appliedOpts.length > 0 && (
              <div className="p-4 bg-[#0d1117] rounded-lg">
                <div className="flex items-center gap-2 mb-3"><Flame size={16} className="text-[#d2a8ff]" /><h4 className="text-[#d2a8ff] font-medium text-sm">Applied Optimizations</h4></div>
                <div className="space-y-2">
                  {appliedOpts.map((opt, i) => (
                    <motion.div key={opt} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-2 p-2 bg-[#238636]/20 rounded-lg">
                      <CheckCircle size={16} className="text-[#3fb950]" />
                      <span className="text-[#3fb950] text-sm">{opt}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {gameState === "won" && currentLevel < levels.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                <button onClick={next} className="w-full py-3 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-bold">Next Level</button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
