"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap, Hash, Search } from "lucide-react";

interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  task: "insert" | "lookup" | "collision" | "resize";
  size: number;
  initialItems: { key: string; value: string }[];
  itemsToAdd?: { key: string; value: string }[];
  itemsToFind?: string[];
  hint: string;
  educationalNote: string;
  hashFunction: string;
}

const hashString = (key: string, size: number): number => {
  let hash = 0;
  for (let char of key) {
    hash = (hash * 31 + char.charCodeAt(0)) % size;
  }
  return hash;
};

const levels: Level[] = [
  {
    id: 1,
    title: "Basic Insertion",
    description: "Learn how items are placed in a hash table",
    objective: "Insert 'Alice:25' and 'Bob:30' into the hash table",
    task: "insert",
    size: 8,
    initialItems: [],
    itemsToAdd: [{ key: "Alice", value: "25" }, { key: "Bob", value: "30" }],
    hint: "hash('Alice') = sum of char codes % 8. Click on the correct bucket index to insert each item.",
    educationalNote: "Hash tables use a hash function to convert keys into array indices. This gives O(1) average access time.",
    hashFunction: "sum(charCodes) % 8"
  },
  {
    id: 2,
    title: "Handle Collision",
    description: "When two keys hash to the same index, we have a collision",
    objective: "Insert 'Anna:27' (collides with Alice at index 0) - handle via chaining",
    task: "collision",
    size: 8,
    initialItems: [{ key: "Alice", value: "25" }],
    itemsToAdd: [{ key: "Anna", value: "27" }],
    hint: "Both 'Alice' and 'Anna' hash to index 0. Click bucket 0 again to chain Anna after Alice.",
    educationalNote: "Collisions are inevitable. Separate chaining creates linked lists at each bucket. Open addressing probes for next empty slot.",
    hashFunction: "sum(charCodes) % 8"
  },
  {
    id: 3,
    title: "Lookup Items",
    description: "Search for values using their keys",
    objective: "Find the value for key 'Carol' and 'Dave'",
    task: "lookup",
    size: 8,
    initialItems: [
      { key: "Alice", value: "25" },
      { key: "Bob", value: "30" },
      { key: "Carol", value: "28" },
      { key: "Dave", value: "35" }
    ],
    itemsToFind: ["Carol", "Dave"],
    hint: "Hash the key to find the bucket, then search for the key in that bucket's chain.",
    educationalNote: "Lookup is O(1) average. Worst case O(n) if all keys collide. Good hash functions distribute keys uniformly.",
    hashFunction: "sum(charCodes) % 8"
  },
  {
    id: 4,
    title: "Load Factor",
    description: "Monitor when to resize based on load factor",
    objective: "Add items until load factor exceeds 0.75, then trigger resize",
    task: "resize",
    size: 4,
    initialItems: [{ key: "A", value: "1" }, { key: "B", value: "2" }],
    itemsToAdd: [{ key: "C", value: "3" }, { key: "D", value: "4" }],
    hint: "Load factor = items / buckets. With size=4, adding 2 more items gives 4/4 = 1.0. Click 'Resize' when prompted!",
    educationalNote: "Most implementations resize at load factor 0.75. This maintains O(1) operations. Resize doubles buckets and rehashes all items.",
    hashFunction: "ASCII(code) % 4"
  },
  {
    id: 5,
    title: "Hash Table Design",
    description: "Choose the best hash function for given data",
    objective: "Select which hash function minimizes collisions for names",
    task: "insert",
    size: 10,
    initialItems: [],
    itemsToAdd: [
      { key: "Alice", value: "A" },
      { key: "Bob", value: "B" },
      { key: "Anna", value: "C" },
      { key: "Aaron", value: "D" }
    ],
    hint: "Names starting with 'A' will cluster if using first letter only. Consider using multiple characters or length.",
    educationalNote: "Good hash functions: 1) Fast to compute, 2) Uniform distribution, 3) Deterministic. Bad functions cause clustering and degrade to O(n).",
    hashFunction: "length(key) + firstChar % 10"
  }
];

export default function HashTableMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [buckets, setBuckets] = useState<(string | null)[]>([]);
  const [chains, setChains] = useState<{ key: string; value: string }[][]>([]);
  
  // Type-safe initialization helper
  const createEmptyChains = (size: number): { key: string; value: string }[][] => {
    return Array(size).fill(null).map(() => [] as { key: string; value: string }[]);
  };
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [lookupStep, setLookupStep] = useState(0);

  const level = levels[currentLevel];

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  const resetLevel = () => {
    setBuckets(Array(level.size).fill(null));
    setChains(createEmptyChains(level.size));
    
    // Add initial items
    const newBuckets = Array(level.size).fill(null);
    const newChains = createEmptyChains(level.size);
    
    level.initialItems.forEach(item => {
      const idx = hashString(item.key, level.size);
      if (!newBuckets[idx]) {
        newBuckets[idx] = item.key;
      }
      (newChains[idx] as { key: string; value: string }[]).push(item);
    });
    
    setBuckets(newBuckets);
    setChains(newChains);
    setGameState("playing");
    setFeedback("");
    setShowHint(false);
    setScore(0);
    setAttempts(0);
    setCurrentItemIndex(0);
    setLookupStep(0);
  };

  const handleBucketClick = (index: number) => {
    if (gameState !== "playing") return;
    setAttempts(a => a + 1);

    if (level.task === "insert" || level.task === "collision") {
      const item = level.itemsToAdd?.[currentItemIndex];
      if (!item) return;

      const expectedIdx = hashString(item.key, level.size);
      
      if (index === expectedIdx) {
        // Correct bucket
        const newChains = [...chains];
        newChains[index] = [...newChains[index], item];
        setChains(newChains);
        
        if (!buckets[index]) {
          const newBuckets = [...buckets];
          newBuckets[index] = item.key;
          setBuckets(newBuckets);
        }
        
        setFeedback(`✅ Inserted ${item.key} at index ${index}`);
        
        const nextIndex = currentItemIndex + 1;
        if (nextIndex >= (level.itemsToAdd?.length || 0)) {
          const points = Math.max(10, 50 - attempts);
          setScore(points);
          setTotalScore(s => s + points);
          setGameState("won");
          setFeedback(`🎉 Level Complete! +${points} points`);
          if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
            setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
          }
        } else {
          setCurrentItemIndex(nextIndex);
        }
      } else {
        const correctHash = hashString(item.key, level.size);
        setFeedback(`❌ Wrong! hash('${item.key}') = ${correctHash}, not ${index}`);
      }
    } else if (level.task === "lookup") {
      const key = level.itemsToFind?.[lookupStep];
      if (!key) return;

      const expectedIdx = hashString(key, level.size);
      
      if (index === expectedIdx) {
        const item = chains[index].find(c => c.key === key);
        if (item) {
          setFeedback(`✅ Found ${key}: ${item.value}`);
          const nextStep = lookupStep + 1;
          if (nextStep >= (level.itemsToFind?.length || 0)) {
            const points = Math.max(10, 50 - attempts);
            setScore(points);
            setTotalScore(s => s + points);
            setGameState("won");
            setFeedback(`🎉 Level Complete! +${points} points`);
            if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
              setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
            }
          } else {
            setLookupStep(nextStep);
          }
        } else {
          setFeedback(`❌ Key '${key}' not found in this bucket`);
        }
      } else {
        setFeedback(`❌ Wrong bucket! hash('${key}') = ${expectedIdx}`);
      }
    }
  };

  const handleResize = () => {
    const loadFactor = chains.flat().length / level.size;
    if (loadFactor >= 0.75) {
      const points = Math.max(10, 50 - attempts);
      setScore(points);
      setTotalScore(s => s + points);
      setGameState("won");
      setFeedback(`🎉 Correct! Resized at load factor ${loadFactor.toFixed(2)}. +${points} points`);
      if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
        setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
      }
    } else {
      setFeedback(`❌ Not yet! Load factor is ${loadFactor.toFixed(2)}, still under 0.75`);
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  const currentItem = level.itemsToAdd?.[currentItemIndex];
  const currentLookupKey = level.itemsToFind?.[lookupStep];
  const filledCount = chains.flat().length;
  const loadFactor = (filledCount / level.size).toFixed(2);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">Hash Table Challenge</h3>
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
        {/* Left - Hash Table */}
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

          {/* Stats */}
          <div className="flex gap-4 mb-4">
            <div className="px-3 py-1 bg-[#21262d] rounded-lg text-sm">
              <span className="text-[#8b949e]">Size: </span>
              <span className="text-white font-mono">{level.size}</span>
            </div>
            <div className="px-3 py-1 bg-[#21262d] rounded-lg text-sm">
              <span className="text-[#8b949e]">Items: </span>
              <span className="text-white font-mono">{filledCount}</span>
            </div>
            <div className="px-3 py-1 bg-[#21262d] rounded-lg text-sm">
              <span className="text-[#8b949e]">Load: </span>
              <span className={`font-mono ${parseFloat(loadFactor) > 0.75 ? "text-[#f85149]" : "text-[#3fb950]"}`}>{loadFactor}</span>
            </div>
          </div>

          {/* Current Task */}
          {(currentItem || currentLookupKey) && (
            <div className="mb-4 p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg">
              <div className="flex items-center gap-2">
                {currentItem ? <Hash size={16} className="text-[#f0883e]" /> : <Search size={16} className="text-[#58a6ff]" />}
                <span className="text-[#c9d1d9]">
                  {currentItem ? `Insert: ${currentItem.key} = ${currentItem.value}` : `Find: ${currentLookupKey}`}
                </span>
              </div>
            </div>
          )}

          {/* Buckets Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 gap-3">
              {buckets.map((key, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBucketClick(idx)}
                  disabled={gameState !== "playing"}
                  className={`p-4 border-2 rounded-lg min-h-[100px] text-left transition-all ${
                    key
                      ? "border-[#3fb950] bg-[#238636]/10"
                      : "border-[#30363d] bg-[#161b22] border-dashed hover:border-[#58a6ff]"
                  }`}
                >
                  <div className="text-[#6e7681] text-xs font-mono mb-1">[{idx}]</div>
                  {key ? (
                    <div>
                      <div className="text-[#3fb950] font-bold">{key}</div>
                      {chains[idx].length > 1 && (
                        <div className="mt-1 text-xs text-[#8b949e]">
                          +{chains[idx].length - 1} chained
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#6e7681] text-sm italic">Empty</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Resize Button for level 4 */}
          {level.task === "resize" && (
            <div className="mt-4">
              <button
                onClick={handleResize}
                disabled={gameState !== "playing"}
                className="w-full py-3 bg-[#f0883e] hover:bg-[#f5a623] disabled:bg-[#21262d] text-white rounded-lg font-medium"
              >
                Trigger Resize
              </button>
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 p-4 rounded-lg ${
                  gameState === "won" ? "bg-[#238636]/20 border border-[#238636]" : feedback.startsWith("✅") ? "bg-[#3fb950]/20 border border-[#3fb950]" : "bg-[#f85149]/20 border border-[#f85149]"
                }`}
              >
                <p className={gameState === "won" ? "text-[#3fb950]" : feedback.startsWith("✅") ? "text-[#3fb950]" : "text-[#f85149]"}>{feedback}</p>
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
            <div className="p-3 bg-[#58a6ff]/10 rounded-lg mb-3">
              <span className="text-[#8b949e] text-xs">Hash Function: </span>
              <span className="text-[#58a6ff] font-mono text-sm">{level.hashFunction}</span>
            </div>
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
