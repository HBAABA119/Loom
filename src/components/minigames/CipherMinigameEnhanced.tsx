"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, HelpCircle, RotateCcw, CheckCircle, XCircle, 
  Lock, Unlock, Target, Zap, Hash, Key, Shield, Brain
} from "lucide-react";

interface Level {
  id: number;
  title: string;
  description: string;
  cipherType: "caesar" | "vigenere" | "substitution";
  difficulty: "easy" | "medium" | "hard";
  ciphertext: string;
  plaintext: string;
  hint?: string;
  timeLimit: number;
}

const caesarEncrypt = (text: string, shift: number): string => {
  return text.split('').map(char => {
    if (!/[a-zA-Z]/.test(char)) return char;
    const base = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + shift + 26) % 26) + base);
  }).join('');
};

const levels: Level[] = [
  {
    id: 1,
    title: "Caesar Rookie",
    description: "Decrypt a simple Caesar cipher with shift 1",
    cipherType: "caesar",
    difficulty: "easy",
    ciphertext: "IFMMP",
    plaintext: "HELLO",
    hint: "Each letter shifted forward by 1",
    timeLimit: 60
  },
  {
    id: 2,
    title: "Caesar Detective",
    description: "Find the shift value and decrypt",
    cipherType: "caesar",
    difficulty: "easy",
    ciphertext: "WKLV LV D WHVW",
    plaintext: "THIS IS A TEST",
    hint: "Try small shifts first",
    timeLimit: 90
  },
  {
    id: 3,
    title: "Caesar Challenge",
    description: "Larger shift value",
    cipherType: "caesar",
    difficulty: "medium",
    ciphertext: "GUVF VF N FRPERG",
    plaintext: "THIS IS A SECRET",
    hint: "Shift is between 10 and 15",
    timeLimit: 120
  },
  {
    id: 4,
    title: "Vigenère Beginner",
    description: "Decrypt with key 'KEY'",
    cipherType: "vigenere",
    difficulty: "medium",
    ciphertext: "RIJVS",
    plaintext: "HELLO",
    hint: "Key: KEYKE (repeating)",
    timeLimit: 150
  },
  {
    id: 5,
    title: "Vigenère Challenge",
    description: "Longer message with key 'CODE'",
    cipherType: "vigenere",
    difficulty: "hard",
    ciphertext: "FSHMD QOZWM CZ",
    plaintext: "ATTACK AT DAWN",
    hint: "Key repeats: CODECODECO...",
    timeLimit: 180
  }
];

const englishFrequencies: Record<string, number> = {
  'E': 12.7, 'T': 9.1, 'A': 8.1, 'O': 7.5, 'I': 7.0, 'N': 6.7,
  'S': 6.3, 'H': 6.1, 'R': 6.0, 'D': 4.3, 'L': 4.0, 'C': 2.8,
  'U': 2.8, 'M': 2.4, 'W': 2.4, 'F': 2.2, 'G': 2.0, 'Y': 2.0,
  'P': 1.9, 'B': 1.5, 'V': 1.0, 'K': 0.8, 'J': 0.15, 'X': 0.15,
  'Q': 0.10, 'Z': 0.07
};

export default function CipherMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);
  const [showFrequencyHint, setShowFrequencyHint] = useState(false);
  const [testedShifts, setTestedShifts] = useState<number[]>([]);

  const level = levels[currentLevel];

  useEffect(() => {
    setTimeLeft(level.timeLimit);
    setUserAnswer("");
    setAttempts(0);
    setShowHint(false);
    setGameState("playing");
    setFeedback("");
    setShowFrequencyHint(false);
    setTestedShifts([]);
  }, [currentLevel]);

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === "playing") {
      setGameState("lost");
      setFeedback("Time's up!");
    }
  }, [timeLeft, gameState]);

  const checkAnswer = () => {
    const normalized = userAnswer.toUpperCase().trim();
    const target = level.plaintext.toUpperCase();
    
    setAttempts(a => a + 1);

    if (normalized === target) {
      const timeBonus = Math.floor(timeLeft / 10);
      const attemptPenalty = Math.max(0, (attempts - 1) * 10);
      const levelScore = Math.max(10, 100 + timeBonus - attemptPenalty);
      
      setScore(levelScore);
      setTotalScore(s => s + levelScore);
      setGameState("won");
      setFeedback(`Correct! +${levelScore} points`);
      
      if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
        setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
      }
    } else {
      setFeedback("Incorrect. Try again!");
    }
  };

  const testShift = (shift: number) => {
    const result = caesarEncrypt(level.ciphertext, -shift);
    setTestedShifts([...testedShifts, shift]);
    setUserAnswer(result);
  };

  const calculateFrequencies = (text: string) => {
    const letters = text.toUpperCase().replace(/[^A-Z]/g, '').split('');
    const counts: Record<string, number> = {};
    letters.forEach(l => counts[l] = (counts[l] || 0) + 1);
    const total = letters.length;
    return Object.entries(counts)
      .map(([letter, count]) => ({ letter, count, percentage: (count / total) * 100 }))
      .sort((a, b) => b.count - a.count);
  };

  const getNextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  const resetLevel = () => {
    setUserAnswer("");
    setAttempts(0);
    setGameState("playing");
    setTimeLeft(level.timeLimit);
    setFeedback("");
    setShowHint(false);
    setTestedShifts([]);
  };

  const cipherFrequencies = calculateFrequencies(level.ciphertext);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Cipher Breaker</h2>
            <p className="text-sm text-gray-500">Decrypt the messages</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-500">Score: </span>
            <span className="font-bold text-purple-600">{totalScore}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Level: </span>
            <span className="font-bold">{currentLevel + 1}/{levels.length}</span>
          </div>
        </div>
      </div>

      {/* Level Selection */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {levels.map((l, idx) => (
          <button
            key={l.id}
            onClick={() => unlockedLevels.includes(idx) && setCurrentLevel(idx)}
            disabled={!unlockedLevels.includes(idx)}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${currentLevel === idx ? 'bg-purple-600 text-white' : ''}
              ${unlockedLevels.includes(idx) && currentLevel !== idx ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
              ${!unlockedLevels.includes(idx) ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-1">
              {unlockedLevels.includes(idx) ? (
                <Unlock className="w-3 h-3" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
              {l.id}
            </div>
          </button>
        ))}
      </div>

      {/* Game Area */}
      <div className="mb-6 p-6 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">{level.title}</h3>
            <p className="text-sm text-gray-600">{level.description}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium
            ${level.difficulty === 'easy' ? 'bg-green-100 text-green-700' : ''}
            ${level.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
            ${level.difficulty === 'hard' ? 'bg-red-100 text-red-700' : ''}`}>
            {level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1)}
          </div>
        </div>

        {/* Ciphertext Display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Ciphertext</label>
          <div className="p-4 bg-gray-800 text-green-400 font-mono rounded-lg text-lg tracking-wider">
            {level.ciphertext}
          </div>
        </div>

        {/* Answer Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Decryption</label>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
            disabled={gameState !== "playing"}
            placeholder="Enter decrypted text..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-lg tracking-wider disabled:bg-gray-100"
            onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
          />
        </div>

        {/* Caesar Shift Tester */}
        {level.cipherType === "caesar" && gameState === "playing" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Test Shifts (Brute Force)</label>
            <div className="flex flex-wrap gap-1">
              {[...Array(26)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => testShift(i + 1)}
                  disabled={testedShifts.includes(i + 1)}
                  className={`w-8 h-8 text-xs font-medium rounded transition-colors
                    ${testedShifts.includes(i + 1) 
                      ? 'bg-gray-200 text-gray-400' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Click numbers to test that shift</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={checkAnswer}
            disabled={gameState !== "playing" || !userAnswer.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
          >
            <Target className="w-4 h-4" />
            Check Answer
          </button>
          <button
            onClick={() => setShowHint(!showHint)}
            disabled={gameState !== "playing"}
            className="px-4 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 disabled:bg-gray-100 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowFrequencyHint(!showFrequencyHint)}
            disabled={gameState !== "playing"}
            className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:bg-gray-100 transition-colors"
          >
            <Hash className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 p-3 rounded-lg flex items-center gap-2
                ${gameState === "won" ? 'bg-green-100 text-green-800' : ''}
                ${gameState === "lost" ? 'bg-red-100 text-red-800' : ''}
                ${gameState === "playing" ? 'bg-yellow-100 text-yellow-800' : ''}`}
            >
              {gameState === "won" && <CheckCircle className="w-5 h-5" />}
              {gameState === "lost" && <XCircle className="w-5 h-5" />}
              {gameState === "playing" && <Zap className="w-5 h-5" />}
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint Display */}
        <AnimatePresence>
          {showHint && level.hint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <p className="text-sm text-yellow-800">
                <strong>Hint:</strong> {level.hint}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Frequency Analysis */}
        <AnimatePresence>
          {showFrequencyHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <h4 className="font-medium text-blue-800 mb-2">Frequency Analysis</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-blue-600 mb-1">Ciphertext Frequencies</p>
                  <div className="space-y-1">
                    {cipherFrequencies.slice(0, 5).map(({ letter, percentage }) => (
                      <div key={letter} className="flex items-center gap-2 text-xs">
                        <span className="w-4 font-mono">{letter}</span>
                        <div className="flex-1 h-3 bg-blue-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${Math.min(100, percentage * 5)}%` }}
                          />
                        </div>
                        <span className="w-10 text-right">{percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">English Reference</p>
                  <div className="space-y-1">
                    {Object.entries(englishFrequencies).slice(0, 5).map(([letter, freq]) => (
                      <div key={letter} className="flex items-center gap-2 text-xs">
                        <span className="w-4 font-mono">{letter}</span>
                        <div className="flex-1 h-3 bg-green-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${freq * 5}%` }}
                          />
                        </div>
                        <span className="w-10 text-right">{freq.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timer */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Time Remaining</span>
          <span className={timeLeft < 30 ? 'text-red-600 font-bold' : ''}>{timeLeft}s</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${timeLeft < 30 ? 'bg-red-500' : 'bg-purple-500'}`}
            initial={{ width: "100%" }}
            animate={{ width: `${(timeLeft / level.timeLimit) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-800">{attempts}</p>
          <p className="text-xs text-gray-500">Attempts</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-600">{score}</p>
          <p className="text-xs text-gray-500">Level Score</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600">{totalScore}</p>
          <p className="text-xs text-gray-500">Total Score</p>
        </div>
      </div>

      {/* Level Navigation */}
      <div className="flex gap-3">
        {gameState === "won" && currentLevel < levels.length - 1 && (
          <button
            onClick={getNextLevel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Trophy className="w-4 h-4" />
            Next Level
          </button>
        )}
        <button
          onClick={resetLevel}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {gameState === "won" ? "Replay" : "Reset"}
        </button>
      </div>
    </div>
  );
}
