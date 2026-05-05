"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap, Cpu } from "lucide-react";

interface Level { id: number; title: string; description: string; objective: string; question: string; options: string[]; correctIndex: number; hint: string; educationalNote: string; }

const levels: Level[] = [
  { id: 1, title: "Stack vs Heap", description: "Understand the difference between stack and heap allocation", objective: "Where are local variables stored?", question: "When you declare 'int x = 5' inside a function, where is it stored?", options: ["Heap (dynamic memory)", "Stack (automatic)", "Code segment", "Data segment (globals)"], correctIndex: 1, hint: "Local variables are automatically allocated on the stack when function is called and freed when function returns. No malloc needed!", educationalNote: "Stack allocation is automatic and fast (O(1)). Variables destroyed when function exits. Limited stack size (~1-8MB)." },
  { id: 2, title: "Dynamic Allocation", description: "When to use heap allocation", objective: "When is heap memory used?", question: "Which function allocates memory on the heap?", options: ["int x = 10;", "int arr[100];", "int* p = malloc(4);", "return 0;"], correctIndex: 2, hint: "malloc(), calloc(), realloc() allocate heap memory. Must be manually freed with free() to avoid memory leaks!", educationalNote: "Heap memory persists until explicitly freed. Programmer controls lifetime. Slower than stack but flexible." },
  { id: 3, title: "Memory Leaks", description: "Understanding memory leak scenarios", objective: "Identify memory leak pattern", question: "Which causes a memory leak?", options: ["int* p = malloc(10); free(p);", "void func() { int x; }", "char* p = malloc(100); p = NULL;", "return malloc(1);"], correctIndex: 2, hint: "If you lose the pointer to heap memory before freeing it, you can't free it anymore! That's a leak. In option C, p loses reference to the 100 bytes.", educationalNote: "Memory leak = allocated memory no longer accessible (lost pointer) but not freed. Accumulates over time, crashes program." },
  { id: 4, title: "Dangling Pointer", description: "Use-after-free bug", objective: "What is a dangling pointer?", question: "What's wrong with: free(ptr); *ptr = 10;", options: ["Nothing, it's fine", "ptr is now dangling (use-after-free)", "Can't assign after free", "Memory leak"], correctIndex: 1, hint: "After free(ptr), the memory is returned to heap but ptr still holds the old address. Writing there is undefined behavior - could corrupt memory or crash!", educationalNote: "Dangling pointer = pointer to freed memory. Use-after-free is a security vulnerability (CVE). Set ptr = NULL after free to prevent." },
  { id: 5, title: "Stack Overflow", description: "When recursion goes too deep", objective: "What causes stack overflow?", question: "What typically causes stack overflow?", options: ["Too much heap allocation", "Infinite recursion or huge local arrays", "Not calling free()", "Too many global variables"], correctIndex: 1, hint: "Stack is limited (1-8MB). Each recursive call adds a stack frame. Infinite recursion fills stack = overflow. Large arrays on stack also risk overflow.", educationalNote: "Stack overflow = exceeding stack size limit. Protection: limit recursion depth, allocate large arrays on heap, use tail recursion optimization." }
];

export default function MemoryMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);

  const level = levels[currentLevel];

  useEffect(() => { resetLevel(); }, [currentLevel]);

  const resetLevel = () => { setSelectedOption(null); setGameState("playing"); setFeedback(""); setShowHint(false); setScore(0); setAttempts(0); };

  const handleSubmit = () => {
    if (gameState !== "playing" || selectedOption === null) return;
    setAttempts(a => a + 1);
    if (selectedOption === level.correctIndex) { const points = Math.max(10, 50 - attempts); setScore(points); setTotalScore(s => s + points); setGameState("won"); setFeedback(`🎉 Correct! ${level.options[level.correctIndex]}. +${points} points`); if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) setUnlockedLevels([...unlockedLevels, currentLevel + 1]); }
    else { setFeedback(`❌ Incorrect! Try again.`); setSelectedOption(null); }
  };

  const nextLevel = () => { if (currentLevel < levels.length - 1) setCurrentLevel(currentLevel + 1); };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4"><h3 className="text-white font-semibold text-lg">Memory Management Quiz</h3><span className="text-[#8b949e] text-sm">Level {currentLevel + 1}/{levels.length}</span></div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><Trophy size={16} className="text-[#f0883e]" /><span className="text-white font-medium">{totalScore}</span></div>
      </div>
      <div className="flex gap-2 p-3 border-b border-[#30363d] bg-[#0d1117] overflow-x-auto">{levels.map((l, i) => (<button key={l.id} onClick={() => unlockedLevels.includes(i) && setCurrentLevel(i)} disabled={!unlockedLevels.includes(i)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${i === currentLevel ? "bg-[#58a6ff] text-white" : unlockedLevels.includes(i) ? "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]" : "bg-[#161b22] text-[#6e7681] cursor-not-allowed"}`}>{unlockedLevels.includes(i) ? (i < currentLevel ? <CheckCircle size={14} className="text-[#3fb950]" /> : <Unlock size={14} />) : <Lock size={14} />}Level {l.id}</button>))}</div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          <div className="mb-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg"><div className="flex items-start gap-3"><Target size={20} className="text-[#f0883e] mt-0.5" /><div><h4 className="text-white font-medium">{level.title}</h4><p className="text-[#8b949e] text-sm mt-1">{level.objective}</p></div></div></div>
          <div className="mb-4 p-4 bg-[#58a6ff]/10 rounded-lg"><p className="text-[#c9d1d9] font-medium">{level.question}</p></div>
          <div className="space-y-2">{level.options.map((opt, i) => (<button key={i} onClick={() => gameState === "playing" && setSelectedOption(i)} disabled={gameState === "won"} className={`w-full p-4 rounded-lg text-left border-2 transition-all ${selectedOption === i ? "border-[#58a6ff] bg-[#58a6ff]/20" : "border-[#30363d] bg-[#161b22] hover:border-[#8b949e]"}`}><span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 text-sm ${selectedOption === i ? "bg-[#58a6ff] text-white" : "bg-[#21262d] text-[#8b949e]"}`}>{String.fromCharCode(65 + i)}</span><span className="text-[#c9d1d9]">{opt}</span></button>))}</div>
          <button onClick={handleSubmit} disabled={selectedOption === null || gameState === "won"} className="mt-4 px-6 py-3 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] text-white rounded-lg font-medium"><Cpu size={16} className="inline mr-2" /> Submit Answer</button>
          <AnimatePresence>{feedback && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mt-4 p-4 rounded-lg ${gameState === "won" ? "bg-[#238636]/20 border border-[#238636]" : "bg-[#f85149]/20 border border-[#f85149]"}`}><p className={gameState === "won" ? "text-[#3fb950]" : "text-[#f85149]"}>{feedback}</p></motion.div>)}</AnimatePresence>
        </div>
        <div className="w-80 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-4 border-b border-[#30363d]"><h4 className="text-white font-medium mb-2">About This Level</h4><p className="text-[#c9d1d9] text-sm">{level.description}</p></div>
          <div className="p-4 border-b border-[#30363d]"><button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-[#8b949e] hover:text-white"><HelpCircle size={16} /><span className="text-sm">{showHint ? "Hide Hint" : "Show Hint"}</span></button><AnimatePresence>{showHint && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg"><p className="text-[#f0883e] text-sm">{level.hint}</p></motion.div>)}</AnimatePresence></div>
          <div className="p-4 border-b border-[#30363d] flex-1"><div className="flex items-center gap-2 mb-2"><Zap size={16} className="text-[#3fb950]" /><h4 className="text-[#3fb950] font-medium text-sm">Why This Matters</h4></div><p className="text-[#c9d1d9] text-sm leading-relaxed">{level.educationalNote}</p></div>
          <div className="p-4 border-b border-[#30363d]"><div className="grid grid-cols-2 gap-3"><div className="p-3 bg-[#21262d] rounded-lg"><span className="text-[#8b949e] text-xs">Level Score</span><p className="text-white font-bold text-lg">{score}</p></div><div className="p-3 bg-[#21262d] rounded-lg"><span className="text-[#8b949e] text-xs">Attempts</span><p className="text-white font-bold text-lg">{attempts}</p></div></div></div>
          <div className="p-4"><div className="flex gap-2"><button onClick={resetLevel} className="flex-1 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg font-medium flex items-center justify-center gap-2"><RotateCcw size={16} /> Reset</button>{gameState === "won" && currentLevel < levels.length - 1 && <button onClick={nextLevel} className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center justify-center gap-2">Next <ArrowRight size={16} /></button>}</div></div>
        </div>
      </div>
    </div>
  );
}
