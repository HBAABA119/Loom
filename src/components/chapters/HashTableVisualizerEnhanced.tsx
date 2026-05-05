"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  ChevronLeft, ChevronRight, Hash, ArrowRight, Link2
} from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Bucket {
  index: number;
  key: string | null;
  value: string | null;
  isNew?: boolean;
  isTarget?: boolean;
  chain?: { key: string; value: string }[];
}

interface Step {
  step: number;
  title: string;
  description: string;
  codeLines: number[];
  buckets: Bucket[];
  operation: "init" | "hash" | "insert" | "search" | "collision" | "chain" | "load";
  hashInput: string;
  hashOutput: number;
  explanation: string;
  theoryConnection: string;
  complexity: string;
}

const speeds = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
];

const codeLines = [
  "// Hash Table with Separate Chaining",
  "class HashTable {",
  "  constructor(size = 8) {",
  "    this.buckets = new Array(size).fill(null);",
  "    this.size = size;       // Number of buckets",
  "    this.count = 0;         // Number of items",
  "  }",
  "",
  "  // Hash function: converts key to index",
  "  hash(key) {",
  "    let hash = 0;",
  "    for (let char of key) {",
  "      hash = (hash * 31 + char.charCodeAt(0)) % this.size;",
  "    }",
  "    return hash;  // Index 0 to size-1",
  "  }",
  "",
  "  // O(1) average - Insert key-value pair",
  "  set(key, value) {",
  "    const index = this.hash(key);  // Get bucket index",
  "    ",
  "    // Check if key exists (update) or insert new",
  "    if (!this.buckets[index]) {",
  "      this.buckets[index] = { key, value, next: null };",
  "    } else {",
  "      // Collision! Chain to existing node",
  "      let current = this.buckets[index];",
  "      while (current.next) current = current.next;",
  "      current.next = { key, value, next: null };",
  "    }",
  "    this.count++;",
  "  }",
  "",
  "  // O(1) average - Retrieve value by key",
  "  get(key) {",
  "    const index = this.hash(key);  // Same hash",
  "    let current = this.buckets[index];",
  "",
  "    // Search chain for matching key",
  "    while (current) {",
  "      if (current.key === key) return current.value;",
  "      current = current.next;  // Follow chain",
  "    }",
  "    return undefined;  // Not found",
  "  }",
  "",
  "  // Load factor = count / size",
  "  loadFactor() {",
  "    return this.count / this.size;",
  "  }",
  "}",
];

const hashFunction = (key: string, size: number): number => {
  let hash = 0;
  for (let char of key) {
    hash = (hash * 31 + char.charCodeAt(0)) % size;
  }
  return hash;
};

const generateSteps = (): Step[] => {
  const size = 8;
  
  return [
    {
      step: 0,
      title: "What is a Hash Table?",
      description: "A Hash Table provides O(1) average time for insert, delete, and search by using a hash function to map keys to array indices.",
      codeLines: [1, 2, 3, 4, 5, 6],
      buckets: Array(size).fill(null).map((_, i) => ({ index: i, key: null, value: null })),
      operation: "init",
      hashInput: "",
      hashOutput: -1,
      explanation: "Hash table initialized with 8 buckets (size=8). All buckets empty. Load factor = 0/8 = 0. Empty hash tables have O(1) operations... but there's nothing to search!",
      theoryConnection: "Arrays give O(1) access by index. Hash tables give O(1) access by ANY key by converting keys to indices. The magic is in the hash function.",
      complexity: "Space: O(n) for n elements. Time: O(1) average for all ops"
    },
    {
      step: 1,
      title: "Hash Function: 'Alice' → Index",
      description: "The hash function converts any key into a valid array index.",
      codeLines: [9, 10, 11, 12, 13, 14],
      buckets: Array(size).fill(null).map((_, i) => ({ index: i, key: null, value: null })),
      operation: "hash",
      hashInput: "Alice",
      hashOutput: 0,
      explanation: "hash('Alice') = ((0*31 + 65)*31 + 108)... % 8 = 0. The sum of character codes modulo 8 gives index 0. Same key always gives same index!",
      theoryConnection: "A good hash function: 1) Deterministic (same input → same output), 2) Uniform (spread keys evenly), 3) Fast to compute. Bad functions cause clustering.",
      complexity: "Hash computation: O(k) where k = key length"
    },
    {
      step: 2,
      title: "Insert 'Alice' at Index 0",
      description: "First insertion - bucket 0 was empty, so we store Alice there.",
      codeLines: [18, 19, 20, 21, 22],
      buckets: [
        { index: 0, key: "Alice", value: "25", isNew: true },
        ...Array(size - 1).fill(null).map((_, i) => ({ index: i + 1, key: null, value: null }))
      ],
      operation: "insert",
      hashInput: "Alice",
      hashOutput: 0,
      explanation: "Bucket 0 was null, so we insert {key: 'Alice', value: '25'} directly. No collision! This is the ideal case for hash tables.",
      theoryConnection: "Perfect hashing would give each key its own bucket. With a good hash function and load factor < 0.75, most insertions are collision-free.",
      complexity: "Insert without collision: O(1)"
    },
    {
      step: 3,
      title: "Hash 'Bob' → Index 1",
      description: "Different key, different hash value. Bob hashes to index 1.",
      codeLines: [9, 10, 11, 12, 13, 14],
      buckets: [
        { index: 0, key: "Alice", value: "25" },
        { index: 1, key: null, value: null },
        ...Array(size - 2).fill(null).map((_, i) => ({ index: i + 2, key: null, value: null }))
      ],
      operation: "hash",
      hashInput: "Bob",
      hashOutput: 1,
      explanation: "hash('Bob') = (66*31² + 111*31 + 98) % 8 = 1. Different characters → different hash. Good hash functions minimize collisions.",
      theoryConnection: "Uniform distribution is key. If all keys hash to the same index, we have a linked list with O(n) search. Quality hash functions prevent this.",
      complexity: "Hash distribution affects performance"
    },
    {
      step: 4,
      title: "Insert More Entries",
      description: "Add Bob(1), Carol(2), Dave(3), Eve(4). Each gets its own bucket.",
      codeLines: [18, 19, 20, 21, 22],
      buckets: [
        { index: 0, key: "Alice", value: "25" },
        { index: 1, key: "Bob", value: "30", isNew: true },
        { index: 2, key: "Carol", value: "28" },
        { index: 3, key: "Dave", value: "35" },
        { index: 4, key: "Eve", value: "22" },
        { index: 5, key: null, value: null },
        { index: 6, key: null, value: null },
        { index: 7, key: null, value: null },
      ],
      operation: "insert",
      hashInput: "",
      hashOutput: -1,
      explanation: "5 entries inserted. Each in its own bucket - no collisions yet! Load factor = 5/8 = 0.625. Still under 0.75 threshold for good performance.",
      theoryConnection: "Load factor = items/buckets. When it exceeds 0.75, we resize (rehash) to maintain O(1) performance. This is like dynamic arrays but for hash tables.",
      complexity: "Insert: O(1) average. Resize: O(n) amortized"
    },
    {
      step: 5,
      title: "Collision! 'Anna' hashes to 0",
      description: "Uh oh! 'Anna' hashes to index 0, but Alice is already there.",
      codeLines: [9, 10, 11, 12, 13, 14],
      buckets: [
        { index: 0, key: "Alice", value: "25", isTarget: true },
        { index: 1, key: "Bob", value: "30" },
        { index: 2, key: "Carol", value: "28" },
        { index: 3, key: "Dave", value: "35" },
        { index: 4, key: "Eve", value: "22" },
        { index: 5, key: null, value: null },
        { index: 6, key: null, value: null },
        { index: 7, key: null, value: null },
      ],
      operation: "collision",
      hashInput: "Anna",
      hashOutput: 0,
      explanation: "hash('Anna') = 0, same as 'Alice'! This is a collision. Even good hash functions have collisions - they're inevitable by the pigeonhole principle.",
      theoryConnection: "Pigeonhole principle: With n items and m buckets (n > m), at least one bucket has multiple items. We need collision resolution strategies.",
      complexity: "Collisions are inevitable with limited buckets"
    },
    {
      step: 6,
      title: "Separate Chaining: Chain Anna to Alice",
      description: "We use 'separate chaining' - each bucket is a linked list of entries.",
      codeLines: [23, 24, 25, 26],
      buckets: [
        { 
          index: 0, 
          key: "Alice", 
          value: "25",
          chain: [{ key: "Alice", value: "25" }, { key: "Anna", value: "27", }]
        },
        { index: 1, key: "Bob", value: "30" },
        { index: 2, key: "Carol", value: "28" },
        { index: 3, key: "Dave", value: "35" },
        { index: 4, key: "Eve", value: "22" },
        { index: 5, key: null, value: null },
        { index: 6, key: null, value: null },
        { index: 7, key: null, value: null },
      ],
      operation: "chain",
      hashInput: "Anna",
      hashOutput: 0,
      explanation: "Bucket 0 now has a chain: Alice → Anna. Both entries coexist. When searching, we check the chain. This handles unlimited collisions gracefully.",
      theoryConnection: "Separate chaining is one collision resolution method. Alternative: Open addressing (linear/quadratic probing). Chaining is simpler and handles high load factors better.",
      complexity: "With chaining, search becomes O(chain length)"
    },
    {
      step: 7,
      title: "Search for 'Anna'",
      description: "To find Anna, we hash the key and search the chain.",
      codeLines: [30, 31, 32, 33, 34, 35, 36, 37],
      buckets: [
        { 
          index: 0, 
          key: "Alice", 
          value: "25",
          isTarget: true,
          chain: [{ key: "Alice", value: "25" }, { key: "Anna", value: "27", }]
        },
        { index: 1, key: "Bob", value: "30" },
        { index: 2, key: "Carol", value: "28" },
        { index: 3, key: "Dave", value: "35" },
        { index: 4, key: "Eve", value: "22" },
        { index: 5, key: null, value: null },
        { index: 6, key: null, value: null },
        { index: 7, key: null, value: null },
      ],
      operation: "search",
      hashInput: "Anna",
      hashOutput: 0,
      explanation: "Search 'Anna': hash('Anna') = 0 → Check bucket 0 → Compare 'Alice' ≠ 'Anna' → Follow chain → Compare 'Anna' = 'Anna' ✓ → Return 27. Found in 2 comparisons!",
      theoryConnection: "Search degrades to O(n) worst case (all keys collide). But with good hash function and resizing, average stays O(1). This is probabilistic guarantee.",
      complexity: "Search: O(1) average, O(n) worst case"
    },
    {
      step: 8,
      title: "More Collisions - Chain Growth",
      description: "Add more names that hash to 0, 1, 2. Watch chains grow.",
      codeLines: [23, 24, 25, 26],
      buckets: [
        { 
          index: 0, 
          key: "Alice", 
          value: "25",
          chain: [{ key: "Alice", value: "25" }, { key: "Anna", value: "27" }, { key: "Aaron", value: "29" }]
        },
        { 
          index: 1, 
          key: "Bob", 
          value: "30",
          chain: [{ key: "Bob", value: "30" }, { key: "Bill", value: "32" }]
        },
        { 
          index: 2, 
          key: "Carol", 
          value: "28",
          chain: [{ key: "Carol", value: "28" }]
        },
        { index: 3, key: "Dave", value: "35" },
        { index: 4, key: "Eve", value: "22" },
        { index: 5, key: "Frank", value: "40" },
        { index: 6, key: "Grace", value: "26" },
        { index: 7, key: "Henry", value: "33" },
      ],
      operation: "chain",
      hashInput: "",
      hashOutput: -1,
      explanation: "10 entries now. Bucket 0 has 3 items, bucket 1 has 2. Load factor = 10/8 = 1.25! This is high - time to resize and rehash all entries.",
      theoryConnection: "High load factor → longer chains → slower operations. Java's HashMap resizes at 0.75. Python's dict uses open addressing with a different threshold.",
      complexity: "Performance degrades as load factor increases"
    },
    {
      step: 9,
      title: "Load Factor and Resizing",
      description: "When load factor exceeds threshold (usually 0.75), we must resize.",
      codeLines: [41, 42, 43],
      buckets: [
        { index: 0, key: "Alice", value: "25" },
        { index: 1, key: "Bob", value: "30" },
        { index: 2, key: "Carol", value: "28" },
        { index: 3, key: "Dave", value: "35" },
        { index: 4, key: "Eve", value: "22" },
        { index: 5, key: "Frank", value: "40" },
        { index: 6, key: "Grace", value: "26" },
        { index: 7, key: "Henry", value: "33" },
        { index: 8, key: "Anna", value: "27" },
        { index: 9, key: "Bill", value: "32" },
        { index: 10, key: "Aaron", value: "29" },
        { index: 11, key: null, value: null },
        { index: 12, key: null, value: null },
        { index: 13, key: null, value: null },
        { index: 14, key: null, value: null },
        { index: 15, key: null, value: null },
      ],
      operation: "load",
      hashInput: "",
      hashOutput: -1,
      explanation: "Resized to 16 buckets! All entries rehashed with new size. Now each entry has its own bucket again. Load factor = 10/16 = 0.625. Chains eliminated!",
      theoryConnection: "Resizing is expensive O(n) but rare. With doubling strategy, resize happens log(n) times. Amortized cost remains O(1) per operation.",
      complexity: "Resize: O(n). Amortized insert: O(1)"
    },
    {
      step: 10,
      title: "Hash Table Applications",
      description: "Hash tables power countless real-world systems. Here are the key use cases.",
      codeLines: [41, 42, 43],
      buckets: Array(8).fill(null).map((_, i) => ({ index: i, key: null, value: null })),
      operation: "init",
      hashInput: "",
      hashOutput: -1,
      explanation: "Common uses: 1) Database indexing, 2) Caches (Redis, Memcached), 3) Symbol tables in compilers, 4) Sets (deduplication), 5) Object properties (JavaScript objects are hash tables!)",
      theoryConnection: "JavaScript objects, Python dicts, Java HashMaps, Ruby hashes - all hash table implementations. They're fundamental to modern programming.",
      complexity: "The most versatile data structure - O(1) operations!"
    },
  ];
};

export default function HashTableVisualizerEnhanced() {
  const { 
    currentStep: stepIndex, 
    totalSteps, 
    isPlaying, 
    playbackSpeed,
    togglePlay, 
    pause,
    setStep, 
    nextStep, 
    prevStep,
    setTotalSteps,
    setPlaybackSpeed
  } = useTimeline();
  
  const { setActiveLines } = useCodeHighlight();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setTotalSteps(generateSteps().length);
  }, [setTotalSteps]);

  useEffect(() => {
    setCurrentStep(stepIndex);
  }, [stepIndex]);

  const steps = generateSteps();
  const step = steps[currentStep] || steps[0];

  useEffect(() => {
    if (step?.codeLines) {
      setActiveLines(step.codeLines);
    }
  }, [step]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        nextStep();
      }, 2500 / playbackSpeed);
    } else if (currentStep >= steps.length - 1 && isPlaying) {
      pause();
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, playbackSpeed, nextStep, pause]);

  const handleReset = useCallback(() => {
    pause();
    setStep(0);
  }, [pause, setStep]);

  const filledBuckets = step.buckets.filter(b => b.key !== null).length;
  const loadFactor = (filledBuckets / step.buckets.length).toFixed(2);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div>
          <h3 className="text-white font-semibold text-lg">Hash Table Visualization</h3>
          <p className="text-[#8b949e] text-sm">Separate Chaining: O(1) average insert, search, delete</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <span className="text-[#8b949e] text-xs">Load Factor:</span>
            <span className={`font-mono font-bold ${parseFloat(loadFactor) > 0.75 ? "text-[#f85149]" : "text-[#3fb950]"}`}>
              {loadFactor}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <span className="text-[#8b949e] text-xs">Buckets:</span>
            <span className="text-white font-bold">{filledBuckets}/{step.buckets.length}</span>
          </div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full">
            <div 
              className="h-full bg-[#58a6ff] rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visualization */}
        <div className="flex-1 flex flex-col p-6">
          {/* Hash Function Display */}
          {step.hashInput && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Hash size={20} className="text-[#f0883e]" />
                <span className="text-[#c9d1d9] font-mono">hash("{step.hashInput}")</span>
                <ArrowRight size={16} className="text-[#8b949e]" />
                <span className="text-[#f0883e] font-bold font-mono text-xl">{step.hashOutput}</span>
              </div>
            </motion.div>
          )}

          {/* Buckets Display */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 gap-4">
              {step.buckets.map((bucket) => (
                <motion.div
                  key={bucket.index}
                  initial={bucket.isNew ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                  className={`relative p-4 border-2 rounded-lg min-h-[100px] ${
                    bucket.isTarget
                      ? "border-[#f0883e] bg-[#f0883e]/10"
                      : bucket.key
                      ? "border-[#3fb950] bg-[#238636]/10"
                      : "border-[#30363d] bg-[#161b22] border-dashed"
                  }`}
                >
                  {/* Index label */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#21262d] rounded-full flex items-center justify-center text-xs text-[#8b949e] font-mono border border-[#30363d]">
                    {bucket.index}
                  </div>

                  {/* Main entry */}
                  {bucket.key ? (
                    <div className="flex flex-col">
                      <span className="text-[#58a6ff] font-bold">{bucket.key}</span>
                      <span className="text-[#8b949e] text-sm">: {bucket.value}</span>
                    </div>
                  ) : (
                    <span className="text-[#6e7681] text-sm italic">Empty</span>
                  )}

                  {/* Chain indicator */}
                  {bucket.chain && bucket.chain.length > 1 && (
                    <div className="mt-2 pt-2 border-t border-[#30363d]">
                      <div className="flex items-center gap-1 text-[#8b949e] text-xs mb-1">
                        <Link2 size={12} />
                        <span>Chain ({bucket.chain.length})</span>
                      </div>
                      {bucket.chain.slice(1).map((item, i) => (
                        <div key={i} className="text-xs text-[#c9d1d9] pl-2 border-l-2 border-[#58a6ff] mt-1">
                          {item.key}: {item.value}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#3fb950] bg-[#238636]/20 rounded" />
              <span className="text-[#8b949e]">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#f0883e] bg-[#f0883e]/20 rounded" />
              <span className="text-[#8b949e]">Target</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-dashed border-[#30363d] bg-[#161b22] rounded" />
              <span className="text-[#8b949e]">Empty</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-5 border-b border-[#30363d]">
            <span className="text-[#58a6ff] text-xs font-mono uppercase tracking-wider">
              Step {currentStep + 1}: {step.title}
            </span>
            <p className="text-[#c9d1d9] mt-3 leading-relaxed">{step.description}</p>
          </div>

          <div className="p-5 border-b border-[#30363d] flex-1 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">What's Happening</h4>
            <p className="text-[#c9d1d9] text-sm leading-relaxed mb-4">{step.explanation}</p>
            
            <div className="mt-4 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg">
              <h4 className="text-[#3fb950] text-xs uppercase tracking-wider mb-1">💡 Theory Connection</h4>
              <p className="text-[#c9d1d9] text-sm leading-relaxed">{step.theoryConnection}</p>
            </div>

            <div className="mt-4 p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg">
              <h4 className="text-[#58a6ff] text-xs uppercase tracking-wider mb-1">⏱️ Complexity</h4>
              <p className="text-[#c9d1d9] text-sm font-mono">{step.complexity}</p>
            </div>
          </div>

          <div className="p-4 bg-[#0d1117] max-h-56 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">Code Reference</h4>
            <div className="text-xs font-mono">
              {codeLines.map((line, i) => (
                <div 
                  key={i}
                  className={`px-2 py-0.5 rounded ${
                    step.codeLines?.includes(i + 1)
                      ? "bg-[#238636]/30 text-[#7ee787] border-l-2 border-[#238636]"
                      : "text-[#8b949e]"
                  }`}
                >
                  <span className="text-[#6e7681] w-6 inline-block select-none">{i + 1}</span>
                  {line || " "}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => { pause(); setStep(0); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <SkipBack size={18} />
            </button>
            <button onClick={prevStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <ChevronLeft size={20} />
            </button>
            
            <button onClick={togglePlay} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center gap-2">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            
            <button onClick={nextStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <ChevronRight size={20} />
            </button>
            <button onClick={() => { pause(); setStep(steps.length - 1); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <SkipForward size={18} />
            </button>
            <button onClick={handleReset} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#8b949e] text-sm">Speed:</span>
            <div className="flex gap-1">
              {speeds.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setPlaybackSpeed(s.value)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    playbackSpeed === s.value
                      ? "bg-[#58a6ff] text-white"
                      : "bg-[#21262d] text-[#8b949e] hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
