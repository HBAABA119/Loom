"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap, Search } from "lucide-react";

interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  task: "find" | "count" | "anagram" | "palindrome" | "longest";
  text: string;
  pattern?: string;
  hint: string;
  educationalNote: string;
  expectedAnswer: string | number;
}

const levels: Level[] = [
  {
    id: 1,
    title: "Find the Pattern",
    description: "Basic pattern matching - find where a substring appears",
    objective: "Find all positions where 'ABC' appears in the text",
    task: "find",
    text: "ABABCABCAB",
    pattern: "ABC",
    hint: "Slide a window of size 3 across the text. Check if each window equals 'ABC'.",
    educationalNote: "The naive pattern matching algorithm compares the pattern at each position. Time: O(n×m).",
    expectedAnswer: "2, 5"
  },
  {
    id: 2,
    title: "Count Occurrences",
    description: "Count how many times a pattern appears",
    objective: "Count occurrences of 'AA' in the text (overlapping allowed)",
    task: "count",
    text: "AAAAA",
    pattern: "AA",
    hint: "In 'AAAAA', 'AA' appears at positions 0,1,2,3. That's 4 overlapping occurrences!",
    educationalNote: "Overlapping matches matter! 'AAAA' contains 'AA' 3 times, not 2. Some algorithms find all, others find non-overlapping.",
    expectedAnswer: 4
  },
  {
    id: 3,
    title: "Anagram Detection",
    description: "Check if two strings are anagrams (same letters, different order)",
    objective: "Are 'listen' and 'silent' anagrams? (Yes/No)",
    task: "anagram",
    text: "listen",
    pattern: "silent",
    hint: "Count letters in both strings. If all counts match, they're anagrams! Sorting also works.",
    educationalNote: "Anagram check using char counts is O(n). Sorting is O(n log n). Used in cryptography and word games.",
    expectedAnswer: "Yes"
  },
  {
    id: 4,
    title: "Palindrome Check",
    description: "A palindrome reads the same forwards and backwards",
    objective: "Is 'A man a plan a canal Panama' a palindrome? (ignore spaces/punctuation)",
    task: "palindrome",
    text: "A man a plan a canal Panama",
    hint: "Remove non-alphanumeric chars: 'amanaplanacanalpanama'. Compare from both ends moving inward.",
    educationalNote: "Palindrome check is O(n). Two pointers approach: one from start, one from end, compare until they meet.",
    expectedAnswer: "Yes"
  },
  {
    id: 5,
    title: "Longest Common Prefix",
    description: "Find the longest prefix shared by all strings",
    objective: "Find longest common prefix of ['flower', 'flow', 'flight']",
    task: "longest",
    text: "flower,flow,flight",
    hint: "Compare first two: 'flow'er and 'flow' → 'flow'. Compare result with 'flight' → 'fl'.",
    educationalNote: "This is used in autocomplete and search suggestions. Binary search or horizontal/vertical scanning approaches exist.",
    expectedAnswer: "fl"
  }
];

export default function StringMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won" | "checking">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);

  const level = levels[currentLevel];

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  const resetLevel = () => {
    setUserAnswer("");
    setSelectedPositions([]);
    setGameState("playing");
    setFeedback("");
    setShowHint(false);
    setScore(0);
    setAttempts(0);
  };

  const handlePositionClick = (index: number) => {
    if (gameState !== "playing") return;
    
    if (selectedPositions.includes(index)) {
      setSelectedPositions(selectedPositions.filter(p => p !== index));
    } else {
      setSelectedPositions([...selectedPositions, index]);
    }
  };

  const checkAnswer = () => {
    setAttempts(a => a + 1);
    let isCorrect = false;
    const userVal = parseInt(userAnswer.trim());

    if (level.task === "find") {
      const sortedSelected = [...selectedPositions].sort((a, b) => a - b);
      const expectedArr = (level.expectedAnswer as string).split(", ").map(Number);
      isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(expectedArr);
    } else if (level.task === "count") {
      isCorrect = parseInt(userVal) === level.expectedAnswer;
    } else {
      isCorrect = userAnswer.trim().toLowerCase() === String(level.expectedAnswer).toLowerCase();
    }

    if (isCorrect) {
      const points = Math.max(10, 50 - attempts * 5);
      setScore(points);
      setTotalScore(s => s + points);
      setGameState("won");
      setFeedback(`🎉 Correct! +${points} points`);
      
      if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
        setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
      }
    } else {
      setFeedback(`❌ Not quite. Try again! ${attempts >= 2 ? "Check the hint for help." : ""}`);
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  // Highlight pattern matches
  const getHighlightedText = () => {
    if (!level.pattern) return level.text;
    
    const chars = level.text.split("");
    return chars.map((char, i) => {
      const isSelected = selectedPositions.includes(i);
      const isInMatch = level.pattern && 
        selectedPositions.some(pos => i >= pos && i < pos + level.pattern!.length);
      
      return (
        <motion.button
          key={i}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePositionClick(i)}
          className={`w-10 h-12 m-0.5 rounded-lg font-bold text-lg transition-all ${
            isSelected
              ? "bg-[#3fb950] border-2 border-[#3fb950] text-white"
              : "bg-[#21262d] border-2 border-[#30363d] text-[#c9d1d9] hover:border-[#58a6ff]"
          }`}
        >
          {char}
        </motion.button>
      );
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">String Challenge</h3>
          <span className="text-[#8b949e] text-sm">Level {currentLevel + 1}/{levels.length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
          <Trophy size={16} className="text-[#f0883e]" />
          <span className="text-white font-medium">{totalScore}</span>
        </div>
      </div>

      {/* Level Selector */}
      <div className="flex gap-2 p-3 border-b border-[#30363d] bg-[#0d1117] overflow-x-auto">
        {levels.map((l, i) => (
          <button
            key={l.id}
            onClick={() => unlockedLevels.includes(i) && setCurrentLevel(i)}
            disabled={!unlockedLevels.includes(i)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              i === currentLevel
                ? "bg-[#58a6ff] text-white"
                : unlockedLevels.includes(i)
                ? "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
                : "bg-[#161b22] text-[#6e7681] cursor-not-allowed"
            }`}
          >
            {unlockedLevels.includes(i) ? (i < currentLevel ? <CheckCircle size={14} className="text-[#3fb950]" /> : <Unlock size={14} />) : <Lock size={14} />}
            Level {l.id}
          </button>
        ))}
      </div>

      {/* Main Game */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Challenge Area */}
        <div className="flex-1 flex flex-col p-6">
          {/* Objective */}
          <div className="mb-6 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="flex items-start gap-3">
              <Target size={20} className="text-[#f0883e] mt-0.5" />
              <div>
                <h4 className="text-white font-medium">{level.title}</h4>
                <p className="text-[#8b949e] text-sm mt-1">{level.objective}</p>
              </div>
            </div>
          </div>

          {/* Text Display */}
          <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg p-6 mb-4">
            <div className="flex flex-col items-center justify-center h-full">
              {level.pattern && (
                <div className="mb-6 p-3 bg-[#f0883e]/10 rounded-lg">
                  <span className="text-[#f0883e] text-sm">Pattern to find: </span>
                  <span className="text-white font-bold font-mono">{level.pattern}</span>
                </div>
              )}

              <div className="mb-4">
                <span className="text-[#8b949e] text-sm mb-2 block text-center">Text:</span>
                <div className="flex flex-wrap justify-center">
                  {getHighlightedText()}
                </div>
              </div>

              {/* Indices */}
              <div className="flex gap-1">
                {level.text.split("").map((_, i) => (
                  <div key={i} className="w-10 text-center text-xs text-[#6e7681] font-mono">
                    {i}
                  </div>
                ))}
              </div>

              {level.task === "find" && (
                <p className="mt-4 text-[#8b949e] text-sm">
                  Click positions where the pattern starts
                </p>
              )}
            </div>
          </div>

          {/* Answer Input */}
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="flex gap-3">
              {level.task === "find" ? (
                <div className="flex-1">
                  <span className="text-[#8b949e] text-sm">Selected positions: </span>
                  <span className="text-white font-mono">{selectedPositions.sort((a, b) => a - b).join(", ") || "None"}</span>
                </div>
              ) : (
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white placeholder-[#6e7681] focus:border-[#58a6ff] focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                />
              )}
              <button
                onClick={checkAnswer}
                disabled={gameState === "won"}
                className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] text-white rounded-lg font-medium flex items-center gap-2"
              >
                <Search size={16} /> Check
              </button>
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 p-4 rounded-lg ${
                  gameState === "won" ? "bg-[#238636]/20 border border-[#238636]" : "bg-[#f85149]/20 border border-[#f85149]"
                }`}
              >
                <p className={gameState === "won" ? "text-[#3fb950]" : "text-[#f85149]"}>{feedback}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-4 border-b border-[#30363d]">
            <h4 className="text-white font-medium mb-2">About This Level</h4>
            <p className="text-[#c9d1d9] text-sm">{level.description}</p>
          </div>

          <div className="p-4 border-b border-[#30363d]">
            <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-[#8b949e] hover:text-white">
              <HelpCircle size={16} />
              <span className="text-sm">{showHint ? "Hide Hint" : "Show Hint"}</span>
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg">
                  <p className="text-[#f0883e] text-sm">{level.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 border-b border-[#30363d] flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-[#3fb950]" />
              <h4 className="text-[#3fb950] font-medium text-sm">Why This Matters</h4>
            </div>
            <p className="text-[#c9d1d9] text-sm leading-relaxed">{level.educationalNote}</p>
          </div>

          <div className="p-4 border-b border-[#30363d]">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#21262d] rounded-lg">
                <span className="text-[#8b949e] text-xs">Level Score</span>
                <p className="text-white font-bold text-lg">{score}</p>
              </div>
              <div className="p-3 bg-[#21262d] rounded-lg">
                <span className="text-[#8b949e] text-xs">Attempts</span>
                <p className="text-white font-bold text-lg">{attempts}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex gap-2">
              <button onClick={resetLevel} className="flex-1 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg font-medium flex items-center justify-center gap-2">
                <RotateCcw size={16} /> Reset
              </button>
              {gameState === "won" && currentLevel < levels.length - 1 && (
                <button onClick={nextLevel} className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  Next <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
