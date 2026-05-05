"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle, X, Type, ArrowRight, RefreshCw, Trophy
} from "lucide-react";

interface Level {
  id: number;
  expression: string;
  options: string[];
  correct: number;
  hint: string;
}

const levels: Level[] = [
  { id: 1, expression: "5 + 3", options: ["Int", "Bool", "String"], correct: 0, hint: "Adding two integers" },
  { id: 2, expression: "true && false", options: ["Int", "Bool", "Char"], correct: 1, hint: "Logical AND operation" },
  { id: 3, expression: "\\x -> x + 1", options: ["Int -> Int", "Int", "Bool -> Bool"], correct: 0, hint: "Takes Int, returns Int" },
  { id: 4, expression: "[1, 2, 3]", options: ["[Int]", "Int", "(Int, Int, Int)"], correct: 0, hint: "List of integers" },
  { id: 5, expression: "length \"hello\"", options: ["Int", "String", "Char"], correct: 0, hint: "Length returns a number" },
];

export default function TypeMinigameEnhanced() {
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
            <Type size={18} className="text-[#a371f7]" />
            <span className="text-white font-medium">Type Checker Challenge</span>
          </div>
          <span className="text-[#8b949e] text-sm">Level {currentLevel + 1} / {levels.length}</span>
        </div>
        <div className="mt-2 h-2 bg-[#21262d] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#a371f7] transition-all"
            style={{ width: `${(currentLevel / levels.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-[#8b949e] text-sm mb-4">What is the type of this expression?</div>
        
        <div className="p-6 bg-[#21262d] rounded-lg border border-[#30363d] mb-8">
          <code className="text-2xl text-[#a371f7] font-mono">{level.expression}</code>
        </div>

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
                <code className="text-white font-mono">{opt}</code>
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
              {isCorrect ? "Correct!" : `Wrong! Hint: ${level.hint}`}
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
