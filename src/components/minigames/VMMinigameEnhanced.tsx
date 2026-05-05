"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw, ArrowRight, Target, Zap, Cpu, Layers, ArrowUp } from "lucide-react";

interface Level {
  id: number;
  bytecode: string[];
  initialStack: number[];
  expectedStack: number[];
  expectedLocals?: Record<string, number>;
  hint: string;
  description: string;
}

const levels: Level[] = [
  { id: 1, bytecode: ["PUSH 5", "PUSH 3", "ADD"], initialStack: [], expectedStack: [8], hint: "PUSH adds to stack, ADD pops two and pushes sum", description: "Calculate 5 + 3" },
  { id: 2, bytecode: ["PUSH 10", "PUSH 2", "DIV"], initialStack: [], expectedStack: [5], hint: "DIV divides second-to-top by top", description: "Calculate 10 / 2" },
  { id: 3, bytecode: ["PUSH 5", "STORE x", "LOAD x", "PUSH 1", "ADD"], initialStack: [], expectedStack: [6], expectedLocals: { x: 5 }, hint: "STORE pops to local, LOAD pushes from local", description: "x = 5; return x + 1" },
];

export default function VMMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [stack, setStack] = useState<number[]>([]);
  const [locals, setLocals] = useState<Record<string, number>>({});
  const [pc, setPc] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [unlocked, setUnlocked] = useState([0]);

  const level = levels[currentLevel];

  const reset = () => {
    setStack([...level.initialStack]);
    setLocals({});
    setPc(0);
    setGameState("playing");
  };

  const step = () => {
    if (pc >= level.bytecode.length) {
      const stackOk = JSON.stringify(stack) === JSON.stringify(level.expectedStack);
      const localsOk = !level.expectedLocals || JSON.stringify(locals) === JSON.stringify(level.expectedLocals);
      if (stackOk && localsOk) {
        setGameState("won");
        setScore(s => s + 100);
        if (currentLevel < levels.length - 1 && !unlocked.includes(currentLevel + 1)) setUnlocked([...unlocked, currentLevel + 1]);
      } else {
        setGameState("lost");
      }
      return;
    }

    const instr = level.bytecode[pc].split(" ");
    const op = instr[0];
    const arg = instr[1];

    let newStack = [...stack];
    let newLocals = { ...locals };

    switch (op) {
      case "PUSH": newStack.push(Number(arg)); break;
      case "POP": newStack.pop(); break;
      case "ADD": { const b = newStack.pop() || 0, a = newStack.pop() || 0; newStack.push(a + b); break; }
      case "SUB": { const b = newStack.pop() || 0, a = newStack.pop() || 0; newStack.push(a - b); break; }
      case "MUL": { const b = newStack.pop() || 0, a = newStack.pop() || 0; newStack.push(a * b); break; }
      case "DIV": { const b = newStack.pop() || 0, a = newStack.pop() || 0; newStack.push(b !== 0 ? a / b : 0); break; }
      case "STORE": newLocals[arg] = newStack.pop() || 0; break;
      case "LOAD": newStack.push(newLocals[arg] || 0); break;
    }

    setStack(newStack);
    setLocals(newLocals);
    setPc(pc + 1);
  };

  const runAll = () => { for (let i = pc; i <= level.bytecode.length; i++) step(); };

  const next = () => { if (currentLevel < levels.length - 1) { setCurrentLevel(c => c + 1); setTimeout(reset, 0); } };

  React.useEffect(() => { reset(); }, [currentLevel]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">VM Executor</h3>
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
            <p className="text-[#c9d1d9]">{level.description}</p>
          </div>

          <div className="flex-1 p-4 space-y-2 overflow-auto">
            {level.bytecode.map((instr, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-mono ${i === pc ? "bg-[#f0883e]/20 border border-[#f0883e]" : i < pc ? "bg-[#238636]/10 text-[#7ee787]" : "bg-[#21262d] text-[#8b949e]"}`}>
                <span className="w-6 text-right text-xs text-[#6e7681]">{i}</span>
                <span className={i === pc ? "text-[#f0883e] font-bold" : ""}>{instr}</span>
                {i === pc && <span className="ml-auto text-xs text-[#f0883e]">← PC</span>}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
            <div className="flex gap-2">
              <button onClick={step} disabled={gameState !== "playing"} className="flex-1 py-2 bg-[#58a6ff] hover:bg-[#79c0ff] disabled:opacity-50 text-white rounded-lg font-medium">Step</button>
              <button onClick={runAll} disabled={gameState !== "playing"} className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg font-medium">Run All</button>
              <button onClick={reset} className="p-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg"><RotateCcw size={16} /></button>
            </div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col bg-[#161b22]">
          <div className="flex-1 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={16} className="text-[#58a6ff]" />
              <span className="text-white font-medium">Operand Stack</span>
            </div>
            <div className="space-y-2">
              {stack.length === 0 ? (
                <div className="text-center py-8 text-[#6e7681]"><ArrowUp size={24} className="mx-auto mb-2 opacity-50" /><p>Stack empty</p></div>
              ) : stack.map((v, i) => (
                <motion.div key={`${i}-${v}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`px-4 py-3 rounded-lg font-mono text-lg font-bold text-center ${i === stack.length - 1 ? "bg-[#58a6ff]/20 border border-[#58a6ff] text-white" : "bg-[#21262d] text-[#8b949e]"}`}>
                  {v} {i === stack.length - 1 && <span className="ml-2 text-sm text-[#58a6ff]">← top</span>}
                </motion.div>
              ))}
            </div>

            {Object.keys(locals).length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu size={16} className="text-[#79c0ff]" />
                  <span className="text-white font-medium">Local Variables</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(locals).map(([k, v]) => (
                    <div key={k} className="p-3 bg-[#21262d] rounded-lg">
                      <span className="text-[#8b949e] text-xs">{k}</span>
                      <div className="text-white font-mono font-bold">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-[#0d1117] rounded-lg">
              <div className="flex items-center gap-2 mb-2"><Zap size={14} className="text-[#f0883e]" /><span className="text-[#f0883e] text-sm font-medium">Hint</span></div>
              <p className="text-[#8b949e] text-sm">{level.hint}</p>
            </div>
          </div>

          <div className="p-4 border-t border-[#30363d]">
            {gameState === "won" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-[#238636]/20 border border-[#238636] rounded-lg mb-3"><p className="text-[#3fb950] text-center">Success! Stack matches expected state!</p></motion.div>}
            {gameState === "lost" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-[#f85149]/20 border border-[#f85149] rounded-lg mb-3"><p className="text-[#f85149] text-center">Stack doesn't match. Try again!</p></motion.div>}
            <div className="flex gap-2">
              <div className="flex-1 text-center">
                <div className="text-[#8b949e] text-xs">Expected</div>
                <div className="text-white font-mono">[{level.expectedStack.join(", ")}]</div>
              </div>
              {gameState === "won" && currentLevel < levels.length - 1 && (
                <button onClick={next} className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium">Next Level</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
