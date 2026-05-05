"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface TreeNode { value: number; range: [number, number]; x: number; y: number; highlight?: boolean; }
interface Step { step: number; title: string; description: string; codeLines: number[]; tree: TreeNode[]; queryRange?: [number, number]; explanation: string; theoryConnection: string; complexity: string; }

const speeds = [{ label: "0.5x", value: 0.5 }, { label: "1x", value: 1 }, { label: "1.5x", value: 1.5 }, { label: "2x", value: 2 }, { label: "3x", value: 3 }];

const codeLines = ["// Segment Tree for Range Sum Queries", "class SegmentTree {", "  constructor(arr) {", "    this.n = arr.length;", "    this.tree = new Array(4 * this.n);", "    this.build(arr, 0, 0, this.n - 1);", "  }", "", "  build(arr, node, l, r) {", "    if (l === r) {", "      this.tree[node] = arr[l];  // Leaf node", "      return;", "    }", "    const mid = Math.floor((l + r) / 2);", "    this.build(arr, 2*node+1, l, mid);", "    this.build(arr, 2*node+2, mid+1, r);", "    this.tree[node] = this.tree[2*node+1] + this.tree[2*node+2];", "  }", "", "  query(node, l, r, ql, qr) {", "    if (qr < l || ql > r) return 0;  // No overlap", "    if (ql <= l && r <= qr) return this.tree[node];  // Full overlap", "    const mid = Math.floor((l + r) / 2);", "    return this.query(2*node+1, l, mid, ql, qr) +", "           this.query(2*node+2, mid+1, r, ql, qr);", "  }", "}"];

const array = [1, 3, 5, 7, 9, 11];

const buildTree = (arr: number[], l: number, r: number, node: number, x: number, y: number, level: number): TreeNode[] => {
  const mid = Math.floor((l + r) / 2);
  const nodes: TreeNode[] = [];
  let value: number;
  
  if (l === r) { value = arr[l]; } 
  else { 
    const leftNodes = buildTree(arr, l, mid, 2 * node + 1, x - 100 / (level + 1), y + 60, level + 1);
    const rightNodes = buildTree(arr, mid + 1, r, 2 * node + 2, x + 100 / (level + 1), y + 60, level + 1);
    value = leftNodes[0].value + rightNodes[0].value;
    nodes.push(...leftNodes, ...rightNodes);
  }
  
  nodes.unshift({ value, range: [l, r], x, y });
  return nodes;
};

const generateSteps = (): Step[] => [
  { step: 0, title: "Segment Tree Overview", description: "A tree data structure for efficient range queries and updates.", codeLines: [1, 2, 3, 4, 5], tree: [{ value: 36, range: [0, 5], x: 300, y: 30 }], explanation: "Segment tree answers range queries (sum, min, max) in O(log n) time. Built from array [1,3,5,7,9,11]. Each node stores sum of a segment. Root covers entire range [0,5].", theoryConnection: "Segment trees solve static range queries efficiently. Used in: Range sum/min/max queries, Counting inversions, 2D range queries. Time-space tradeoff: O(n) space for O(log n) queries.", complexity: "Build: O(n), Query: O(log n), Update: O(log n). Space: O(4n) ≈ O(n)" },
  { step: 1, title: "Build Tree - Leaf Nodes", description: "Leaf nodes store individual array elements.", codeLines: [8, 9, 10, 11, 12], tree: buildTree(array, 0, 5, 0, 300, 30, 0), explanation: "Leaves represent individual elements: [1], [3], [5], [7], [9], [11]. Each leaf stores its single value. 6 leaves for array of size 6. Height = ⌈log₂6⌉ = 3.", theoryConnection: "Segment tree is a full binary tree. Leaves = n (array size). Internal nodes = n-1. Total nodes ≤ 4n. Height = ⌈log₂n⌉, explaining O(log n) query time.", complexity: "6 leaf nodes created, one per array element" },
  { step: 2, title: "Build Tree - Internal Nodes", description: "Internal nodes store sum of children's values.", codeLines: [13, 14, 15, 16, 17], tree: buildTree(array, 0, 5, 0, 300, 30, 0), explanation: "Internal nodes sum children: [0,2]=1+3+5=9, [3,5]=7+9+11=27. Root = 9+27=36. Each parent stores sum of its range. Full tree built bottom-up.", theoryConnection: "Recursive construction: O(n) time total. Each level processes all nodes at that level. Level 0 (root): 1 node, Level 1: 2 nodes, Level 2: 4 nodes, Level 3: 6 leaves.", complexity: "11 total nodes: 6 leaves + 5 internal nodes. Height = 3" },
  { step: 3, title: "Query Range [2,4] - Root Check", description: "Start at root. Check if query range overlaps with node range.", codeLines: [20, 21, 22, 23], tree: buildTree(array, 0, 5, 0, 300, 30, 0).map(n => ({ ...n, highlight: n.range[0] === 0 && n.range[1] === 5 })), queryRange: [2, 4], explanation: "Query sum of indices 2 to 4 (values 5, 7, 9). Root covers [0,5]. Query [2,4] partially overlaps [0,5]. Can't return root value (36). Must recurse to children.", theoryConnection: "Three cases: 1) No overlap: return 0 (identity), 2) Full overlap: return node value, 3) Partial overlap: recurse to children. This ensures O(log n) time - we only visit nodes along 2 paths from root to leaves.", complexity: "Partial overlap at root. Must explore children." },
  { step: 4, title: "Query - Left Child [0,2]", description: "Check left child covering [0,2]. Query [2,4] partially overlaps.", codeLines: [25, 26], tree: buildTree(array, 0, 5, 0, 300, 30, 0).map(n => ({ ...n, highlight: n.range[0] === 0 && n.range[1] === 2 })), queryRange: [2, 4], explanation: "Left child covers [0,2]. Query [2,4] partially overlaps [0,2] (at index 2). Can't return 9 (sum of [0,2]). Must recurse to grandchildren [0,1] and [2,2].", theoryConnection: "Partial overlap again. We need to drill down until we get full overlaps or no overlaps. The tree structure ensures we don't visit all nodes - only O(log n) nodes relevant to the query range.", complexity: "Still partial overlap. Continue recursing." },
  { step: 5, title: "Query - Leaf [2,2] Found!", description: "Leaf node [2,2] fully contained in query [2,4]. Return its value 5.", codeLines: [22], tree: buildTree(array, 0, 5, 0, 300, 30, 0).map(n => ({ ...n, highlight: n.range[0] === 2 && n.range[1] === 2 })), queryRange: [2, 4], explanation: "Leaf [2,2] value = 5. This is fully inside query [2,4]. Return 5! We found one part of the answer. Still need to find sum of [3,4].", theoryConnection: "Full overlap found! Return node value. This leaf contributes 5 to final sum. The partial overlap algorithm guarantees we cover all indices in query range without gaps.", complexity: "1 index covered. Need [3,4] remaining (7+9=16)." },
  { step: 6, title: "Query - Right Child [3,5]", description: "Back to root's right child [3,5]. Query [2,4] partially overlaps.", codeLines: [22, 23], tree: buildTree(array, 0, 5, 0, 300, 30, 0).map(n => ({ ...n, highlight: n.range[0] === 3 && n.range[1] === 5 })), queryRange: [2, 4], explanation: "Right child [3,5] partially overlaps query [2,4] (indices 3,4). Value 27 is sum of [3,5], but we only want [3,4]. Must recurse to children [3,4] and [5,5].", theoryConnection: "Another partial overlap. Query range spans multiple node ranges. Algorithm intelligently visits only necessary nodes. No overlap case (return 0) prunes entire subtrees.", complexity: "Partial overlap at [3,5]. Recurse deeper." },
  { step: 7, title: "Query - Node [3,4] Full Overlap!", description: "Node [3,4] fully contained in query [2,4]. Return 16 immediately!", codeLines: [22], tree: buildTree(array, 0, 5, 0, 300, 30, 0).map(n => ({ ...n, highlight: n.range[0] === 3 && n.range[1] === 4 })), queryRange: [2, 4], explanation: "Node [3,4] stores 7+9=16. Fully inside query [2,4]! Return 16 without recursing to leaves. This is key optimization - O(1) for this entire subrange.", theoryConnection: "Full overlap optimization crucial for O(log n) time. If query perfectly aligns with existing node ranges, we return cached value. No need to visit leaves individually.", complexity: "Full overlap! Return 16 instantly. Combined with 5 from earlier: total = 21." },
  { step: 8, title: "Query - Skip [5,5] (No Overlap)", description: "Node [5,5] has no overlap with query [2,4]. Return 0.", codeLines: [21], tree: buildTree(array, 0, 5, 0, 300, 30, 0).map(n => ({ ...n, highlight: n.range[0] === 5 && n.range[1] === 5 })), queryRange: [2, 4], explanation: "Node [5,5] value = 11. Query ends at 4, so no overlap with 5. Return 0 (additive identity). Prune this subtree entirely!", theoryConnection: "No overlap case prunes entire subtrees. Return identity (0 for sum, ∞ for min, -∞ for max). This pruning is why segment tree achieves O(log n) - we skip large irrelevant ranges.", complexity: "No overlap - O(1) to skip entire subtree!" },
  { step: 9, title: "Query Complete!", description: "Sum results: 5 + 16 + 0 = 21. Answer verified: 5+7+9 = 21 ✓", codeLines: [20, 21, 22], tree: buildTree(array, 0, 5, 0, 300, 30, 0), queryRange: [2, 4], explanation: "Final result: 5 (from [2,2]) + 16 (from [3,4]) + 0 (from [5,5]) = 21. Direct calculation: 5+7+9 = 21 ✓ Query complete in O(log n) time!", theoryConnection: "Segment tree query visited only 4 nodes (out of 11) to answer range query. For array of size n, visits at most 4*height = O(log n) nodes. Much faster than O(n) linear scan.", complexity: "Query complete! Visited only 4 nodes vs 11 total. O(log n) = O(log 6) ≈ 3." },
  { step: 10, title: "Update Operation", description: "Update array[2] from 5 to 6. Propagate change up the tree.", codeLines: [27, 28, 29], tree: buildTree([1, 3, 6, 7, 9, 11], 0, 5, 0, 300, 30, 0).map(n => ({ ...n, highlight: n.range[0] === 2 && n.range[1] === 2 })), explanation: "Update arr[2] = 5 → 6. Update leaf [2,2] to 6. Propagate up: parent [0,2]: was 9, now 1+3+6=10. Root: was 36, now 37. Update complete in O(log n)!", theoryConnection: "Updates are O(log n) too. Only nodes on path from leaf to root change (at most height nodes). All other nodes unchanged. Lazy propagation enables range updates.", complexity: "3 nodes updated: leaf, parent, root. O(log n) = O(log 6)." },
];

export default function SegmentTreeVisualizerEnhanced() {
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

  const renderConnections = (tree: TreeNode[]) => {
    const connections: React.ReactElement[] = [];
    tree.forEach((node, i) => {
      const leftChild = tree.find(n => n.y === node.y + 60 && n.x < node.x);
      const rightChild = tree.find(n => n.y === node.y + 60 && n.x > node.x);
      if (leftChild) connections.push(<line key={`l-${i}`} x1={node.x} y1={node.y + 20} x2={leftChild.x} y2={leftChild.y - 20} stroke="#30363d" strokeWidth="2" />);
      if (rightChild) connections.push(<line key={`r-${i}`} x1={node.x} y1={node.y + 20} x2={rightChild.x} y2={rightChild.y - 20} stroke="#30363d" strokeWidth="2" />);
    });
    return connections;
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div><h3 className="text-white font-semibold text-lg">Segment Tree</h3><p className="text-[#8b949e] text-sm">Range Queries | O(log n) | Build O(n)</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><Layers size={14} className="text-[#58a6ff]" /><span className="text-[#8b949e] text-xs">Nodes:</span><span className="text-[#3fb950] font-bold">{step.tree.length}</span></div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full"><div className="h-full bg-[#58a6ff] rounded-full transition-all" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} /></div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          {step.queryRange && <div className="mb-4 p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg text-center"><span className="text-[#f0883e] font-bold">Query Range: [{step.queryRange[0]}, {step.queryRange[1]}]</span></div>}
          <div className="flex-1 overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 600 350" preserveAspectRatio="xMidYMid meet">
              {renderConnections(step.tree)}
              {step.tree.map((n, i) => (<motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}><circle cx={n.x} cy={n.y} r={25} className={`transition-all ${n.highlight ? "fill-[#3fb950] stroke-[#3fb950]" : "fill-[#21262d] stroke-[#30363d]"}`} strokeWidth="2" /><text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle" className={`font-bold text-sm pointer-events-none ${n.highlight ? "fill-white" : "fill-[#c9d1d9]"}`}>{n.value}</text><text x={n.x} y={n.y + 35} textAnchor="middle" className="text-xs fill-[#6e7681]">[{n.range[0]},{n.range[1]}]</text></motion.g>))}
            </svg>
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
