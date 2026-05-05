"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap, Hash } from "lucide-react";

interface Level { id: number; title: string; description: string; objective: string; task: "prime" | "gcd" | "lcm" | "factorial" | "sieve"; n: number; answer: number; hint: string; educationalNote: string; }

const isPrime = (n: number): boolean => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);
const countPrimes = (n: number): number => { const sieve = new Array(n + 1).fill(true); sieve[0] = sieve[1] = false; for (let i = 2; i * i <= n; i++) if (sieve[i]) for (let j = i * i; j <= n; j += i) sieve[j] = false; return sieve.filter(Boolean).length; };

const levels: Level[] = [
  { id: 1, title: "Prime Check", description: "Determine if a number is prime", objective: "Is 29 a prime number? (1 for yes, 0 for no)", task: "prime", n: 29, answer: 1, hint: "Check divisors from 2 to √29 ≈ 5.4. 29 not divisible by 2, 3, or 5. So 29 IS prime! Answer: 1", educationalNote: "Prime numbers have exactly two divisors: 1 and themselves. Used in cryptography (RSA relies on large primes)." },
  { id: 2, title: "Greatest Common Divisor", description: "Find GCD using Euclid's algorithm", objective: "What is GCD(48, 18)?", task: "gcd", n: 0, answer: 6, hint: "Euclid: GCD(a,b) = GCD(b, a mod b). GCD(48,18) = GCD(18, 48 mod 18 = 12) = GCD(12, 18 mod 12 = 6) = GCD(6, 0) = 6!", educationalNote: "GCD is the largest number that divides both. Euclid's algorithm is one of the oldest algorithms still in use (~300 BCE)!" },
  { id: 3, title: "Factorial", description: "Compute n! (n factorial)", objective: "What is 5!?", task: "factorial", n: 5, answer: 120, hint: "5! = 5 × 4 × 3 × 2 × 1 = 120. Factorial grows very fast! 10! = 3.6 million.", educationalNote: "n! counts permutations of n items. Used in combinatorics, probability, and algorithm analysis (e.g., traveling salesman is O(n!))." },
  { id: 4, title: "Prime Counting", description: "Count primes up to n using sieve", objective: "How many primes are there ≤ 50?", task: "sieve", n: 50, answer: 15, hint: "Primes ≤ 50: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47. Count them: 15 primes!", educationalNote: "Prime Number Theorem: π(n) ≈ n/ln(n). For n=50: 50/ln(50) ≈ 50/3.9 ≈ 12.8. Actual: 15. Approximation improves for large n." },
  { id: 5, title: "LCM via GCD", description: "Find LCM using the relationship: LCM(a,b) = (a×b)/GCD(a,b)", objective: "What is LCM(12, 18)?", task: "gcd", n: 0, answer: 36, hint: "GCD(12, 18) = 6. LCM = (12 × 18) / 6 = 216 / 6 = 36. Or: 12 = 2²×3, 18 = 2×3². LCM = 2²×3² = 4×9 = 36!", educationalNote: "LCM is the smallest number divisible by both. GCD and LCM are dual concepts. LCM(a,b) × GCD(a,b) = a × b." }
];

export default function MathMinigameEnhanced() {
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
    const correct = level.answer;
    if (parseInt(userAnswer) === correct) { const points = Math.max(10, 50 - attempts); setScore(points); setTotalScore(s => s + points); setGameState("won"); setFeedback(`🎉 Correct! Answer is ${correct}. +${points} points`); if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) setUnlockedLevels([...unlockedLevels, currentLevel + 1]); }
    else setFeedback(`❌ Incorrect! Try again.`);
  };

  const nextLevel = () => { if (currentLevel < levels.length - 1) setCurrentLevel(currentLevel + 1); };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4"><h3 className="text-white font-semibold text-lg">Math & Number Theory Challenge</h3><span className="text-[#8b949e] text-sm">Level {currentLevel + 1}/{levels.length}</span></div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><Trophy size={16} className="text-[#f0883e]" /><span className="text-white font-medium">{totalScore}</span></div>
      </div>
      <div className="flex gap-2 p-3 border-b border-[#30363d] bg-[#0d1117] overflow-x-auto">{levels.map((l, i) => (<button key={l.id} onClick={() => unlockedLevels.includes(i) && setCurrentLevel(i)} disabled={!unlockedLevels.includes(i)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${i === currentLevel ? "bg-[#58a6ff] text-white" : unlockedLevels.includes(i) ? "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]" : "bg-[#161b22] text-[#6e7681] cursor-not-allowed"}`}>{unlockedLevels.includes(i) ? (i < currentLevel ? <CheckCircle size={14} className="text-[#3fb950]" /> : <Unlock size={14} />) : <Lock size={14} />}Level {l.id}</button>))}</div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          <div className="mb-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg"><div className="flex items-start gap-3"><Target size={20} className="text-[#f0883e] mt-0.5" /><div><h4 className="text-white font-medium">{level.title}</h4><p className="text-[#8b949e] text-sm mt-1">{level.objective}</p></div></div></div>
          {level.task === "prime" && <div className="mb-4 p-3 bg-[#58a6ff]/10 rounded-lg"><div className="text-[#58a6ff]">Number to check: <span className="font-bold">{level.n}</span></div></div>}
          {level.task === "factorial" && <div className="mb-4 p-3 bg-[#58a6ff]/10 rounded-lg"><div className="text-[#58a6ff]">Compute: <span className="font-bold">{level.n}!</span></div></div>}
          {level.task === "sieve" && <div className="mb-4 p-3 bg-[#58a6ff]/10 rounded-lg"><div className="text-[#58a6ff]">Count primes up to: <span className="font-bold">{level.n}</span></div></div>}
          <div className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg"><div className="flex gap-2"><input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Enter answer" className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white placeholder-[#6e7681] focus:border-[#58a6ff] focus:outline-none" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} /><button onClick={handleSubmit} disabled={gameState === "won"} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] text-white rounded-lg font-medium flex items-center gap-2"><Hash size={16} /> Check</button></div></div>
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
