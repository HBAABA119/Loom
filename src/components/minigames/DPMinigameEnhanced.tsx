"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap, Calculator } from "lucide-react";

interface Level { id: number; title: string; description: string; objective: string; task: "fib" | "knapsack" | "lcs"; data: any; hint: string; educationalNote: string; }

const levels: Level[] = [
  { id: 1, title: "Fibonacci Memoization", description: "Use memoization to avoid redundant calculations", objective: "Compute F(7) using memoization. How many unique calls?", task: "fib", data: { n: 7 }, hint: "Without memo: 2^7 = 128 calls. With memo: only compute F(0) through F(7) = 8 unique calls! Each value computed once.", educationalNote: "Memoization reduces exponential time to linear. Each Fibonacci number computed exactly once and stored for reuse." },
  { id: 2, title: "Bottom-Up DP", description: "Fill the DP table iteratively from base cases", objective: "Fill DP table for F(5). What's dp[5]?", task: "fib", data: { n: 5 }, hint: "Initialize: dp[0]=0, dp[1]=1. Then dp[2]=dp[1]+dp[0]=1, dp[3]=dp[2]+dp[1]=2, dp[4]=3, dp[5]=5. Answer: 5!", educationalNote: "Bottom-up avoids recursion overhead. Same time complexity O(n), but can optimize to O(1) space!" },
  { id: 3, title: "0/1 Knapsack", description: "Maximize value without exceeding weight capacity", objective: "Items: [(w:2,v:3), (w:3,v:4), (w:4,v:5)]. Capacity: 5. Max value?", task: "knapsack", data: { items: [{ w: 2, v: 3 }, { w: 3, v: 4 }, { w: 4, v: 5 }], capacity: 5 }, hint: "Try combinations: Item1+Item2 = w:5, v:7 ✓. Item1+Item3 = w:6 > 5 ✗. Item2+Item3 = w:7 > 5 ✗. Item3 alone = v:5. Max = 7!", educationalNote: "Knapsack is classic DP. dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i]) if item fits." },
  { id: 4, title: "Space Optimization", description: "Reduce DP space from O(n) to O(1)", objective: "For Fibonacci, you only need the last 2 values. What's F(10)?", task: "fib", data: { n: 10 }, hint: "Use rolling variables: a=0, b=1. Iterate: temp=b, b=a+b, a=temp. After 10 iterations, b=55. Answer: 55!", educationalNote: "Space optimization trick: if dp[i] only depends on fixed previous entries (like i-1 and i-2), use O(1) space instead of O(n)." },
  { id: 5, title: "Longest Common Subsequence", description: "Find LCS of two strings using DP", objective: "LCS of 'ABCD' and 'AEBD'? What's the length?", task: "lcs", data: { s1: "ABCD", s2: "AEBD" }, hint: "Build DP table. Matches: A at (1,1), B at (2,3), D at (4,4). LCS = 'ABD', length = 3!", educationalNote: "LCS uses 2D DP: dp[i][j] = dp[i-1][j-1]+1 if match, else max(dp[i-1][j], dp[i][j-1]). Used in diff, bioinformatics." }
];

export default function DPMinigameEnhanced() {
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

  const fib = (n: number): number => n <= 1 ? n : fib(n - 1) + fib(n - 2);

  const knapsack = (items: { w: number; v: number }[], cap: number): number => {
    const dp = new Array(cap + 1).fill(0);
    for (const item of items) { for (let w = cap; w >= item.w; w--) dp[w] = Math.max(dp[w], dp[w - item.w] + item.v); }
    return dp[cap];
  };

  const lcs = (s1: string, s2: string): number => {
    const dp = Array(s1.length + 1).fill(null).map(() => Array(s2.length + 1).fill(0));
    for (let i = 1; i <= s1.length; i++) for (let j = 1; j <= s2.length; j++) dp[i][j] = s1[i - 1] === s2[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return dp[s1.length][s2.length];
  };

  const handleSubmit = () => {
    if (gameState !== "playing") return;
    setAttempts(a => a + 1);
    let correct = 0;
    if (level.task === "fib") correct = fib(level.data.n);
    else if (level.task === "knapsack") correct = knapsack(level.data.items, level.data.capacity);
    else if (level.task === "lcs") correct = lcs(level.data.s1, level.data.s2);
    if (parseInt(userAnswer) === correct) { const points = Math.max(10, 50 - attempts); setScore(points); setTotalScore(s => s + points); setGameState("won"); setFeedback(`🎉 Correct! Answer is ${correct}. +${points} points`); if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) setUnlockedLevels([...unlockedLevels, currentLevel + 1]); }
    else setFeedback(`❌ Incorrect! Try again.`);
  };

  const nextLevel = () => { if (currentLevel < levels.length - 1) setCurrentLevel(currentLevel + 1); };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4"><h3 className="text-white font-semibold text-lg">DP Challenge</h3><span className="text-[#8b949e] text-sm">Level {currentLevel + 1}/{levels.length}</span></div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><Trophy size={16} className="text-[#f0883e]" /><span className="text-white font-medium">{totalScore}</span></div>
      </div>
      <div className="flex gap-2 p-3 border-b border-[#30363d] bg-[#0d1117] overflow-x-auto">{levels.map((l, i) => (<button key={l.id} onClick={() => unlockedLevels.includes(i) && setCurrentLevel(i)} disabled={!unlockedLevels.includes(i)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${i === currentLevel ? "bg-[#58a6ff] text-white" : unlockedLevels.includes(i) ? "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]" : "bg-[#161b22] text-[#6e7681] cursor-not-allowed"}`}>{unlockedLevels.includes(i) ? (i < currentLevel ? <CheckCircle size={14} className="text-[#3fb950]" /> : <Unlock size={14} />) : <Lock size={14} />}Level {l.id}</button>))}</div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          <div className="mb-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg"><div className="flex items-start gap-3"><Target size={20} className="text-[#f0883e] mt-0.5" /><div><h4 className="text-white font-medium">{level.title}</h4><p className="text-[#8b949e] text-sm mt-1">{level.objective}</p></div></div></div>
          {level.task === "fib" && <div className="mb-4 p-3 bg-[#58a6ff]/10 rounded-lg"><span className="text-[#58a6ff]">Compute F({level.data.n})</span></div>}
          {level.task === "knapsack" && <div className="mb-4 p-3 bg-[#58a6ff]/10 rounded-lg"><div className="text-[#58a6ff] text-sm">Items (weight, value): {level.data.items.map((it: any) => `(${it.w},${it.v})`).join(", ")}</div><div className="text-[#58a6ff] text-sm mt-1">Capacity: {level.data.capacity}</div></div>}
          {level.task === "lcs" && <div className="mb-4 p-3 bg-[#58a6ff]/10 rounded-lg"><div className="text-[#58a6ff]">String 1: "{level.data.s1}"</div><div className="text-[#58a6ff] mt-1">String 2: "{level.data.s2}"</div></div>}
          <div className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg"><div className="flex gap-2"><input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Enter answer" className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white placeholder-[#6e7681] focus:border-[#58a6ff] focus:outline-none" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} /><button onClick={handleSubmit} disabled={gameState === "won"} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] text-white rounded-lg font-medium flex items-center gap-2"><Calculator size={16} /> Check</button></div></div>
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
