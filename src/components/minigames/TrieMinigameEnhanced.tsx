"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap, Search, Type } from "lucide-react";

interface TrieNode {
  char: string;
  id: string;
  isEndOfWord: boolean;
  children: Record<string, TrieNode>;
}

interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  task: "insert" | "search" | "prefix" | "count";
  words: string[];
  searchWord?: string;
  prefix?: string;
  hint: string;
  educationalNote: string;
}

const levels: Level[] = [
  {
    id: 1,
    title: "Build a Trie",
    description: "Insert words into a trie by creating character paths",
    objective: "Insert 'cat' and 'car' into the trie",
    task: "insert",
    words: ["cat", "car"],
    hint: "Start from root. For 'cat': create c → a → t (mark t as end). For 'car': c and a exist, just add r under a. Share the 'ca' prefix!",
    educationalNote: "Tries share common prefixes. This saves space when many words have common beginnings (like 'un-' in English)."
  },
  {
    id: 2,
    title: "Search Words",
    description: "Check if words exist in the trie",
    objective: "Does 'cat' exist in the trie containing [cat, car, dog]?",
    task: "search",
    words: ["cat", "car", "dog"],
    searchWord: "cat",
    hint: "Follow the path c → a → t. All characters exist? Yes! Is 't' marked as end-of-word? Yes! 'cat' exists.",
    educationalNote: "Trie search follows the character path. If any character missing, word doesn't exist. O(m) where m = word length."
  },
  {
    id: 3,
    title: "Prefix Check",
    description: "Check if any word starts with given prefix",
    objective: "Does any word start with 'ca' in [cat, car, dog, card]?",
    task: "prefix",
    words: ["cat", "car", "dog", "card"],
    prefix: "ca",
    hint: "Follow c → a. Does this path exist? Yes! So at least one word starts with 'ca'. The words are: cat, car, card.",
    educationalNote: "Prefix queries are O(m) to find the prefix node. Tries excel at prefix operations - much faster than scanning all words."
  },
  {
    id: 4,
    title: "Missing Word",
    description: "Find which word from a list is NOT in the trie",
    objective: "Which word is NOT in the trie [cat, car, card]?",
    task: "search",
    words: ["cat", "car", "card"],
    hint: "Check each word: 'cat' exists, 'car' exists, 'card' exists... Wait, look at 'cats' - path c-a-t-s, 's' from 't' doesn't exist!",
    educationalNote: "Tries fail fast on missing prefixes. Great for spell checking - quick 'not in dictionary' detection."
  },
  {
    id: 5,
    title: "Count Prefix Matches",
    description: "Count how many words start with a given prefix",
    objective: "How many words start with 'ca' in [cat, car, card, care, carpet]?",
    task: "count",
    words: ["cat", "car", "card", "care", "carpet"],
    prefix: "ca",
    hint: "Find node 'ca', then count all end-of-word markers in its subtree. cat(1), car→card(2), car→care(3), car→carpet(4). Total: 4!",
    educationalNote: "This powers autocomplete! Type 'ca', trie instantly knows 4 completions exist. Just enumerate the subtree."
  }
];

// Build trie from words
const buildTrie = (words: string[]): TrieNode => {
  const root: TrieNode = { char: "", id: "root", isEndOfWord: false, children: {} };
  
  words.forEach(word => {
    let current = root;
    for (const char of word) {
      if (!current.children[char]) {
        current.children[char] = {
          char,
          id: `${word}-${char}`,
          isEndOfWord: false,
          children: {}
        };
      }
      current = current.children[char];
    }
    current.isEndOfWord = true;
  });
  
  return root;
};

// Find node for a prefix
const findNode = (root: TrieNode, str: string): TrieNode | null => {
  let current = root;
  for (const char of str) {
    if (!current.children[char]) return null;
    current = current.children[char];
  }
  return current;
};

// Count words in subtree
const countWords = (node: TrieNode): number => {
  let count = node.isEndOfWord ? 1 : 0;
  for (const child of Object.values(node.children)) {
    count += countWords(child);
  }
  return count;
};

export default function TrieMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);
  const [insertedWords, setInsertedWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const level = levels[currentLevel];
  const trie = buildTrie(level.words);

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  const resetLevel = () => {
    setUserAnswer("");
    setGameState("playing");
    setFeedback("");
    setShowHint(false);
    setScore(0);
    setAttempts(0);
    setInsertedWords([]);
    setCurrentWordIndex(0);
  };

  const handleSubmit = () => {
    if (gameState !== "playing") return;
    setAttempts(a => a + 1);

    if (level.task === "search") {
      const word = level.searchWord;
      const exists = findNode(trie, word || "")?.isEndOfWord || false;
      const userSaidYes = userAnswer.toLowerCase() === "yes";
      
      if ((exists && userSaidYes) || (!exists && !userSaidYes)) {
        completeLevel();
      } else {
        setFeedback(`❌ Incorrect! "${word}" ${exists ? "does" : "does not"} exist in the trie.`);
      }
    } else if (level.task === "prefix") {
      const exists = findNode(trie, level.prefix || "") !== null;
      const userSaidYes = userAnswer.toLowerCase() === "yes";
      
      if ((exists && userSaidYes) || (!exists && !userSaidYes)) {
        completeLevel();
      } else {
        setFeedback(`❌ Incorrect! Words with prefix "${level.prefix}" ${exists ? "do" : "do not"} exist.`);
      }
    } else if (level.task === "count") {
      const prefixNode = findNode(trie, level.prefix || "");
      const correctCount = prefixNode ? countWords(prefixNode) : 0;
      const userCount = parseInt(userAnswer);
      
      if (userCount === correctCount) {
        completeLevel();
      } else {
        setFeedback(`❌ Wrong count! There are ${correctCount} words with prefix "${level.prefix}".`);
      }
    }
  };

  const completeLevel = () => {
    const points = Math.max(10, 50 - attempts);
    setScore(points);
    setTotalScore(s => s + points);
    setGameState("won");
    setFeedback(`🎉 Correct! +${points} points`);
    if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
      setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  // Calculate node positions for visualization
  const calculatePositions = (node: TrieNode, x: number, y: number, level: number, positions: Record<string, { x: number; y: number }>) => {
    positions[node.id] = { x, y };
    
    const children = Object.values(node.children);
    const width = 600 / (level + 2);
    
    children.forEach((child, i) => {
      const offset = (i - (children.length - 1) / 2) * 80;
      calculatePositions(child, x + offset, y + 60, level + 1, positions);
    });
  };

  const positions: Record<string, { x: number; y: number }> = {};
  calculatePositions(trie, 300, 30, 0, positions);

  // Get all edges
  const getEdges = (node: TrieNode): { from: string; to: string }[] => {
    const edges: { from: string; to: string }[] = [];
    for (const child of Object.values(node.children)) {
      edges.push({ from: node.id, to: child.id });
      edges.push(...getEdges(child));
    }
    return edges;
  };

  const edges = getEdges(trie);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">Trie Challenge</h3>
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
        {/* Left - Trie Area */}
        <div className="flex-1 flex flex-col p-6">
          {/* Objective */}
          <div className="mb-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="flex items-start gap-3">
              <Target size={20} className="text-[#f0883e] mt-0.5" />
              <div>
                <h4 className="text-white font-medium">{level.title}</h4>
                <p className="text-[#8b949e] text-sm mt-1">{level.objective}</p>
              </div>
            </div>
          </div>

          {/* Words in Trie */}
          <div className="mb-4 p-3 bg-[#58a6ff]/10 rounded-lg">
            <span className="text-[#58a6ff] text-sm">Words in trie: </span>
            <span className="text-white font-mono">{level.words.join(", ")}</span>
          </div>

          {/* Target Word/Prefix */}
          {(level.searchWord || level.prefix) && (
            <div className="mb-4 p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg">
              <span className="text-[#f0883e]">
                {level.searchWord ? `Search for: "${level.searchWord}"` : `Prefix: "${level.prefix}"`}
              </span>
            </div>
          )}

          {/* Trie Visualization */}
          <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg relative overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 600 250" preserveAspectRatio="xMidYMid meet">
              {/* Edges */}
              {edges.map((edge, i) => {
                const from = positions[edge.from];
                const to = positions[edge.to];
                if (!from || !to) return null;
                return (
                  <line
                    key={i}
                    x1={from.x}
                    y1={from.y + 18}
                    x2={to.x}
                    y2={to.y - 18}
                    stroke="#30363d"
                    strokeWidth="2"
                  />
                );
              })}
              
              {/* Nodes */}
              {Object.entries(positions).map(([id, pos]) => {
                const node = findNode(trie, id.replace("root", "")) || trie;
                const isRoot = id === "root";
                const nodeObj = id === "root" ? trie : Object.values(trie.children).find(c => c.id === id);
                
                return (
                  <motion.g key={id} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isRoot ? 15 : 20}
                      className={`transition-all ${
                        isRoot
                          ? "fill-[#21262d] stroke-[#58a6ff]"
                          : nodeObj?.isEndOfWord
                          ? "fill-[#3fb950] stroke-[#3fb950]"
                          : "fill-[#21262d] stroke-[#30363d]"
                      }`}
                      strokeWidth="2"
                    />
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`font-bold pointer-events-none ${
                        isRoot || nodeObj?.isEndOfWord ? "fill-white" : "fill-[#c9d1d9]"
                      }`}
                    >
                      {isRoot ? "∅" : nodeObj?.char || ""}
                    </text>
                    {nodeObj?.isEndOfWord && (
                      <circle cx={pos.x + 12} cy={pos.y - 12} r={4} className="fill-[#3fb950]" />
                    )}
                  </motion.g>
                );
              })}
            </svg>
          </div>

          {/* Answer Input */}
          <div className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={level.task === "count" ? "Enter number" : "Yes or No"}
                className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white placeholder-[#6e7681] focus:border-[#58a6ff] focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                onClick={handleSubmit}
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
