"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft, ChevronRight, Undo2, TreePine } from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Step { step: number; title: string; description: string; codeLines: number[]; board: (number | null)[][]; currentCell: [number, number] | null; path: [number, number][]; backtrackCount: number; explanation: string; theoryConnection: string; complexity: string; }

const speeds = [{ label: "0.5x", value: 0.5 }, { label: "1x", value: 1 }, { label: "1.5x", value: 1.5 }, { label: "2x", value: 2 }, { label: "3x", value: 3 }];

const codeLines = ["// Backtracking: N-Queens", "function solveNQueens(n) {", "  const board = Array(n).fill().map(() => Array(n).fill(0));", "  const solutions = [];", "", "  function backtrack(row) {", "    if (row === n) {", "      solutions.push(copy(board));", "      return;  // Found solution", "    }", "", "    for (let col = 0; col < n; col++) {", "      if (isValid(board, row, col)) {", "        board[row][col] = 1;  // Place queen", "        backtrack(row + 1);   // Try next row", "        board[row][col] = 0;  // Backtrack", "      }", "    }", "  }", "", "  backtrack(0);", "  return solutions;", "}"];

const generateSteps = (): Step[] => [
  { step: 0, title: "Backtracking Fundamentals", description: "Systematically search for solutions by exploring possibilities and abandoning invalid paths.", codeLines: [1, 2, 3], board: Array(4).fill(null).map(() => Array(4).fill(null)), currentCell: null, path: [], backtrackCount: 0, explanation: "Backtracking is a refined brute force. Build solution incrementally. If current partial solution cannot lead to valid solution, abandon it (backtrack) and try alternative. Used for constraint satisfaction problems.", theoryConnection: "Backtracking = DFS on state space tree. Prunes subtrees that cannot contain valid solutions. Much faster than brute force for combinatorial problems. Examples: N-Queens, Sudoku, crossword puzzles, graph coloring.", complexity: "Worst case still exponential, but pruning often makes it tractable. N-Queens: O(N!) naive, much less with pruning." },
  { step: 1, title: "4-Queens Problem", description: "Place 4 queens on 4×4 board so no two attack each other.", codeLines: [2, 3, 4, 5], board: Array(4).fill(null).map(() => Array(4).fill(null)), currentCell: null, path: [], backtrackCount: 0, explanation: "4-Queens: Place queens such that no two share row, column, or diagonal. Classic constraint satisfaction. We'll use row-by-row placement with backtracking when constraints violated.", theoryConnection: "State space has 4^4 = 256 possible placements naive. With backtracking: try row 0, then row 1 respecting constraints, etc. Pruning eliminates impossible branches early.", complexity: "4-Queens has 2 solutions. 8-Queens has 92 solutions." },
  { step: 2, title: "Place Queen at (0,0)", description: "Start by placing queen in first row, first column.", codeLines: [12, 13, 14], board: [[1, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]], currentCell: [0, 0], path: [[0, 0]], backtrackCount: 0, explanation: "Place Q at (0,0). This blocks row 0, column 0, and diagonals. Move to row 1. Try columns: col 0 blocked by Q at (0,0), col 1 diagonal blocked by (0,0). Try col 2.", theoryConnection: "Incremental construction. Each choice constrains future choices. The key is detecting conflicts early to enable pruning.", complexity: "1 queen placed. 3 remaining." },
  { step: 3, title: "Try (1,1) - Conflict!", description: "Cannot place at (1,1) - diagonal attack from (0,0).", codeLines: [12, 13], board: [[1, null, null, null], [null, -1, null, null], [null, null, null, null], [null, null, null, null]], currentCell: [1, 1], path: [[0, 0]], backtrackCount: 0, explanation: "(1,1) is on same diagonal as (0,0) - conflict! Skip. Try col 2: (0,0) doesn't attack (1,2). Valid!", theoryConnection: "Constraint checking is crucial. Same row/col/diagonal detection. No need to check row (we place one per row).", complexity: "Conflict detected. Moving to next column." },
  { step: 4, title: "Place Queen at (1,2)", description: "Valid placement at row 1, column 2.", codeLines: [12, 13, 14], board: [[1, null, null, null], [null, null, 1, null], [null, null, null, null], [null, null, null, null]], currentCell: [1, 2], path: [[0, 0], [1, 2]], backtrackCount: 0, explanation: "Q at (1,2) valid. Now row 0 has Q at col 0, row 1 has Q at col 2. Try row 2. Col 0: check diagonal from (1,2) - diff is 2, not 1. OK. But col 0 has Q at row 0. Blocked!", theoryConnection: "Two queens placed. Building partial solution. Each placement adds constraints. State space tree branching factor decreases as constraints accumulate.", complexity: "2 queens placed. Moving to row 2." },
  { step: 5, title: "Row 2 - No Valid Position!", description: "Cannot place queen in row 2 given current placements.", codeLines: [12, 13], board: [[1, null, null, null], [null, null, 1, null], [null, -1, -1, -1], [null, null, null, null]], currentCell: null, path: [[0, 0], [1, 2]], backtrackCount: 1, explanation: "Row 2: col 0 blocked by row 0, col 1 diagonal from (1,2), col 2 blocked by row 1, col 3 diagonal from (1,2). No valid position! Must backtrack.", theoryConnection: "Dead end reached. No valid continuation from current partial solution. Must undo last choice and try alternative. This is the 'backtrack' step.", complexity: "Dead end. Backtracking required." },
  { step: 6, title: "Backtrack - Remove (1,2)", description: "Undo placement at (1,2), try next column.", codeLines: [16, 17], board: [[1, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]], currentCell: [1, 2], path: [[0, 0]], backtrackCount: 1, explanation: "Remove Q from (1,2). Try col 3 for row 1. (1,3): col 3 empty, diagonals: |0-1|≠|0-3|. Valid! Place Q at (1,3).", theoryConnection: "Backtracking: undo last decision and try alternative. State restored to before (1,2) placement. Now exploring different branch of state space tree.", complexity: "1 backtrack performed. Trying alternative." },
  { step: 7, title: "Place Queen at (1,3)", description: "Valid placement at row 1, column 3.", codeLines: [12, 13, 14, 15], board: [[1, null, null, null], [null, null, null, 1], [null, null, null, null], [null, null, null, null]], currentCell: [1, 3], path: [[0, 0], [1, 3]], backtrackCount: 1, explanation: "Q at (1,3). Queens at (0,0) and (1,3). Move to row 2. Try col 1: check diagonals from (0,0) and (1,3). |2-0|=2, |1-0|=1 - not same. |2-1|=1, |1-3|=2 - not same. Valid!", theoryConnection: "New partial solution after backtracking. Different branch may lead to solution. Backtracking systematically explores all possibilities.", complexity: "2 queens placed again. Different configuration." },
  { step: 8, title: "Continue to Solution", description: "Complete the placement by filling rows 2 and 3.", codeLines: [12, 13, 14, 15], board: [[1, null, null, null], [null, null, null, 1], [null, 1, null, null], [null, null, 1, null]], currentCell: [3, 2], path: [[0, 0], [1, 3], [2, 1], [3, 2]], backtrackCount: 1, explanation: "Solution found! Queens at: (0,0), (1,3), (2,1), (3,2). No two share row, column, or diagonal. One of 2 possible solutions for 4-Queens. Backtracking succeeded!", theoryConnection: "Complete valid solution. Backtracking explored, found dead end, backtracked, and eventually found solution. Without backtracking, would need to check all 4^4=256 placements.", complexity: "Solution found with 1 backtrack. Much faster than brute force." },
];

export default function BacktrackVisualizerEnhanced() {
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
        <div><h3 className="text-white font-semibold text-lg">Backtracking: N-Queens</h3><p className="text-[#8b949e] text-sm">DFS + Pruning | Constraint Satisfaction | State Space Tree</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><Undo2 size={14} className="text-[#f0883e]" /><span className="text-[#8b949e] text-xs">Backtracks:</span><span className="text-[#f0883e] font-bold">{step.backtrackCount}</span></div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full"><div className="h-full bg-[#58a6ff] rounded-full transition-all" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} /></div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-4 gap-2">
              {step.board.map((row, i) => row.map((cell, j) => (
                <motion.div key={`${i}-${j}`} initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold ${(i + j) % 2 === 0 ? "bg-[#21262d]" : "bg-[#161b22]"} ${cell === 1 ? "border-2 border-[#3fb950]" : cell === -1 ? "border-2 border-[#f85149]" : step.currentCell?.[0] === i && step.currentCell?.[1] === j ? "border-2 border-[#f0883e]" : "border border-[#30363d]"}`}>
                  {cell === 1 ? "♛" : cell === -1 ? "✗" : ""}
                </motion.div>
              )))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]"><span className="text-[#8b949e] text-xs">Placed</span><p className="text-[#3fb950] font-bold text-lg">{step.path.length}</p></div>
            <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]"><span className="text-[#8b949e] text-xs">Backtracks</span><p className="text-[#f0883e] font-bold text-lg">{step.backtrackCount}</p></div>
            <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]"><span className="text-[#8b949e] text-xs">Status</span><p className={`font-bold text-lg ${step.path.length === 4 ? "text-[#3fb950]" : "text-[#8b949e]"}`}>{step.path.length === 4 ? "Solved!" : "Solving..."}</p></div>
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
