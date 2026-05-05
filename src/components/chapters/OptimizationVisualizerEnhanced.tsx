"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Play, RotateCcw, CheckCircle, ArrowRight,
  Zap, Trash2, Repeat, Hash
} from "lucide-react";

interface Optimization {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const optimizations: Optimization[] = [
  { id: "fold", name: "Constant Folding", description: "Evaluate constants at compile time", icon: <Hash size={16} /> },
  { id: "prop", name: "Constant Propagation", description: "Substitute known constant values", icon: <ArrowRight size={16} /> },
  { id: "dce", name: "Dead Code Elimination", description: "Remove unused code", icon: <Trash2 size={16} /> },
  { id: "unroll", name: "Loop Unrolling", description: "Reduce loop overhead", icon: <Repeat size={16} /> },
];

const sampleCode = [
  { line: 1, original: "x = 5", optimized: "// folded", applied: false },
  { line: 2, original: "y = x * 2", optimized: "y = 10", applied: false },
  { line: 3, original: "z = y + 3", optimized: "z = 13", applied: false },
  { line: 4, original: "unused = 42", optimized: "// eliminated", applied: false },
  { line: 5, original: "for i in range(3):", optimized: "i = 0; i = 1; i = 2", applied: false },
];

export default function OptimizationVisualizerEnhanced() {
  const [code, setCode] = useState(sampleCode);
  const [activeOpt, setActiveOpt] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const reset = () => {
    setCode(sampleCode);
    setActiveOpt(null);
    setStep(0);
  };

  const applyOptimization = (optId: string) => {
    setActiveOpt(optId);
    setStep(s => s + 1);
    
    setTimeout(() => {
      setCode(prev => {
        switch (optId) {
          case "fold":
            return prev.map((line, i) => i === 0 ? { ...line, optimized: "// x = 5 (constant)", applied: true } : line);
          case "prop":
            return prev.map((line, i) => i === 1 ? { ...line, optimized: "y = 10", applied: true } : line);
          case "dce":
            return prev.map((line, i) => i === 3 ? { ...line, optimized: "// removed - unused", applied: true } : line);
          case "unroll":
            return prev.map((line, i) => i === 4 ? { ...line, optimized: "i=0; print(); i=1; print(); i=2; print();", applied: true } : line);
          default:
            return prev;
        }
      });
      setActiveOpt(null);
    }, 800);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#3fb950]/20 rounded-lg">
            <Sparkles size={20} className="text-[#3fb950]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Optimization Pipeline</h3>
            <p className="text-[#8b949e] text-sm">Apply compiler optimizations</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Code Panel */}
        <div className="w-1/2 flex flex-col border-r border-[#30363d]">
          <div className="p-3 border-b border-[#30363d] bg-[#161b22]">
            <span className="text-[#8b949e] text-xs">Code</span>
          </div>
          <div className="flex-1 p-4 font-mono text-sm overflow-auto">
            {code.map((line, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-4 py-1"
                animate={line.applied ? { backgroundColor: "rgba(35, 134, 54, 0.1)" } : {}}
              >
                <span className="text-[#6e7681] w-6">{line.line}</span>
                <span className={line.applied ? "text-[#6e7681] line-through" : "text-[#c9d1d9]"}>
                  {line.original}
                </span>
                {line.applied && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[#3fb950]"
                  >
                    → {line.optimized}
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Optimizations Panel */}
        <div className="w-1/2 flex flex-col p-4">
          <div className="text-[#8b949e] text-xs mb-3">Available Optimizations</div>
          <div className="space-y-2">
            {optimizations.map((opt) => (
              <motion.button
                key={opt.id}
                onClick={() => applyOptimization(opt.id)}
                disabled={activeOpt !== null}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  activeOpt === opt.id
                    ? "bg-[#f0883e]/20 border-[#f0883e]"
                    : "bg-[#21262d] border-[#30363d] hover:bg-[#30363d]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#8b949e]">{opt.icon}</span>
                  <span className="text-white font-medium">{opt.name}</span>
                </div>
                <div className="text-[#8b949e] text-xs mt-1">{opt.description}</div>
              </motion.button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-[#161b22] rounded-lg border border-[#30363d]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#8b949e]">Optimizations Applied</span>
              <span className="text-[#3fb950] font-bold">{step} / {optimizations.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg font-medium transition-colors"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
}
