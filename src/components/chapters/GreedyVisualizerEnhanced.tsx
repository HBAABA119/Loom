"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft, ChevronRight, Coins, TrendingUp } from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Item { id: number; weight: number; value: number; ratio: number; selected?: boolean; }
interface Step { step: number; title: string; description: string; codeLines: number[]; items: Item[]; capacity: number; currentWeight: number; currentValue: number; explanation: string; theoryConnection: string; complexity: string; }

const speeds = [{ label: "0.5x", value: 0.5 }, { label: "1x", value: 1 }, { label: "1.5x", value: 1.5 }, { label: "2x", value: 2 }, { label: "3x", value: 3 }];

const codeLines = ["// Greedy Algorithm: Fractional Knapsack", "function fractionalKnapsack(items, capacity) {", "  // Sort by value/weight ratio (descending)", "  items.sort((a, b) => (b.value/b.weight) - (a.value/a.weight));", "", "  let totalValue = 0;", "  let remaining = capacity;", "", "  for (const item of items) {", "    if (remaining >= item.weight) {", "      // Take whole item", "      totalValue += item.value;", "      remaining -= item.weight;", "    } else {", "      // Take fraction of item", "      const fraction = remaining / item.weight;", "      totalValue += item.value * fraction;", "      break;  // Knapsack full", "    }", "  }", "", "  return totalValue;", "}"];

const items: Item[] = [{ id: 1, weight: 10, value: 60, ratio: 6 }, { id: 2, weight: 20, value: 100, ratio: 5 }, { id: 3, weight: 30, value: 120, ratio: 4 }];

const generateSteps = (): Step[] => [
  { step: 0, title: "Greedy Algorithms", description: "Make locally optimal choices at each step, hoping for global optimum.", codeLines: [1, 2, 3], items: items.map(i => ({ ...i })), capacity: 50, currentWeight: 0, currentValue: 0, explanation: "Greedy algorithms make the best immediate choice without considering future consequences. Works for some problems (MST, fractional knapsack) but not others (0/1 knapsack).", theoryConnection: "Greedy choice property: a globally optimal solution can be reached by making locally optimal choices. Proving this is key to showing greedy works. Used in: Huffman coding, Dijkstra's, MST algorithms.", complexity: "Usually O(n log n) due to sorting. Sometimes O(n) if pre-sorted." },
  { step: 1, title: "Fractional Knapsack Problem", description: "Maximize value in knapsack, can take fractions of items.", codeLines: [2, 3, 4], items: items.map(i => ({ ...i })), capacity: 50, currentWeight: 0, currentValue: 0, explanation: "Unlike 0/1 knapsack (DP), fractional knapsack allows taking portions of items. Key insight: take items with highest value/weight ratio first. Greedy works here!", theoryConnection: "Fractional knapsack has greedy choice property. If we don't take max ratio item first, we can always swap to improve solution. Proof by exchange argument.", complexity: "Sort O(n log n) + iterate O(n) = O(n log n) total." },
  { step: 2, title: "Calculate Value/Weight Ratios", description: "Compute value per unit weight for each item.", codeLines: [3, 4], items: [{ ...items[0], ratio: 6 }, { ...items[1], ratio: 5 }, { ...items[2], ratio: 4 }], capacity: 50, currentWeight: 0, currentValue: 0, explanation: "Item 1: 60/10 = 6 per unit. Item 2: 100/20 = 5 per unit. Item 3: 120/30 = 4 per unit. Higher ratio = more value per weight. Sort descending by ratio.", theoryConnection: "Ratio determines priority. We want maximum bang for buck. This local optimization leads to global optimum for fractional knapsack.", complexity: "O(n) to compute all ratios." },
  { step: 3, title: "Sort by Ratio (Descending)", description: "Item 1 (ratio 6) → Item 2 (ratio 5) → Item 3 (ratio 4).", codeLines: [3, 4], items: [{ ...items[0], ratio: 6 }, { ...items[1], ratio: 5 }, { ...items[2], ratio: 4 }], capacity: 50, currentWeight: 0, currentValue: 0, explanation: "Sorted order: Item 1 (60/10=6), Item 2 (100/20=5), Item 3 (120/30=4). We'll process in this order, taking as much as possible of each.", theoryConnection: "Sorting is the overhead. After sorting, greedy choice is simple: always take from best available item. This is why fractional knapsack is easier than 0/1 knapsack.", complexity: "Sorting dominates: O(n log n)." },
  { step: 4, title: "Take Item 1 (Complete)", description: "Item 1 weight 10 ≤ remaining 50. Take all of it. Value += 60.", codeLines: [9, 10, 11, 12], items: [{ ...items[0], selected: true }, items[1], items[2]], capacity: 50, currentWeight: 10, currentValue: 60, explanation: "Item 1 fits completely (10 ≤ 50). Take all: +60 value, -10 capacity. Remaining: 40. Current value: 60. Next: Item 2.", theoryConnection: "Greedy choice: always take from highest ratio available. Item 1 is best value/weight, so we take all of it first. No regret - this is optimal.", complexity: "O(1) to add item." },
  { step: 5, title: "Take Item 2 (Complete)", description: "Item 2 weight 20 ≤ remaining 40. Take all. Value += 100.", codeLines: [9, 10, 11, 12], items: [{ ...items[0], selected: true }, { ...items[1], selected: true }, items[2]], capacity: 50, currentWeight: 30, currentValue: 160, explanation: "Item 2 fits (20 ≤ 40). Take all: +100 value, -20 capacity. Remaining: 20. Current value: 160. Next: Item 3 (weight 30, but only 20 left).", theoryConnection: "Still following greedy: Item 2 has next best ratio. Take all. Two items down, one to go. 30/50 capacity used.", complexity: "O(1) to add item. Total so far: O(n)." },
  { step: 6, title: "Take Fraction of Item 3", description: "Item 3 weight 30 > remaining 20. Take 20/30 = 2/3 of it.", codeLines: [14, 15, 16, 17], items: [{ ...items[0], selected: true }, { ...items[1], selected: true }, { ...items[2], selected: true }], capacity: 50, currentWeight: 50, currentValue: 240, explanation: "Item 3 doesn't fit (30 > 20). Take fraction: 20/30 = 2/3. Value: 120 × 2/3 = 80. Total: 60 + 100 + 80 = 240. Knapsack full!", theoryConnection: "Taking fraction is key advantage over 0/1 knapsack. We can always fill capacity completely, maximizing value. Greedy is optimal here.", complexity: "Final item may be fractional. O(1) calculation." },
  { step: 7, title: "Optimal Solution Found!", description: "Maximum value = 240. Knapsack contains items 1, 2, and 2/3 of item 3.", codeLines: [20, 21], items: [{ ...items[0], selected: true }, { ...items[1], selected: true }, { ...items[2], selected: true }], capacity: 50, currentWeight: 50, currentValue: 240, explanation: "Optimal: 100% of Item 1 (60) + 100% of Item 2 (100) + 66.7% of Item 3 (80) = 240. Weight exactly 50. Greedy choice at each step led to global optimum!", theoryConnection: "Proof of optimality: Suppose better solution exists. It must have same or less of highest ratio items. But any deviation can be improved by swapping to higher ratio items. Contradiction!", complexity: "Optimal value: 240. Time: O(n log n). Space: O(n)." },
  { step: 8, title: "When Greedy Fails: 0/1 Knapsack", description: "Greedy fails for 0/1 knapsack - must use DP instead.", codeLines: [1, 2], items: [{ id: 1, weight: 10, value: 60, ratio: 6 }, { id: 2, weight: 20, value: 100, ratio: 5 }, { weight: 30, value: 120, ratio: 4 } as Item], capacity: 50, currentWeight: 0, currentValue: 0, explanation: "0/1 knapsack: can't take fractions. Greedy picks 1+2 = 160 value. But optimal is 2+3 = 220 value! Greedy fails because it can't see future consequences. Use DP for 0/1 knapsack.", theoryConnection: "Greedy choice property doesn't hold for 0/1 knapsack. Taking highest ratio item first may prevent better combination. No exchange argument possible. Must explore all combinations via DP.", complexity: "0/1 knapsack needs DP: O(n × W). Greedy gives suboptimal solution." },
];

export default function GreedyVisualizerEnhanced() {
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
        <div><h3 className="text-white font-semibold text-lg">Greedy Algorithms</h3><p className="text-[#8b949e] text-sm">Local Optimum → Global Optimum | Fractional Knapsack</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><Coins size={14} className="text-[#58a6ff]" /><span className="text-[#8b949e] text-xs">Value:</span><span className="text-[#3fb950] font-bold">{step.currentValue}</span></div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full"><div className="h-full bg-[#58a6ff] rounded-full transition-all" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} /></div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]"><span className="text-[#8b949e] text-xs">Capacity</span><p className="text-white font-bold text-lg">{step.capacity}</p></div>
            <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]"><span className="text-[#8b949e] text-xs">Used</span><p className="text-[#f0883e] font-bold text-lg">{step.currentWeight}</p></div>
            <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]"><span className="text-[#8b949e] text-xs">Remaining</span><p className="text-[#3fb950] font-bold text-lg">{step.capacity - step.currentWeight}</p></div>
          </div>
          <div className="flex-1">
            <h4 className="text-[#8b949e] text-sm mb-3">Items (sorted by value/weight ratio):</h4>
            <div className="space-y-3">{step.items.map((item, i) => (<motion.div key={item.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className={`p-4 rounded-lg border-2 ${item.selected ? "border-[#3fb950] bg-[#3fb950]/10" : "border-[#30363d] bg-[#21262d]"}`}><div className="flex items-center justify-between"><div className="flex items-center gap-4"><span className="text-white font-bold">Item {item.id}</span><div className="text-sm text-[#8b949e]">Weight: <span className="text-[#c9d1d9]">{item.weight}</span> | Value: <span className="text-[#c9d1d9]">{item.value}</span></div></div><div className={`px-3 py-1 rounded-lg text-sm font-bold ${item.selected ? "bg-[#3fb950] text-white" : "bg-[#58a6ff]/20 text-[#58a6ff]"}`}>Ratio: {item.ratio}</div></div>{item.selected && <div className="mt-2 text-sm text-[#3fb950]">✓ Selected</div>}</motion.div>))}</div>
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
