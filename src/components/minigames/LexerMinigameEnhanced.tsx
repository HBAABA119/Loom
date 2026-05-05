"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw, ArrowRight, Star, Target, Zap, CheckCircle, XCircle } from "lucide-react";

interface Level {
  id: number;
  code: string;
  tokens: { value: string; type: string }[];
  hint: string;
}

const levels: Level[] = [
  { id: 1, code: "x = 5", tokens: [{ value: "x", type: "IDENTIFIER" }, { value: "=", type: "OPERATOR" }, { value: "5", type: "NUMBER" }], hint: "Look for identifier, operator, then number" },
  { id: 2, code: "let count = 10", tokens: [{ value: "let", type: "KEYWORD" }, { value: "count", type: "IDENTIFIER" }, { value: "=", type: "OPERATOR" }, { value: "10", type: "NUMBER" }], hint: "'let' is a keyword, not an identifier" },
  { id: 3, code: "if (x >= 5)", tokens: [{ value: "if", type: "KEYWORD" }, { value: "(", type: "DELIMITER" }, { value: ">=", type: "OPERATOR" }, { value: ")", type: "DELIMITER" }], hint: ">= is one token (maximal munch)" },
  { id: 4, code: 'print("hello")', tokens: [{ value: "print", type: "IDENTIFIER" }, { value: "(", type: "DELIMITER" }, { value: '"hello"', type: "STRING" }, { value: ")", type: "DELIMITER" }], hint: "String includes the quotes" },
  { id: 5, code: "a + b * c", tokens: [{ value: "a", type: "IDENTIFIER" }, { value: "+", type: "OPERATOR" }, { value: "b", type: "IDENTIFIER" }, { value: "*", type: "OPERATOR" }, { value: "c", type: "IDENTIFIER" }], hint: "Each operator is separate" },
];

const tokenColors: Record<string, string> = { KEYWORD: "#ff7b72", IDENTIFIER: "#79c0ff", OPERATOR: "#d2a8ff", NUMBER: "#79c0ff", STRING: "#a5d6ff", DELIMITER: "#8b949e" };

export default function LexerMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userTokens, setUserTokens] = useState<{ value: string; type: string }[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);

  const level = levels[currentLevel];

  const handleTokenClick = (value: string, type: string) => {
    if (gameState !== "playing") return;
    const newTokens = [...userTokens, { value, type }];
    setUserTokens(newTokens);
    if (newTokens.length === level.tokens.length) {
      const correct = newTokens.every((t, i) => t.value === level.tokens[i].value && t.type === level.tokens[i].type);
      if (correct) {
        setGameState("won");
        setScore(s => s + 100);
        if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
          setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
        }
      } else {
        setGameState("lost");
      }
    }
  };

  const reset = () => { setUserTokens([]); setGameState("playing"); };
  const nextLevel = () => { if (currentLevel < levels.length - 1) { setCurrentLevel(currentLevel + 1); reset(); } };

  const generateTokenOptions = () => {
    const options = [...level.tokens];
    const noise = [";", "{", "}", ",", ".", "//", "/*", "==", "++", "--"];
    while (options.length < 8) {
      const n = noise[Math.floor(Math.random() * noise.length)];
      if (!options.some(o => o.value === n)) {
        options.push({ value: n, type: "DELIMITER" });
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">Token Master</h3>
          <span className="text-[#8b949e] text-sm">Level {currentLevel + 1}/{levels.length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
          <Trophy size={16} className="text-[#f0883e]" />
          <span className="text-white font-medium">{score}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 flex flex-col p-6 border-r border-[#30363d]">
          <div className="mb-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="flex items-start gap-3">
              <Target size={20} className="text-[#f0883e] mt-0.5" />
              <div>
                <h4 className="text-white font-medium">Tokenize this code:</h4>
                <p className="text-[#58a6ff] font-mono text-lg mt-1">{level.code}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
            <div className="text-[#8b949e] text-sm mb-2">Your tokens ({userTokens.length}/{level.tokens.length}):</div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {userTokens.map((token, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-3 py-2 rounded-lg font-mono font-bold" style={{ backgroundColor: `${tokenColors[token.type]}30`, color: tokenColors[token.type], border: `2px solid ${tokenColors[token.type]}` }}
                  >{token.value}</motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            {generateTokenOptions().map((opt, i) => (
              <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleTokenClick(opt.value, opt.type)} disabled={gameState !== "playing"}
                className="px-3 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >{opt.value}</motion.button>
            ))}
          </div>

          {gameState !== "playing" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-4 rounded-lg ${gameState === "won" ? "bg-[#238636]/20 border border-[#238636]" : "bg-[#f85149]/20 border border-[#f85149]"}`}>
              <p className={gameState === "won" ? "text-[#3fb950]" : "text-[#f85149]"}>{gameState === "won" ? "Correct! Well done!" : "Not quite. Try again!"}</p>
            </motion.div>
          )}
        </div>

        <div className="w-1/2 flex flex-col bg-[#161b22]">
          <div className="p-4 border-b border-[#30363d]">
            <h4 className="text-white font-medium mb-2">Progress</h4>
            <div className="flex gap-2">
              {levels.map((l, i) => (
                <button key={l.id} onClick={() => unlockedLevels.includes(i) && setCurrentLevel(i)} disabled={!unlockedLevels.includes(i)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${i === currentLevel ? "bg-[#58a6ff] text-white" : unlockedLevels.includes(i) ? "bg-[#21262d] text-[#c9d1d9]" : "bg-[#161b22] text-[#6e7681]"}`}
                >{i + 1}</button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-4">
            <div className="p-4 bg-[#0d1117] rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-[#f0883e]" />
                <h4 className="text-[#f0883e] font-medium text-sm">Hint</h4>
              </div>
              <p className="text-[#c9d1d9] text-sm">{level.hint}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#21262d] rounded-lg">
                <span className="text-[#8b949e] text-xs">Score</span>
                <p className="text-white font-bold text-lg">{score}</p>
              </div>
              <div className="p-3 bg-[#21262d] rounded-lg">
                <span className="text-[#8b949e] text-xs">Tokens</span>
                <p className="text-white font-bold text-lg">{userTokens.length}</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-[#30363d]">
            <div className="flex gap-2">
              <button onClick={reset} className="flex-1 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg font-medium flex items-center justify-center gap-2"><RotateCcw size={16} /> Reset</button>
              {gameState === "won" && currentLevel < levels.length - 1 && (
                <button onClick={nextLevel} className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center justify-center gap-2">Next <ArrowRight size={16} /></button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
