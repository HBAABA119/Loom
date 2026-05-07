"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft, ChevronRight, BarChart2 } from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Step { step: number; title: string; description: string; codeLines: number[]; array: number[]; tree: number[]; queryIndex: number; explanation: string; theoryConnection: string; complexity: string; }

const speeds = [{ label: "0.5x", value: 0.5 }, { label: "1x", value: 1 }, { label: "1.5x", value: 1.5 }, { label: "2x", value: 2 }, { label: "3x", value: 3 }];

const codeLines = ["// Fenwick Tree (Binary Indexed Tree)", "class FenwickTree {", "  constructor(n) { this.n = n; this.tree = new Array(n + 1).fill(0); }", "", "  // Add value at index i", "  update(i, delta) {", "    while (i <= this.n) {", "      this.tree[i] += delta;", "      i += i & -i;  // Add lowest set bit", "    }", "  }", "", "  // Sum of [1, i]", "  query(i) {", "    let sum = 0;", "    while (i > 0) {", "      sum += this.tree[i];", "      i -= i & -i;  // Remove lowest set bit", "    }", "    return sum;", "  }", "}"];

const array = [0, 3, 2, -1, 6, 5, 4, -3, 3, 7, 2]; // 1-indexed

const buildFenwick = (arr: number[]): number[] => {
  const n = arr.length - 1;
  const tree = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) { let j = i; while (j <= n) { tree[j] += arr[i]; j += j & -j; } }
  return tree;
};

const generateSteps = (): Step[] => [
  { step: 0, title: "Fenwick Tree (Binary Indexed Tree)", description: "Space-efficient structure for prefix sums and point updates.", codeLines: [1, 2, 3], array: [...array], tree: buildFenwick(array), queryIndex: -1, explanation: "Fenwick Tree (BIT) supports point updates and prefix sum queries in O(log n). Uses O(n) space. Elegant bitwise operations for tree traversal.", theoryConnection: "Fenwick trees use the observation that any number can be represented as sum of powers of 2. Each tree node stores sum of a range whose size is the lowest set bit of its index.", complexity: "Build: O(n log n) or O(n). Update: O(log n). Query: O(log n). Space: O(n)." },
  { step: 1, title: "Tree Structure", description: "Each index stores sum of a range determined by its lowest set bit.", codeLines: [2, 3], array: [...array], tree: buildFenwick(array), queryIndex: -1, explanation: "Tree[i] stores sum of range [i - 2^r + 1, i] where r is position of lowest set bit. Ex: index 12 (1100₂), lowest bit = 4, stores sum of [9,12].", theoryConnection: "The key insight: i & -i isolates lowest set bit. This determines range size. Parent of i is i + (i & -i). Clever use of two's complement.", complexity: "Index i stores sum of range of size (i & -i) ending at i." },
  { step: 2, title: "Query Prefix Sum [1, 7]", description: "Sum elements from 1 to 7 using tree.", codeLines: [12, 13, 14, 15, 16, 17, 18], array: [...array], tree: buildFenwick(array), queryIndex: 7, explanation: "Query(7): 7 = 111₂. Sum tree[7], then 7 - (7&-7) = 6. Sum tree[6], then 6 - (6&-6) = 4. Sum tree[4], then 4 - (4&-4) = 0. Stop. Total = tree[7] + tree[6] + tree[4].", theoryConnection: "We decompose range [1,i] into O(log n) disjoint ranges, each represented by one tree node. Each step removes lowest set bit, jumping to next relevant node.", complexity: "At most log₂(n) + 1 nodes visited. For n=7, visited 3 nodes." },
  { step: 3, title: "Update index 3 by +5", description: "Add 5 to array[3], propagate to ancestors.", codeLines: [5, 6, 7, 8, 9, 10], array: array.map((v, i) => i === 3 ? v + 5 : v), tree: buildFenwick(array.map((v, i) => i === 3 ? v + 5 : v)), queryIndex: 3, explanation: "Update(3, +5): Update tree[3], then 3 + (3&-3) = 4. Update tree[4], then 4 + (4&-4) = 8. Update tree[8], then 8 + (8&-8) = 16 > n. Stop.", theoryConnection: "Update affects all ancestors in tree. Each step adds lowest set bit to reach next ancestor. At most log n nodes updated.", complexity: "Updated tree[3], tree[4], tree[8]. 3 nodes = O(log n)." },
  { step: 4, title: "Range Query [3, 7]", description: "Sum from index 3 to 7 = query(7) - query(2).", codeLines: [12, 13], array: [...array], tree: buildFenwick(array), queryIndex: 7, explanation: "Range [3,7] = prefix(7) - prefix(2). query(7) visits 7,6,4. query(2) visits 2. Result = (tree[7]+tree[6]+tree[4]) - tree[2].", theoryConnection: "Any range sum [l,r] = prefix(r) - prefix(l-1). Two prefix queries, each O(log n). Total O(log n) for range sum.", complexity: "Two prefix queries: 2 × O(log n) = O(log n)." },
  { step: 5, title: "Why Fenwick Over Segment Tree?", description: "Fenwick uses half the space and has better constant factors.", codeLines: [1, 2], array: [...array], tree: buildFenwick(array), queryIndex: -1, explanation: "Fenwick: O(n) space, simpler code, faster in practice. Segment Tree: O(2n) or O(4n) space, more flexible (range updates). Fenwick preferred for simple prefix sums.", theoryConnection: "Fenwick is more space-efficient than segment tree (n vs 4n). Both O(log n) operations, but Fenwick has smaller constant. Segment tree needed for range updates/min/max.", complexity: "Fenwick: ~2× faster, 4× less space than segment tree for basic operations." },
];

export default function FenwickTreeVisualizerEnhanced() {
  const { currentStep: stepIndex, totalSteps, isPlaying, playbackSpeed, togglePlay, pause, setStep, nextStep, prevStep, setTotalSteps, setPlaybackSpeed } = useTimeline();
  
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => { setTotalSteps(generateSteps().length); }, [setTotalSteps]);
  useEffect(() => { setCurrentStep(stepIndex); }, [stepIndex]);
  const steps = generateSteps();
  const step = steps[currentStep] || steps[0];
  useEffect(() => { if (step?.codeLines) setActiveLines(step.codeLines); }, [step]);
  useEffect(() => { let interval: NodeJS.Timeout; if (isPlaying && currentStep < steps.length - 1) { interval = setInterval(() => nextStep(), 2500 / playbackSpeed); } else if (currentStep >= steps.length - 1 && isPlaying) pause(); return () => clearInterval(interval); }, [isPlaying, currentStep, steps.length, playbackSpeed, nextStep, pause]);
  const handleReset = useCallback(() => { pause(); setStep(0); }, [pause, setStep]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div><h3 className="text-white font-semibold text-lg">Fenwick Tree (BIT)</h3><p className="text-[#8b949e] text-sm">Prefix Sums | O(log n) | O(n) Space</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><BarChart2 size={14} className="text-[#58a6ff]" /><span className="text-[#8b949e] text-xs">Query idx:</span><span className="text-[#f0883e] font-bold">{step.queryIndex > 0 ? step.queryIndex : "-"}</span></div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full"><div className="h-full bg-[#58a6ff] rounded-full transition-all" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} /></div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          {step.queryIndex > 0 && <div className="mb-4 p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg text-center"><span className="text-[#f0883e] font-bold">Query: index {step.queryIndex}</span></div>}
          <div className="flex-1 flex flex-col justify-center gap-8">
            <div><h4 className="text-[#8b949e] text-sm mb-2">Original Array (1-indexed):</h4><div className="flex gap-2">{step.array.slice(1).map((v, i) => (<div key={i} className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold ${i + 1 === step.queryIndex ? "border-[#f0883e] bg-[#f0883e]/20 text-[#f0883e]" : "border-[#30363d] bg-[#21262d] text-[#c9d1d9]"}`}><span className="text-xs text-[#6e7681] absolute -mt-8">{i + 1}</span>{v}</div>))}</div></div>
            <div><h4 className="text-[#8b949e] text-sm mb-2">Fenwick Tree:</h4><div className="flex gap-2">{step.tree.slice(1).map((v, i) => (<motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold ${i + 1 === step.queryIndex ? "border-[#3fb950] bg-[#3fb950]/20 text-[#3fb950]" : "border-[#30363d] bg-[#21262d] text-[#c9d1d9]"}`}><span className="text-xs text-[#6e7681] absolute -mt-8">{i + 1}</span>{v}</motion.div>))}</div></div>
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
