"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap, Binary } from "lucide-react";

interface Level { id: number; title: string; description: string; objective: string; task: "and" | "or" | "xor" | "shift" | "count" | "power2"; num1: number; num2?: number; answer: number; hint: string; educationalNote: string; }

const levels: Level[] = [
  { id: 1, title: "Bitwise AND", description: "Compute the bitwise AND of two numbers", objective: "What is 12 & 10?", task: "and", num1: 12, num2: 10, answer: 8, hint: "12 = 1100, 10 = 1010. AND bit by bit: 1&1=1, 1&0=0, 0&1=0, 0&0=0 → 1000 = 8!", educationalNote: "AND outputs 1 only where both bits are 1. Used for masking (extracting specific bits)." },
  { id: 2, title: "Bitwise XOR", description: "Compute the bitwise XOR of two numbers", objective: "What is 7 ^ 5?", task: "xor", num1: 7, num2: 5, answer: 2, hint: "7 = 111, 5 = 101. XOR: 1^1=0, 1^0=1, 1^1=0 → 010 = 2! XOR is true when bits differ.", educationalNote: "XOR outputs 1 where bits differ. Great for toggling bits and simple encryption (XOR cipher)." },
  { id: 3, title: "Left Shift", description: "Multiply by powers of 2 using left shift", objective: "What is 5 << 3?", task: "shift", num1: 5, answer: 40, hint: "5 << 3 means 5 × 2³ = 5 × 8 = 40. Left shift is fast multiplication by powers of 2!", educationalNote: "Left shift (<<) multiplies by 2^n. Single CPU instruction, faster than multiply on most architectures." },
  { id: 4, title: "Count Set Bits", description: "Count the number of 1s in binary representation", objective: "How many set bits in 13?", task: "count", num1: 13, answer: 3, hint: "13 = 1101. Count the 1s: bit positions 0, 2, 3 are 1. That's 3 set bits!", educationalNote: "Counting set bits (population count, popcount) used in: Hamming distance, parity checking, sparse bitsets. Brian Kernighan's algorithm: n &= n-1 clears lowest set bit." },
  { id: 5, title: "Power of 2 Check", description: "Use bit trick to check if number is power of 2", objective: "Is 16 a power of 2? Use n & (n-1) === 0", task: "power2", num1: 16, answer: 1, hint: "16 & 15 = 10000 & 01111 = 00000 = 0. Result is 0, so YES it's power of 2! Answer: 1 for true.", educationalNote: "Trick: n is power of 2 iff n & (n-1) === 0. Works because powers of 2 have exactly one set bit. Clears lowest set bit." }
];

export default function BitManipMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);

  const level = levels[currentLevel];

  useEffect(() => { resetLevel(); }, [currentLevel]);

  const resetLevel = () => { setUserAnswer(""); setGameState("playing"); setFeedback(""); setShowHint(false); setScore(0); setAttempts(0); };

  const toBinary = (n: number): string => (n >>> 0).toString(2).padStart(8, '0');

  const handleSubmit = () => {
    if (gameState !== "playing") return;
    setAttempts(a => a + 1);
    if (parseInt(userAnswer) === level.answer) { const points = Math.max(10, 50 - attempts); setScore(points); setTotalScore(s => s + points); setGameState("won"); setFeedback(`🎉 Correct! Answer is ${level.answer}. +${points} points`); if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) setUnlockedLevels([...unlockedLevels, currentLevel + 1]); }
    else setFeedback(`❌ Incorrect! Try again.`);
  };

  const nextLevel = () => { if (currentLevel < levels.length - 1) setCurrentLevel(currentLevel + 1); };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4"><h3 className="text-white font-semibold text-lg">Bit Manipulation Challenge</h3><span className="text-[#8b949e] text-sm">Level {currentLevel + 1}/{levels.length}</span></div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><Trophy size={16} className="text-[#f0883e]" /><span className="text-white font-medium">{totalScore}</span></div>
      </div>
      <div className="flex gap-2 p-3 border-b border-[#30363d] bg-[#0d1117] overflow-x-auto">{levels.map((l, i) => (<button key={l.id} onClick={() => unlockedLevels.includes(i) && setCurrentLevel(i)} disabled={!unlockedLevels.includes(i)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${i === currentLevel ? "bg-[#58a6ff] text-white" : unlockedLevels.includes(i) ? "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]" : "bg-[#161b22] text-[#6e7681] cursor-not-allowed"}`}>{unlockedLevels.includes(i) ? (i < currentLevel ? <CheckCircle size={14} className="text-[#3fb950]" /> : <Unlock size={14} />) : <Lock size={14} />}Level {l.id}</button>))}</div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          <div className="mb-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg"><div className="flex items-start gap-3"><Target size={20} className="text-[#f0883e] mt-0.5" /><div><h4 className="text-white font-medium">{level.title}</h4><p className="text-[#8b949e] text-sm mt-1">{level.objective}</p></div></div></div>
          <div className="mb-4 p-4 bg-[#58a6ff]/10 rounded-lg">
            <div className="text-[#58a6ff]">Number 1: {level.num1} <span className="text-[#8b949e] ml-2">({toBinary(level.num1)})</span></div>
            {level.num2 !== undefined && <div className="text-[#58a6ff] mt-2">Number 2: {level.num2} <span className="text-[#8b949e] ml-2">({toBinary(level.num2)})</span></div>}
          </div>
          <div className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg"><div className="flex gap-2"><input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Enter answer" className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white placeholder-[#6e7681] focus:border-[#58a6ff] focus:outline-none" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} /><button onClick={handleSubmit} disabled={gameState === "won"} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] text-white rounded-lg font-medium flex items-center gap-2"><Binary size={16} /> Check</button></div></div>
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
