"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap, FileText } from "lucide-react";

interface Level { id: number; title: string; description: string; objective: string; text: string; pattern: string; answer: number; hint: string; educationalNote: string; }

const levels: Level[] = [
  { id: 1, title: "Pattern Matching Count", description: "Count occurrences of pattern in text using suffix array concept", objective: "Text: 'banana'. Pattern: 'ana'. How many occurrences?", text: "banana", pattern: "ana", answer: 2, hint: "Suffixes of 'banana': banana(0), anana(1), nana(2), ana(3), na(4), a(5). 'ana' appears at positions 1 and 3. Answer: 2!", educationalNote: "Suffix trees enable O(m) pattern search where m = pattern length. All occurrences found by traversing from root following pattern edges." },
  { id: 2, title: "Longest Repeated Substring", description: "Find the longest substring that appears at least twice", objective: "In 'banana', what's the longest repeated substring? Length?", text: "banana", pattern: "", answer: 3, hint: "Repeated substrings: 'an' appears twice, 'ana' appears twice at positions 1 and 3. 'ana' has length 3! 'na' also length 2. Longest is 'ana' = 3!", educationalNote: "Longest repeated substring corresponds to deepest internal node in suffix tree. All leaves under that node share that prefix." },
  { id: 3, title: "Suffix Array Sort", description: "Sort suffixes lexicographically", objective: "Sort suffixes of 'abcab'. What's the first suffix alphabetically? (give its starting index)", text: "abcab", pattern: "", answer: 3, hint: "Suffixes: abcab(0), bcab(1), cab(2), ab(3), b(4). Alphabetically: 'ab' < 'abcab' < 'b' < 'bcab' < 'cab'. First is 'ab' at index 3!", educationalNote: "Suffix array = sorted array of suffix starting indices. Enables binary search for pattern matching in O(m log n). More space efficient than suffix tree." },
  { id: 4, title: "Pattern Search Complexity", description: "Understand the power of suffix tree search", objective: "With suffix tree built, searching pattern 'pattern' in text of length n takes: O(?)", text: "", pattern: "", answer: 7, hint: "Suffix tree search is O(m) where m = pattern length! This is INDEPENDENT of text size n. Answer: m (give numeric value for 'pattern' = 7 letters)", educationalNote: "O(m) vs O(n) or O(n+m) for naive algorithms. For large texts (DNA: 3 billion bases), this is crucial! Suffix tree construction is O(n)." },
  { id: 5, title: "LCS via Suffix Tree", description: "Longest Common Substring of two strings", objective: "LCS of 'banana' and 'anana'? Length?", text: "banana", pattern: "anana", answer: 5, hint: "Common substrings: 'anana'(5), 'nana'(4), 'ana'(3), etc. 'anana' is the entire second string and appears in first at position 1! Length = 5!", educationalNote: "Build generalized suffix tree with both strings (use unique terminators). Deepest internal node with leaves from both strings = LCS." }
];

export default function SuffixTreeMinigameEnhanced() {
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
    if (parseInt(userAnswer) === level.answer) { const points = Math.max(10, 50 - attempts); setScore(points); setTotalScore(s => s + points); setGameState("won"); setFeedback(`🎉 Correct! Answer is ${level.answer}. +${points} points`); if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) setUnlockedLevels([...unlockedLevels, currentLevel + 1]); }
    else setFeedback(`❌ Incorrect! Try again.`);
  };

  const nextLevel = () => { if (currentLevel < levels.length - 1) setCurrentLevel(currentLevel + 1); };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4"><h3 className="text-white font-semibold text-lg">Suffix Tree Challenge</h3><span className="text-[#8b949e] text-sm">Level {currentLevel + 1}/{levels.length}</span></div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><Trophy size={16} className="text-[#f0883e]" /><span className="text-white font-medium">{totalScore}</span></div>
      </div>
      <div className="flex gap-2 p-3 border-b border-[#30363d] bg-[#0d1117] overflow-x-auto">{levels.map((l, i) => (<button key={l.id} onClick={() => unlockedLevels.includes(i) && setCurrentLevel(i)} disabled={!unlockedLevels.includes(i)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${i === currentLevel ? "bg-[#58a6ff] text-white" : unlockedLevels.includes(i) ? "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]" : "bg-[#161b22] text-[#6e7681] cursor-not-allowed"}`}>{unlockedLevels.includes(i) ? (i < currentLevel ? <CheckCircle size={14} className="text-[#3fb950]" /> : <Unlock size={14} />) : <Lock size={14} />}Level {l.id}</button>))}</div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          <div className="mb-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg"><div className="flex items-start gap-3"><Target size={20} className="text-[#f0883e] mt-0.5" /><div><h4 className="text-white font-medium">{level.title}</h4><p className="text-[#8b949e] text-sm mt-1">{level.objective}</p></div></div></div>
          {level.text && <div className="mb-4 p-3 bg-[#58a6ff]/10 rounded-lg"><div className="text-[#58a6ff]">Text: "<span className="font-bold">{level.text}</span>"</div></div>}
          {level.pattern && <div className="mb-4 p-3 bg-[#f0883e]/10 rounded-lg"><div className="text-[#f0883e]">Pattern: "<span className="font-bold">{level.pattern}</span>"</div></div>}
          <div className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg"><div className="flex gap-2"><input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Enter answer" className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white placeholder-[#6e7681] focus:border-[#58a6ff] focus:outline-none" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} /><button onClick={handleSubmit} disabled={gameState === "won"} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] text-white rounded-lg font-medium flex items-center gap-2"><FileText size={16} /> Check</button></div></div>
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
