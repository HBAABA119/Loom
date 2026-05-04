"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Cell {
  row: number;
  col: number;
  value: number;
  isFixed: boolean;
  isActive: boolean;
  isValid: boolean;
}

interface BacktrackStep {
  step: number;
  action: string;
  board: Cell[][];
  currentPos: { row: number; col: number } | null;
  attempts: number;
  highlightLines: number[];
  description: string;
}

const createBoard = (): Cell[][] => {
  const board: Cell[][] = [];
  for (let r = 0; r < 4; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < 4; c++) {
      row.push({ row: r, col: c, value: 0, isFixed: false, isActive: false, isValid: true });
    }
    board.push(row);
  }
  // Set some fixed cells as clues
  board[0][0] = { ...board[0][0], value: 1, isFixed: true };
  board[1][1] = { ...board[1][1], value: 2, isFixed: true };
  return board;
};

const backtrackSteps: BacktrackStep[] = [
  { step: 0, action: "init", board: createBoard(), currentPos: null, attempts: 0, highlightLines: [1, 2], description: "Backtracking: Solve 4x4 Sudoku-like puzzle. Fill empty cells 1-4." },
  { step: 1, action: "place", board: createBoard().map((r, ri) => r.map((c, ci) => ({ ...c, value: (ri === 0 && ci === 1) ? 2 : c.value, isActive: ri === 0 && ci === 1 }))), currentPos: { row: 0, col: 1 }, attempts: 1, highlightLines: [3, 4], description: "Try placing 2 at (0,1). Check row, col, box - valid!" },
  { step: 2, action: "place", board: createBoard().map((r, ri) => r.map((c, ci) => ({ ...c, value: (ri === 0 && ci === 1) ? 2 : (ri === 0 && ci === 2) ? 3 : c.value, isActive: ri === 0 && ci === 2 }))), currentPos: { row: 0, col: 2 }, attempts: 2, highlightLines: [3, 4], description: "Try 3 at (0,2). Valid!" },
  { step: 3, action: "conflict", board: createBoard().map((r, ri) => r.map((c, ci) => ({ ...c, value: (ri === 0 && ci === 1) ? 2 : (ri === 0 && ci === 2) ? 3 : (ri === 0 && ci === 3) ? 2 : c.value, isActive: ri === 0 && ci === 3, isValid: !(ri === 0 && ci === 3) }))), currentPos: { row: 0, col: 3 }, attempts: 3, highlightLines: [5, 6], description: "Try 2 at (0,3). Conflict with (0,1)! Try 4 instead." },
  { step: 4, action: "place", board: createBoard().map((r, ri) => r.map((c, ci) => ({ ...c, value: (ri === 0 && ci === 1) ? 2 : (ri === 0 && ci === 2) ? 3 : (ri === 0 && ci === 3) ? 4 : c.value, isActive: ri === 0 && ci === 3 }))), currentPos: { row: 0, col: 3 }, attempts: 4, highlightLines: [7, 8], description: "Place 4 at (0,3). Row 0 complete: [1,2,3,4]" },
  { step: 5, action: "complete", board: [[1,2,3,4],[3,2,4,1],[4,1,2,3],[2,4,1,3]].map((row, ri) => row.map((val, ci) => ({ row: ri, col: ci, value: val, isFixed: (ri === 0 && ci === 0) || (ri === 1 && ci === 1), isActive: false, isValid: true }))), currentPos: null, attempts: 12, highlightLines: [9, 10], description: "Puzzle solved via backtracking! Explored multiple paths, backtracked when conflicts found." },
];

export default function BacktrackVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => { setTotalSteps(backtrackSteps.length); }, [setTotalSteps]);
  useEffect(() => { const step = backtrackSteps[currentStep]; if (step) setActiveLines(step.highlightLines); }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleStep = useCallback((dir: "next" | "prev") => dir === "next" ? nextStep() : prevStep(), [nextStep, prevStep]);
  const step = backtrackSteps[currentStep] || backtrackSteps[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Backtracking Visualizer</h3>
        <div className="flex items-center gap-4">
          <span className="text-[#8b949e]">Attempts: <span className="text-[#58a6ff]">{step.attempts}</span></span>
          <div className="flex items-center gap-2">
            <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">{isPlaying ? "Pause" : "Play"}</button>
            <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Prev</button>
            <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Board */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-[#30363d] rounded-lg">
          {step.board.flat().map((cell) => (
            <motion.div
              key={`${cell.row}-${cell.col}`}
              animate={{
                backgroundColor: cell.isFixed ? "#8957e5" : !cell.isValid ? "#f85149" : cell.isActive ? "#238636" : cell.value > 0 ? "#21262d" : "#161b22",
                borderColor: cell.isActive ? "#3fb950" : "#30363d"
              }}
              className="w-14 h-14 flex items-center justify-center rounded border-2 text-white font-bold text-xl"
            >
              {cell.value > 0 ? cell.value : ""}
            </motion.div>
          ))}
        </div>

        {/* Current position */}
        {step.currentPos && (
          <div className="mt-4 text-[#58a6ff] font-mono">
            Current: ({step.currentPos.row}, {step.currentPos.col})
          </div>
        )}

        <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <p className="text-white">{step.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#8b949e]">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>Action: <span className="text-[#58a6ff]">{step.action.toUpperCase()}</span></span>
          </div>
        </motion.div>
      </div>

      <div className="p-4 border-t border-[#30363d] flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#8957e5] rounded" /><span className="text-[#8b949e]">Fixed</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#238636] rounded" /><span className="text-[#8b949e]">Active</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#f85149] rounded" /><span className="text-[#8b949e]">Conflict</span></div>
      </div>
    </div>
  );
}
