"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface MathStep {
  step: number;
  action: string;
  n: number;
  isPrime: boolean;
  factors: number[];
  gcd: number;
  lcm: number;
  highlightLines: number[];
  description: string;
  operation: string;
}

const mathSteps: MathStep[] = [
  { step: 0, action: "init", n: 48, isPrime: false, factors: [], gcd: 0, lcm: 0, highlightLines: [1, 2], description: "Math & Number Theory: Prime checking, GCD, LCM, Factorization.", operation: "Overview" },
  { step: 1, action: "prime-check", n: 48, isPrime: false, factors: [], gcd: 0, lcm: 0, highlightLines: [3, 4], description: "Is 48 prime? Check divisors up to √48 ≈ 7. 48 is even → NOT prime.", operation: "Prime Check" },
  { step: 2, action: "factor", n: 48, isPrime: false, factors: [2, 2, 2, 2, 3], gcd: 0, lcm: 0, highlightLines: [5, 6], description: "Prime factorization: 48 = 2⁴ × 3 = 16 × 3.", operation: "Factorization" },
  { step: 3, action: "gcd", n: 48, isPrime: false, factors: [2, 2, 2, 2, 3], gcd: 12, lcm: 0, highlightLines: [7, 8], description: "GCD(48, 180): Using Euclidean algorithm. 180 = 3×48 + 36, 48 = 1×36 + 12, 36 = 3×12 + 0. GCD = 12.", operation: "GCD" },
  { step: 4, action: "lcm", n: 48, isPrime: false, factors: [2, 2, 2, 2, 3], gcd: 12, lcm: 720, highlightLines: [9, 10], description: "LCM(48, 180) = (48 × 180) / GCD(48, 180) = 8640 / 12 = 720.", operation: "LCM" },
  { step: 5, action: "sieve", n: 30, isPrime: false, factors: [], gcd: 0, lcm: 0, highlightLines: [11, 12], description: "Sieve of Eratosthenes: Find all primes up to 30. Cross out multiples of 2, 3, 5.", operation: "Sieve" },
  { step: 6, action: "complete", n: 30, isPrime: false, factors: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29], gcd: 0, lcm: 0, highlightLines: [13, 14], description: "Primes ≤ 30: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29. Time: O(n log log n).", operation: "Complete" },
];

export default function MathVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => { setTotalSteps(mathSteps.length); }, [setTotalSteps]);
  useEffect(() => { const step = mathSteps[currentStep]; if (step) setActiveLines(step.highlightLines); }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleStep = useCallback((dir: "next" | "prev") => dir === "next" ? nextStep() : prevStep(), [nextStep, prevStep]);
  const step = mathSteps[currentStep] || mathSteps[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Math & Number Theory Visualizer</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">{isPlaying ? "Pause" : "Play"}</button>
          <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Prev</button>
          <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden flex flex-col items-center justify-center gap-6">
        {/* Operation display */}
        <div className="text-center">
          <span className="text-[#8b949e] text-sm">Operation:</span>
          <div className="text-[#f0883e] font-mono text-3xl font-bold mt-1">{step.operation}</div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          {step.n > 0 && step.operation !== "Complete" && (
            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg text-center">
              <span className="text-[#8b949e] text-sm block">Number</span>
              <span className="text-[#58a6ff] font-mono text-2xl font-bold">{step.n}</span>
            </div>
          )}
          {step.gcd > 0 && (
            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg text-center">
              <span className="text-[#8b949e] text-sm block">GCD</span>
              <span className="text-[#238636] font-mono text-2xl font-bold">{step.gcd}</span>
            </div>
          )}
          {step.lcm > 0 && (
            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg text-center">
              <span className="text-[#8b949e] text-sm block">LCM</span>
              <span className="text-[#8957e5] font-mono text-2xl font-bold">{step.lcm}</span>
            </div>
          )}
          {step.factors.length > 0 && step.operation !== "Complete" && (
            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg text-center">
              <span className="text-[#8b949e] text-sm block">Factors</span>
              <span className="text-[#f0883e] font-mono text-lg">{step.factors.join(" × ")}</span>
            </div>
          )}
        </div>

        {/* Formula display */}
        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <span className="text-[#8b949e] text-sm block mb-2">Formula:</span>
          <code className="text-[#58a6ff] font-mono text-lg">
            {step.operation === "GCD" && "gcd(a,b) = gcd(b, a mod b)"}
            {step.operation === "LCM" && "lcm(a,b) = (a × b) / gcd(a,b)"}
            {step.operation === "Prime Check" && "Check i from 2 to √n"}
            {step.operation === "Factorization" && "n = p₁^a₁ × p₂^a₂ × ..."}
            {step.operation === "Sieve" && "Cross out multiples of each prime"}
            {step.operation === "Complete" && "Sieve: O(n log log n) time"}
          </code>
        </div>

        <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <p className="text-white">{step.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#8b949e]">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>Action: <span className="text-[#58a6ff]">{step.action.toUpperCase()}</span></span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
