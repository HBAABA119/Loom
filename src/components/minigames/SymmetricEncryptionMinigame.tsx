"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Key, CheckCircle, XCircle, RefreshCw, Trophy } from "lucide-react";

interface Challenge {
  id: number;
  plaintext: string;
  key: string;
  ciphertext: string;
  difficulty: "easy" | "medium" | "hard";
  hint: string;
}

export default function SymmetricEncryptionMinigame() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const challenges: Challenge[] = [
    {
      id: 0,
      plaintext: "HELLO",
      key: "3",
      ciphertext: "KHOOR",
      difficulty: "easy",
      hint: "Try shifting each letter forward by the key value"
    },
    {
      id: 1,
      plaintext: "SECRET",
      key: "5",
      ciphertext: "XJHWJY",
      difficulty: "easy",
      hint: "A=0, B=1, C=2... Add the key to each letter position"
    },
    {
      id: 2,
      plaintext: "ENCRYPT",
      key: "7",
      ciphertext: "LUHYVWA",
      difficulty: "medium",
      hint: "Remember to wrap around after Z (Z+1=A)"
    },
    {
      id: 3,
      plaintext: "CIPHER",
      key: "11",
      ciphertext: "NTRCSL",
      difficulty: "medium",
      hint: "This is a Caesar cipher with a larger shift"
    },
    {
      id: 4,
      plaintext: "ALGORITHM",
      key: "13",
      ciphertext: "NYTBVTUVA",
      difficulty: "hard",
      hint: "ROT13 - each letter is shifted by exactly half the alphabet"
    }
  ];

  const challenge = challenges[currentChallenge];

  const checkAnswer = () => {
    setAttempts(attempts + 1);
    
    if (userInput.toUpperCase() === challenge.ciphertext) {
      setFeedback("correct");
      const points = Math.max(100 - (attempts * 10), 10);
      setScore(score + points);
      
      setTimeout(() => {
        if (currentChallenge < challenges.length - 1) {
          setCurrentChallenge(currentChallenge + 1);
          setUserInput("");
          setShowHint(false);
          setAttempts(0);
          setFeedback(null);
        } else {
          setGameComplete(true);
        }
      }, 1500);
    } else {
      setFeedback("incorrect");
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const resetGame = () => {
    setCurrentChallenge(0);
    setUserInput("");
    setShowHint(false);
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
    setFeedback(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "hard": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  if (gameComplete) {
    return (
      <div className="w-full h-full bg-background p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <Trophy size={64} className="mx-auto text-yellow-500" />
          <h2 className="text-2xl font-bold text-foreground">Challenge Complete!</h2>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-foreground">{score} points</p>
            <p className="text-muted">You've mastered symmetric encryption!</p>
          </div>
          <button
            onClick={resetGame}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw size={16} />
            Play Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Symmetric Encryption Challenge</h2>
          <p className="text-muted">Encrypt the plaintext using the given key</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-muted">Challenge {currentChallenge + 1}/{challenges.length}</span>
            <span className="text-muted">Score: {score}</span>
            <span className={getDifficultyColor(challenge.difficulty)}>
              {challenge.difficulty.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Challenge */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Plaintext */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-blue-500" />
                <h3 className="text-sm font-semibold text-foreground">Plaintext</h3>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="font-mono text-lg text-center">{challenge.plaintext}</p>
              </div>
            </div>

            {/* Key */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-green-500" />
                <h3 className="text-sm font-semibold text-foreground">Key</h3>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="font-mono text-lg text-center">{challenge.key}</p>
              </div>
            </div>

            {/* User Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-purple-500" />
                <h3 className="text-sm font-semibold text-foreground">Your Answer</h3>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter ciphertext"
                  className="w-full bg-transparent text-center font-mono text-lg outline-none"
                  maxLength={20}
                />
              </div>
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-3 rounded-lg flex items-center gap-2 ${
                  feedback === "correct" 
                    ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {feedback === "correct" ? (
                  <>
                    <CheckCircle size={16} />
                    <span>Correct! +{Math.max(100 - (attempts - 1) * 10, 10)} points</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    <span>Try again! Remember to shift each letter by the key value.</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              {showHint ? "Hide Hint" : "Show Hint"} (-10 points)
            </button>
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30"
              >
                <p className="text-sm text-yellow-400">
                  <strong>Hint:</strong> {challenge.hint}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={checkAnswer}
              disabled={!userInput.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Answer
            </button>
            <button
              onClick={() => setUserInput("")}
              className="px-6 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-accent/30 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-2">How to Play</h3>
          <ul className="text-xs text-muted space-y-1">
            <li>• Encrypt the plaintext using a Caesar cipher with the given key</li>
            <li>• Each letter is shifted forward by the key value (A=0, B=1, etc.)</li>
            <li>• Wrap around after Z (Z+1=A)</li>
            <li>• Use hints if needed, but they reduce your score</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
