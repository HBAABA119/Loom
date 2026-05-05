"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap, Coins } from "lucide-react";

interface Level { id: number; title: string; description: string; objective: string; task: "knapsack" | "coins" | "activity"; data: any; hint: string; educationalNote: string; }

const levels: Level[] = [
  { id: 1, title: "Fractional Knapsack", description: "Maximize value with greedy value/weight ratio strategy", objective: "Items: (w:10,v:60), (w:20,v:100), (w:30,v:120). Capacity: 50. Max value?", task: "knapsack", data: { items: [{ w: 10, v: 60, r: 6 }, { w: 20, v: 100, r: 5 }, { w: 30, v: 120, r: 4 }], capacity: 50 }, hint: "Sort by ratio: Item1(6), Item2(5), Item3(4). Take all Item1 (10≤50): +60. Take all Item2 (20≤40): +100. Take 20/30 of Item3: +80. Total: 240!", educationalNote: "Fractional knapsack greedy works because we can take portions. Sort by value/weight ratio descending, then take greedily." },
  { id: 2, title: "Coin Change (Greedy)", description: "Make change using fewest coins with canonical denominations", objective: "Amount: 67. Coins: [25, 10, 5, 1]. How many coins?", task: "coins", data: { amount: 67, coins: [25, 10, 5, 1] }, hint: "Greedy: take max possible of largest coin. 67/25 = 2 (remainder 17). 17/10 = 1 (remainder 7). 7/5 = 1 (remainder 2). 2/1 = 2. Total: 2+1+1+2 = 6 coins!", educationalNote: "Greedy works for canonical coin systems (US coins). For arbitrary coins, need DP. Always take largest coin ≤ remaining amount." },
  { id: 3, title: "Activity Selection", description: "Select maximum non-overlapping activities", objective: "Activities: [(1,4), (3,5), (0,6), (5,7), (8,9)]. Max count?", task: "activity", data: { activities: [{ s: 1, f: 4 }, { s: 3, f: 5 }, { s: 0, f: 6 }, { s: 5, f: 7 }, { s: 8, f: 9 }] }, hint: "Sort by finish time: (1,4), (3,5), (0,6), (5,7), (8,9). Pick (1,4). Skip (3,5) - overlaps. Skip (0,6) - overlaps. Pick (5,7). Pick (8,9). Total: 3 activities!", educationalNote: "Activity selection: sort by finish time, then greedily pick compatible activities. Proven optimal via exchange argument." },
  { id: 4, title: "When Greedy Fails", description: "0/1 knapsack - greedy gives suboptimal solution", objective: "Items: (w:10,v:60), (w:20,v:100), (w:30,v:120). Capacity: 50. Greedy vs Optimal?", task: "knapsack", data: { items: [{ w: 10, v: 60 }, { w: 20, v: 100 }, { w: 30, v: 120 }], capacity: 50 }, hint: "Greedy (by ratio): takes Item1+Item2 = 160 value, 30 weight. Leaves 20 unused (can't take Item3). But optimal: Item2+Item3 = 220! Greedy fails by 60 points!", educationalNote: "0/1 knapsack greedy fails because we can't take fractions. Must consider combinations, requiring DP." },
  { id: 5, title: "Huffman Coding", description: "Build optimal prefix codes with greedy merge", objective: "Freqs: A:45, B:13, C:12, D:16, E:9, F:5. What's tree property?", task: "activity", data: { freqs: { A: 45, B: 13, C: 12, D: 16, E: 9, F: 5 } }, hint: "Huffman: always merge two lowest frequencies. F(5)+E(9)=14. Then C(12)+B(13)=25. Then 14+D(16)=30. Then 25+30=55. Finally 45+55=100. Optimal prefix code!", educationalNote: "Huffman coding is greedy and optimal! Merge lowest frequencies first. Proven optimal by showing any other tree can be improved." }
];

export default function GreedyMinigameEnhanced() {
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

  const handleSubmit = () => {
    if (gameState !== "playing") return;
    setAttempts(a => a + 1);
    let correct = 0;
    if (level.task === "knapsack") {
      if (currentLevel === 0) correct = 240;
      else if (currentLevel === 3) correct = 220;
    } else if (level.task === "coins") {
      let remaining = level.data.amount; let coins = 0;
      for (const c of level.data.coins) { coins += Math.floor(remaining / c); remaining %= c; }
      correct = coins;
    } else if (level.task === "activity") {
      if (currentLevel === 2) correct = 3;
      else if (currentLevel === 4) correct = 1;
    }
    if (parseInt(userAnswer) === correct) { const points = Math.max(10, 50 - attempts); setScore(points); setTotalScore(s => s + points); setGameState("won"); setFeedback(`🎉 Correct! Answer is ${correct}. +${points} points`); if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) setUnlockedLevels([...unlockedLevels, currentLevel + 1]); }
    else setFeedback(`❌ Incorrect! Try again.`);
  };

  const nextLevel = () => { if (currentLevel < levels.length - 1) setCurrentLevel(currentLevel + 1); };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4"><h3 className="text-white font-semibold text-lg">Greedy Challenge</h3><span className="text-[#8b949e] text-sm">Level {currentLevel + 1}/{levels.length}</span></div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><Trophy size={16} className="text-[#f0883e]" /><span className="text-white font-medium">{totalScore}</span></div>
      </div>
      <div className="flex gap-2 p-3 border-b border-[#30363d] bg-[#0d1117] overflow-x-auto">{levels.map((l, i) => (<button key={l.id} onClick={() => unlockedLevels.includes(i) && setCurrentLevel(i)} disabled={!unlockedLevels.includes(i)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${i === currentLevel ? "bg-[#58a6ff] text-white" : unlockedLevels.includes(i) ? "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]" : "bg-[#161b22] text-[#6e7681] cursor-not-allowed"}`}>{unlockedLevels.includes(i) ? (i < currentLevel ? <CheckCircle size={14} className="text-[#3fb950]" /> : <Unlock size={14} />) : <Lock size={14} />}Level {l.id}</button>))}</div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          <div className="mb-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg"><div className="flex items-start gap-3"><Target size={20} className="text-[#f0883e] mt-0.5" /><div><h4 className="text-white font-medium">{level.title}</h4><p className="text-[#8b949e] text-sm mt-1">{level.objective}</p></div></div></div>
          {level.task === "knapsack" && <div className="mb-4 p-3 bg-[#58a6ff]/10 rounded-lg"><div className="text-[#58a6ff] text-sm">Items: {level.data.items.map((it: any) => `(w:${it.w},v:${it.v}${it.r ? `,r:${it.r}` : ""})`).join(", ")}</div><div className="text-[#58a6ff] text-sm mt-1">Capacity: {level.data.capacity}</div></div>}
          {level.task === "coins" && <div className="mb-4 p-3 bg-[#58a6ff]/10 rounded-lg"><div className="text-[#58a6ff]">Amount: {level.data.amount}</div><div className="text-[#58a6ff] mt-1">Coins: [{level.data.coins.join(", ")}]</div></div>}
          {level.task === "activity" && currentLevel === 2 && <div className="mb-4 p-3 bg-[#58a6ff]/10 rounded-lg"><div className="text-[#58a6ff]">Activities (start, finish):</div><div className="text-[#58a6ff] text-sm">{level.data.activities.map((a: any) => `(${a.s},${a.f})`).join(", ")}</div></div>}
          <div className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg"><div className="flex gap-2"><input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Enter answer" className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white placeholder-[#6e7681] focus:border-[#58a6ff] focus:outline-none" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} /><button onClick={handleSubmit} disabled={gameState === "won"} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] text-white rounded-lg font-medium flex items-center gap-2"><Coins size={16} /> Check</button></div></div>
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
