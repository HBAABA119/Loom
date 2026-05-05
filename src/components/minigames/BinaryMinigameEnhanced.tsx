"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, Zap, AlertCircle, CheckCircle, XCircle, Hash, Binary } from "lucide-react";

type ConversionType = "bin2dec" | "dec2bin" | "dec2hex" | "hex2dec" | "hex2bin" | "bin2hex";

interface Problem {
  value: number;
  from: ConversionType;
  display: string;
}

const conversionTypes: ConversionType[] = [
  "bin2dec", "dec2bin", "dec2hex", "hex2dec", "hex2bin", "bin2hex"
];

const getConversionLabel = (type: ConversionType): string => {
  const labels: Record<ConversionType, string> = {
    bin2dec: "Binary → Decimal",
    dec2bin: "Decimal → Binary",
    dec2hex: "Decimal → Hex",
    hex2dec: "Hex → Decimal",
    hex2bin: "Hex → Binary",
    bin2hex: "Binary → Hex",
  };
  return labels[type];
};

const formatDisplay = (value: number, type: ConversionType): string => {
  if (type.startsWith("bin") || type.endsWith("bin")) {
    return value.toString(2);
  }
  if (type.startsWith("hex") || type.endsWith("hex")) {
    return value.toString(16).toUpperCase();
  }
  return value.toString();
};

const getCorrectAnswer = (value: number, type: ConversionType): string => {
  if (type.endsWith("dec")) return value.toString();
  if (type.endsWith("bin")) return value.toString(2);
  if (type.endsWith("hex")) return value.toString(16).toUpperCase();
  return "";
};

export default function BinaryMinigameEnhanced() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<"playing" | "paused" | "gameover">("playing");
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [problemsSolved, setProblemsSolved] = useState(0);

  const maxValue = level === 1 ? 15 : level === 2 ? 63 : 255;
  const availableConversions = level === 1 
    ? ["bin2dec", "dec2bin"] 
    : level === 2 
    ? ["bin2dec", "dec2bin", "dec2hex", "hex2dec"]
    : conversionTypes;

  const generateProblem = useCallback((): Problem => {
    const from = availableConversions[Math.floor(Math.random() * availableConversions.length)];
    const value = Math.floor(Math.random() * maxValue);
    return {
      value,
      from: from as ConversionType,
      display: formatDisplay(value, from as ConversionType),
    };
  }, [availableConversions, maxValue]);

  useEffect(() => {
    if (gameState === "playing") {
      setCurrentProblem(generateProblem());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("gameover");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const handleSubmit = () => {
    if (!currentProblem || !answer.trim()) return;

    const correct = getCorrectAnswer(currentProblem.value, currentProblem.from);
    const isCorrect = answer.toUpperCase().trim() === correct.toUpperCase();

    if (isCorrect) {
      const basePoints = 10 * level;
      const comboBonus = Math.min(combo * 2, 20);
      const points = basePoints + comboBonus;
      setScore((s) => s + points);
      setCombo((c) => c + 1);
      setProblemsSolved((p) => p + 1);
      setFeedback("correct");

      // Level up every 5 problems
      if (problemsSolved > 0 && (problemsSolved + 1) % 5 === 0 && level < 3) {
        setLevel((l) => l + 1);
      }
    } else {
      setCombo(0);
      setFeedback("wrong");
      setTimeLeft((t) => Math.max(0, t - 5)); // Time penalty
    }

    setTimeout(() => {
      setFeedback(null);
      setAnswer("");
      setCurrentProblem(generateProblem());
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const restart = () => {
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setLevel(1);
    setProblemsSolved(0);
    setAnswer("");
    setFeedback(null);
    setGameState("playing");
  };

  return (
    <div className="w-full h-full bg-[#0d1117] rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#21262d] rounded-lg">
            <Trophy size={16} className="text-[#f0883e]" />
            <span className="text-white font-medium">{score}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#21262d] rounded-lg">
            <Hash size={16} className="text-[#58a6ff]" />
            <span className="text-white font-medium">Level {level}</span>
          </div>
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#238636]/20 rounded-lg"
            >
              <Zap size={16} className="text-[#238636]" />
              <span className="text-[#3fb950] font-bold">{combo}x</span>
            </motion.div>
          )}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          timeLeft < 10 ? "bg-[#da3633]/20" : "bg-[#21262d]"
        }`}>
          <Timer size={16} className={timeLeft < 10 ? "text-[#f85149]" : "text-[#8b949e]"} />
          <span className={`font-medium ${timeLeft < 10 ? "text-[#f85149]" : "text-white"}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {gameState === "gameover" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
              <div className="space-y-2 mb-6">
                <p className="text-[#c9d1d9]">Final Score: <span className="text-[#f0883e] font-bold text-xl">{score}</span></p>
                <p className="text-[#8b949e]">Problems Solved: {problemsSolved}</p>
                <p className="text-[#8b949e]">Highest Combo: {combo}</p>
              </div>
              <button
                onClick={restart}
                className="px-6 py-3 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium transition-colors"
              >
                Play Again
              </button>
            </motion.div>
          ) : currentProblem ? (
            <motion.div
              key={currentProblem.from + currentProblem.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md space-y-6"
            >
              {/* Conversion Type */}
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#21262d] rounded-full text-[#8b949e] text-sm">
                  {currentProblem.from.includes("bin") ? <Binary size={14} /> : <Hash size={14} />}
                  {getConversionLabel(currentProblem.from)}
                </span>
              </div>

              {/* Problem Display */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="inline-block px-8 py-6 bg-[#161b22] border-2 border-[#58a6ff] rounded-2xl"
                >
                  <span className="text-4xl md:text-5xl font-mono font-bold text-[#58a6ff]">
                    {currentProblem.display}
                  </span>
                </motion.div>
              </div>

              {/* Arrow */}
              <div className="text-center">
                <span className="text-[#8b949e] text-2xl">↓</span>
              </div>

              {/* Answer Input */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter answer..."
                  className="w-full px-4 py-4 bg-[#0d1117] border-2 border-[#30363d] rounded-xl text-center text-2xl font-mono text-white placeholder-[#6e7681] focus:border-[#58a6ff] focus:outline-none transition-colors"
                  autoFocus
                />
                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim()}
                  className="w-full py-3 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] disabled:text-[#6e7681] text-white rounded-xl font-medium transition-colors"
                >
                  Submit (Enter)
                </button>
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl ${
                      feedback === "correct" ? "bg-[#238636]/20" : "bg-[#da3633]/20"
                    }`}
                  >
                    {feedback === "correct" ? (
                      <>
                        <CheckCircle size={20} className="text-[#3fb950]" />
                        <span className="text-[#3fb950] font-medium">Correct! +{10 * level + Math.min(combo * 2, 20)} points</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={20} className="text-[#f85149]" />
                        <span className="text-[#f85149] font-medium">
                          Wrong! Answer was {getCorrectAnswer(currentProblem.value, currentProblem.from)}
                        </span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tips */}
              <div className="p-3 bg-[#161b22] rounded-lg">
                <p className="text-[#8b949e] text-xs text-center">
                  Tip: {currentProblem.from.includes("dec") 
                    ? "Divide by 2 repeatedly for binary, or by 16 for hex" 
                    : "Sum the powers of 2 for each '1' bit"}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#30363d] bg-[#161b22] text-center">
        <p className="text-[#6e7681] text-xs">
          Level 1: Binary ↔ Decimal (0-15) | Level 2: + Hex (0-63) | Level 3: All conversions (0-255)
        </p>
      </div>
    </div>
  );
}
