"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle, X, Cpu, ArrowRight, RefreshCw, Trophy
} from "lucide-react";

interface Level {
  id: number;
  scenario: string;
  question: string;
  options: string[];
  correct: number;
}

const levels: Level[] = [
  { 
    id: 1, 
    scenario: "Two threads execute 'counter++'\nInitial counter = 0",
    question: "Possible final values?",
    options: ["Only 2", "1 or 2", "0, 1, or 2"], 
    correct: 1 
  },
  { 
    id: 2, 
    scenario: "Thread A locks X then Y\nThread B locks Y then X",
    question: "What's the risk?",
    options: ["Race condition", "Deadlock", "Starvation"], 
    correct: 1 
  },
  { 
    id: 3, 
    scenario: "Read-write lock:\n10 threads reading\n1 thread waiting to write",
    question: "When can the writer proceed?",
    options: ["Immediately", "After all readers finish", "Never"], 
    correct: 1 
  },
];

export default function ConcurrencyMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const reset = () => {
    setCurrentLevel(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setGameOver(false);
  };

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    
    if (idx === levels[currentLevel].correct) {
      setScore(s => s + 1);
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(c => c + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setGameOver(true);
    }
  };

  if (gameOver) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1117] rounded-lg p-8">
        <Trophy size={64} className="text-[#f0883e] mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Game Complete!</h2>
        <p className="text-[#8b949e] mb-4">Score: {score} / {levels.length}</p>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium"
        >
          <RefreshCw size={18} />
          Play Again
        </button>
      </div>
    );
  }

  const level = levels[currentLevel];
  const isCorrect = selected === level.correct;

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-[#a371f7]" />
            <span className="text-white font-medium">Race Condition Hunter</span>
          </div>
          <span className="text-[#8b949e] text-sm">Level {currentLevel + 1} / {levels.length}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="p-4 bg-[#21262d] rounded-lg border border-[#30363d] mb-6 w-full max-w-md">
          <pre className="text-[#c9d1d9] font-mono text-sm">{level.scenario}</pre>
        </div>

        <div className="text-[#8b949e] text-lg mb-4">{level.question}</div>

        <div className="grid grid-cols-1 gap-3 w-full max-w-md">
          {level.options.map((opt, i) => (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showResult}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              className={`p-4 rounded-lg border text-left transition-colors ${
                showResult && i === level.correct
                  ? "bg-[#238636]/20 border-[#238636]"
                  : showResult && i === selected && i !== level.correct
                  ? "bg-[#f85149]/20 border-[#f85149]"
                  : "bg-[#21262d] border-[#30363d] hover:bg-[#30363d]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-white">{opt}</span>
                {showResult && i === level.correct && (
                  <CheckCircle size={18} className="text-[#3fb950] ml-auto" />
                )}
                {showResult && i === selected && i !== level.correct && (
                  <X size={18} className="text-[#f85149] ml-auto" />
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <p className={isCorrect ? "text-[#3fb950]" : "text-[#f85149]"}>
              {isCorrect ? "Correct!" : "Try again!"}
            </p>
            <button
              onClick={nextLevel}
              className="mt-4 flex items-center gap-2 px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg mx-auto"
            >
              {currentLevel < levels.length - 1 ? "Next Level" : "Finish"}
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
