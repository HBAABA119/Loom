"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft, ChevronRight, Hash, Calculator } from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Step { step: number; title: string; description: string; codeLines: number[]; n: number; currentDivisor: number; isPrime: boolean | null; checked: number[]; primes: number[]; explanation: string; theoryConnection: string; complexity: string; }

const speeds = [{ label: "0.5x", value: 0.5 }, { label: "1x", value: 1 }, { label: "1.5x", value: 1.5 }, { label: "2x", value: 2 }, { label: "3x", value: 3 }];

const codeLines = ["// Sieve of Eratosthenes - Find all primes up to n", "function sieve(n) {", "  const isPrime = new Array(n + 1).fill(true);", "  isPrime[0] = isPrime[1] = false;", "", "  for (let i = 2; i * i <= n; i++) {", "    if (isPrime[i]) {", "      // Mark all multiples of i as not prime", "      for (let j = i * i; j <= n; j += i) {", "        isPrime[j] = false;", "      }", "    }", "  }", "", "  // Collect all primes", "  const primes = [];", "  for (let i = 2; i <= n; i++) {", "    if (isPrime[i]) primes.push(i);", "  }", "", "  return primes;", "}"];

const generateSteps = (): Step[] => [
  { step: 0, title: "Prime Numbers & Sieve", description: "Find all prime numbers up to n using the Sieve of Eratosthenes.", codeLines: [1, 2, 3], n: 30, currentDivisor: 0, isPrime: null, checked: [], primes: [], explanation: "Prime numbers have exactly two divisors: 1 and themselves. The Sieve of Eratosthenes is an ancient algorithm to find all primes up to n. Time complexity: O(n log log n) - nearly linear!", theoryConnection: "Sieve invented by Eratosthenes of Cyrene (~200 BCE). Fundamental theorem of arithmetic: every integer > 1 is either prime or unique product of primes. Used in: cryptography (RSA), hashing, random number generation.", complexity: "Sieve: O(n log log n) time, O(n) space. Trial division: O(√n) per check." },
  { step: 1, title: "Initialize Array", description: "Create array of size n+1, mark all as potentially prime.", codeLines: [2, 3, 4], n: 30, currentDivisor: 0, isPrime: null, checked: [], primes: [], explanation: "Initialize boolean array isPrime[0..n] = true. Mark 0 and 1 as not prime (base cases). Start checking from 2. The algorithm will iteratively mark multiples as composite.", theoryConnection: "0 and 1 are not prime by definition. Prime numbers start at 2 (the only even prime). Array representation allows O(1) marking and lookup.", complexity: "Initialization: O(n) time and space." },
  { step: 2, title: "Start with p = 2", description: "First prime number. Mark all multiples of 2 as composite.", codeLines: [6, 7, 8, 9], n: 30, currentDivisor: 2, isPrime: true, checked: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30], primes: [2], explanation: "2 is prime. Mark multiples: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30. All even numbers > 2 are composite. Optimization: start marking from p² = 4 (smaller multiples already marked).", theoryConnection: "2 is the only even prime. All other even numbers are divisible by 2, so composite. Starting from p²: any multiple k·p where k < p was already marked by k's prime factors.", complexity: "For prime p, marks n/p numbers. Total work: n/2 + n/3 + n/5 + ... = O(n log log n)." },
  { step: 3, title: "p = 3", description: "3 is prime. Mark all multiples of 3 as composite.", codeLines: [6, 7, 8, 9], n: 30, currentDivisor: 3, isPrime: true, checked: [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 26, 27, 28, 30], primes: [2, 3], explanation: "3 is prime. Mark multiples starting from 9 (3²): 9, 12, 15, 18, 21, 24, 27, 30. Some already marked by 2. After this step, all multiples of 2 and 3 are marked.", theoryConnection: "3 is prime. Multiples of 3: 3k for k ≥ 2. 6, 12, 18... already marked. New marks: 9, 15, 21, 27. Cross-pattern with 2 creates interesting visual.", complexity: "n/3 new marks. Running total: ~n(1/2 + 1/3)." },
  { step: 4, title: "p = 4 - Skip (Already Marked)", description: "4 is composite (marked by 2), so skip.", codeLines: [7], n: 30, currentDivisor: 4, isPrime: false, checked: [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 26, 27, 28, 30], primes: [2, 3], explanation: "4 is already marked as composite (2×2). No need to process. This is the key optimization - we only process primes, not composites. Skip and move to 5.", theoryConnection: "Composite numbers don't need processing because their multiples were already marked by their prime factors. Example: 4 = 2², so 4's multiples are also 2's multiples.", complexity: "Skip composites in O(1). Only primes cost O(n/p)." },
  { step: 5, title: "p = 5", description: "5 is prime. Mark multiples starting from 25.", codeLines: [6, 7, 8, 9], n: 30, currentDivisor: 5, isPrime: true, checked: [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30], primes: [2, 3, 5], explanation: "5 is prime. Start from 5² = 25 (already marked: 10, 15, 20, 30). Mark 25. 30 already marked. After p = 5, we stop because 5² = 25 ≤ 30, but next prime 7 has 7² = 49 > 30.", theoryConnection: "Only need to check p where p² ≤ n. If n has a factor > √n, the complementary factor must be < √n. So we found it already. This bounds outer loop to √n iterations.", complexity: "Outer loop runs √n times. Marks total: O(n log log n)." },
  { step: 6, title: "Collect Primes", description: "Iterate through array, collect all indices still marked as prime.", codeLines: [16, 17, 18, 19, 20], n: 30, currentDivisor: 0, isPrime: null, checked: [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30], primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29], explanation: "Final sweep: collect all i where isPrime[i] = true. Primes up to 30: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29. Total: 10 primes. Sieve complete!", theoryConnection: "π(n) ≈ n/ln(n) (Prime Number Theorem). For n=30: 30/ln(30) ≈ 30/3.4 ≈ 8.8. Actual: 10. Approximation improves for large n. Count of primes up to n.", complexity: "Collection: O(n). Overall Sieve: O(n log log n)." },
];

export default function MathVisualizerEnhanced() {
  const { currentStep: stepIndex, totalSteps, isPlaying, playbackSpeed, togglePlay, pause, setStep, nextStep, prevStep, setTotalSteps, setPlaybackSpeed } = useTimeline();
  const { setActiveLines } = useCodeHighlight();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => { setTotalSteps(generateSteps().length); }, [setTotalSteps]);
  useEffect(() => { setCurrentStep(stepIndex); }, [stepIndex]);
  const steps = generateSteps();
  const step = steps[currentStep] || steps[0];
  useEffect(() => { if (step?.codeLines) setActiveLines(step.codeLines); }, [step, setActiveLines]);
  useEffect(() => { let interval: NodeJS.Timeout; if (isPlaying && currentStep < steps.length - 1) { interval = setInterval(() => nextStep(), 2500 / playbackSpeed); } else if (currentStep >= steps.length - 1 && isPlaying) pause(); return () => clearInterval(interval); }, [isPlaying, currentStep, steps.length, playbackSpeed, nextStep, pause]);
  const handleReset = useCallback(() => { pause(); setStep(0); }, [pause, setStep]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div><h3 className="text-white font-semibold text-lg">Prime Numbers & Sieve</h3><p className="text-[#8b949e] text-sm">Sieve of Eratosthenes | π(n) ≈ n/ln(n)</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><Hash size={14} className="text-[#58a6ff]" /><span className="text-[#8b949e] text-xs">Primes:</span><span className="text-[#3fb950] font-bold">{step.primes.length}</span></div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full"><div className="h-full bg-[#58a6ff] rounded-full transition-all" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} /></div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: step.n }, (_, i) => i + 1).map(n => {
                const isChecked = step.checked.includes(n);
                const isPrime = step.primes.includes(n);
                const isCurrent = n === step.currentDivisor;
                return (
                  <motion.div key={n} initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${isPrime ? "bg-[#3fb950] text-white" : isChecked ? "bg-[#f85149]/30 text-[#f85149] line-through" : isCurrent ? "bg-[#f0883e] text-white ring-2 ring-white" : "bg-[#21262d] text-[#c9d1d9]"}`}>
                    {n}
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]"><span className="text-[#8b949e] text-xs">Range</span><p className="text-white font-bold text-lg">1 to {step.n}</p></div>
            <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]"><span className="text-[#8b949e] text-xs">Found Primes</span><p className="text-[#3fb950] font-bold text-lg">{step.primes.length}</p></div>
            <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]"><span className="text-[#8b949e] text-xs">Current</span><p className="text-[#f0883e] font-bold text-lg">{step.currentDivisor || "-"}</p></div>
          </div>
        </div>
        <div className="w-96 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-5 border-b border-[#30363d]"><span className="text-[#58a6ff] text-xs font-mono uppercase tracking-wider">Step {currentStep + 1}: {step.title}</span><p className="text-[#c9d1d9] mt-3 leading-relaxed">{step.description}</p></div>
          <div className="p-5 border-b border-[#30363d] flex-1 overflow-y-auto"><h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">What is Happening</h4><p className="text-[#c9d1d9] text-sm leading-relaxed mb-4">{step.explanation}</p><div className="mt-4 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg"><h4 className="text-[#3fb950] text-xs uppercase tracking-wider mb-1">💡 Theory Connection</h4><p className="text-[#c9d1d9] text-sm leading-relaxed">{step.theoryConnection}</p></div><div className="mt-4 p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg"><h4 className="text-[#58a6ff] text-xs uppercase tracking-wider mb-1">⏱️ Complexity</h4><p className="text-[#c9d1d9] text-sm font-mono">{step.complexity}</p></div></div>
          <div className="p-4 bg-[#0d1117] max-h-56 overflow-y-auto"><h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">Code Reference</h4><div className="text-xs font-mono">{codeLines.map((line, i) => (<div key={i} className={`px-2 py-0.5 rounded ${step.codeLines?.includes(i + 1) ? "bg-[#238636]/30 text-[#7ee787] border-l-2 border-[#238636]" : "text-[#8b949e]"}`}><span className="text-[#6e7681] w-6 inline-block select-none">{i + 1}</span>{line || " "}</div>))}</div></div>
        </div>
      </div>
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><button onClick={() => { pause(); setStep(0); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><SkipBack size={18} /></button><button onClick={prevStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><ChevronLeft size={20} /></button><button onClick={togglePlay} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center gap-2">{isPlaying ? <Pause size={18} /> : <Play size={18} />}{isPlaying ? "Pause" : "Play"}</button><button onClick={nextStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><ChevronRight size={20} /></button><button onClick={() => { pause(); setStep(steps.length - 1); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><SkipForward size={18} /></button><button onClick={handleReset} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><RotateCcw size={18} /></button></div>
          <div className="flex items-center gap-3"><span className="text-[#8b949e] text-sm">Speed:</span><div className="flex gap-1">{speeds.map(s => <button key={s.value} onClick={() => setPlaybackSpeed(s.value)} className={`px-2 py-1 rounded text-xs font-medium ${playbackSpeed === s.value ? "bg-[#58a6ff] text-white" : "bg-[#21262d] text-[#8b949e]"}`}>{s.label}</button>)}</div></div>
        </div>
      </div>
    </div>
  );
}
