"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  ChevronLeft, ChevronRight, Search, Type
} from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface TrieNode {
  char: string;
  id: string;
  x: number;
  y: number;
  isEndOfWord?: boolean;
  isNew?: boolean;
  isActive?: boolean;
  isSearching?: boolean;
  children: Record<string, TrieNode>;
}

interface Step {
  step: number;
  title: string;
  description: string;
  codeLines: number[];
  root: TrieNode;
  word: string;
  currentChar: string;
  operation: "init" | "insert" | "search" | "exists" | "newnode";
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
  "// Trie (Prefix Tree) Node",
  "class TrieNode {",
  "  constructor() {",
  "    this.children = {};  // Map char -> node",
  "    this.isEndOfWord = false;",
  "  }",
  "}",
  "",
  "class Trie {",
  "  constructor() {",
  "    this.root = new TrieNode();",
  "  }",
  "",
  "  // O(m) - Insert word (m = word length)",
  "  insert(word) {",
  "    let node = this.root;",
  "",
  "    for (const char of word) {",
  "      // Create node if doesn't exist",
  "      if (!node.children[char]) {",
  "        node.children[char] = new TrieNode();",
  "      }",
  "      node = node.children[char];  // Move to child",
  "    }",
  "",
  "    node.isEndOfWord = true;  // Mark word end",
  "  }",
  "",
  "  // O(m) - Search for word",
  "  search(word) {",
  "    const node = this.findNode(word);",
  "    return node !== null && node.isEndOfWord;",
  "  }",
  "",
  "  // O(m) - Check if any word starts with prefix",
  "  startsWith(prefix) {",
  "    return this.findNode(prefix) !== null;",
  "  }",
  "",
  "  findNode(str) {",
  "    let node = this.root;",
  "",
  "    for (const char of str) {",
  "      if (!node.children[char]) {",
  "        return null;  // Path doesn't exist",
  "      }",
  "      node = node.children[char];",
  "    }",
  "",
  "    return node;",
  "  }",
  "}",
];

// Build trie structure
const buildTrie = (words: string[], activeWord?: string, activeIndex?: number): TrieNode => {
  const root: TrieNode = { char: "", id: "root", x: 400, y: 30, children: {} };
  
  let nodeId = 0;
  
  words.forEach((word, wordIdx) => {
    let current = root;
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const isActive = activeWord === word && i === activeIndex;
      const isNew = activeWord === word && i === activeIndex;
      
      if (!current.children[char]) {
        nodeId++;
        current.children[char] = {
          char,
          id: `${word}-${i}`,
          x: 0,
          y: 0,
          children: {},
          isNew,
          isActive: isActive,
          isEndOfWord: i === word.length - 1
        };
      }
      
      if (i === word.length - 1) {
        current.children[char].isEndOfWord = true;
      }
      
      current = current.children[char];
    }
  });
  
  // Calculate positions
  const calculatePositions = (node: TrieNode, x: number, y: number, level: number): void => {
    node.x = x;
    node.y = y;
    
    const children = Object.values(node.children);
    const width = 800 / (level + 1);
    
    children.forEach((child, i) => {
      const offset = (i - (children.length - 1) / 2) * 60;
      calculatePositions(child, x + offset, y + 60, level + 1);
    });
  };
  
  calculatePositions(root, 400, 30, 0);
  return root;
};

// Render trie recursively
const renderTrie = (node: TrieNode, parentX?: number, parentY?: number): React.ReactElement[] => {
  const elements: React.ReactElement[] = [];
  
  // Draw edge to parent
  if (parentX !== undefined && parentY !== undefined) {
    elements.push(
      <line
        key={`edge-${node.id}`}
        x1={parentX}
        y1={parentY + 18}
        x2={node.x}
        y2={node.y - 18}
        stroke={node.isActive || node.isNew ? "#58a6ff" : "#30363d"}
        strokeWidth={node.isActive || node.isNew ? "3" : "2"}
        className="transition-all"
      />
    );
  }
  
  // Draw node
  elements.push(
    <motion.g key={`node-${node.id}`} initial={{ scale: 0 }} animate={{ scale: 1 }}>
      <circle
        cx={node.x}
        cy={node.y}
        r={20}
        className={`transition-all ${
          node.isActive
            ? "fill-[#f0883e] stroke-[#f0883e]"
            : node.isNew
            ? "fill-[#3fb950] stroke-[#3fb950]"
            : node.isEndOfWord
            ? "fill-[#58a6ff] stroke-[#58a6ff]"
            : "fill-[#21262d] stroke-[#30363d]"
        }`}
        strokeWidth="2"
      />
      <text
        x={node.x}
        y={node.y}
        textAnchor="middle"
        dominantBaseline="middle"
        className={`font-bold text-lg pointer-events-none ${
          node.isActive || node.isNew || node.isEndOfWord ? "fill-white" : "fill-[#c9d1d9]"
        }`}
      >
        {node.char}
      </text>
      {node.isEndOfWord && (
        <circle
          cx={node.x + 12}
          cy={node.y - 12}
          r={5}
          className="fill-[#3fb950]"
        />
      )}
    </motion.g>
  );
  
  // Draw children
  Object.values(node.children).forEach((child) => {
    elements.push(...renderTrie(child, node.x, node.y));
  });
  
  return elements;
};

const generateSteps = (): Step[] => [
  {
    step: 0,
    title: "What is a Trie?",
    description: "A Trie (prefix tree) is a tree data structure for efficient string storage and retrieval.",
    codeLines: [1, 2, 3, 4, 5, 6],
    root: buildTrie([]),
    word: "",
    currentChar: "",
    operation: "init",
    explanation: "Trie = 'reTRIEval' tree. Each node represents a character. Paths from root to leaf spell words. Unlike hash tables, tries can check if any word starts with a given prefix efficiently.",
    theoryConnection: "Tries are used in: Autocomplete/type-ahead, Spell checkers, IP routing (longest prefix match), Search engines, DNA sequence matching. They excel at prefix operations.",
    complexity: "Space: O(ALPHABET_SIZE × key_length × N) for N keys. Time for operations: O(m) where m = key length"
  },
  {
    step: 1,
    title: "Empty Trie - Just Root",
    description: "Start with empty trie containing only root node.",
    codeLines: [7, 8, 9, 10, 11],
    root: buildTrie([]),
    word: "",
    currentChar: "",
    operation: "init",
    explanation: "Root is empty (no character). From root, edges lead to first characters of words. Each path from root to marked node represents a word in the trie.",
    theoryConnection: "The root is the entry point. Unlike BST where we compare keys, in tries we follow character-by-character paths. No collisions like hash tables!",
    complexity: "Root only: O(1) space"
  },
  {
    step: 2,
    title: "Insert 'cat' - Create Path",
    description: "Add word 'cat' by creating nodes c → a → t from root.",
    codeLines: [13, 14, 15, 16, 17, 18, 19, 20, 21],
    root: buildTrie(["cat"], "cat", 0),
    word: "cat",
    currentChar: "c",
    operation: "insert",
    explanation: "Insert 'cat': Start at root. 'c' doesn't exist, create c node. 'a' doesn't exist from c, create a node. 't' doesn't exist from a, create t node. Mark t as end of word.",
    theoryConnection: "Insertion creates a path of new nodes for non-existent prefixes. Common prefixes share nodes (will see with next word). This saves space for similar words.",
    complexity: "Insert: O(m) where m = word length (3 for 'cat')"
  },
  {
    step: 3,
    title: "Insert 'car' - Share Prefix 'ca'",
    description: "'car' shares 'ca' with 'cat'. Only create new 'r' node.",
    codeLines: [13, 14, 15, 16, 17, 18, 19, 20, 21],
    root: buildTrie(["cat", "car"], "car", 2),
    word: "car",
    currentChar: "r",
    operation: "insert",
    explanation: "Insert 'car': c exists ✓, a exists ✓, r doesn't exist. Create r as child of a. Mark r as end of word. Notice how 'ca' nodes are shared! This is trie's space advantage.",
    theoryConnection: "Common prefixes are stored once. For dictionary words with common beginnings (un-, pre-, re- in English), tries use significantly less space than storing each word separately.",
    complexity: "Shared prefix 'ca' - only 1 new node created"
  },
  {
    step: 4,
    title: "Insert 'dog' - New Branch",
    description: "'dog' has no common prefix with existing words. Create entirely new branch.",
    codeLines: [13, 14, 15, 16, 17, 18, 19, 20, 21],
    root: buildTrie(["cat", "car", "dog"], "dog", 2),
    word: "dog",
    currentChar: "g",
    operation: "insert",
    explanation: "Insert 'dog': d doesn't exist under root (only c exists), create d. o doesn't exist under d, create o. g doesn't exist under o, create g. Mark g as end of word. New branch from root.",
    theoryConnection: "Tries naturally group words by prefix. All words starting with 'c' are in one subtree, 'd' in another. This structure enables efficient prefix-based operations.",
    complexity: "No shared prefix - 3 new nodes created"
  },
  {
    step: 5,
    title: "Insert 'card' - Extend Existing Word",
    description: "'card' extends 'car'. Add 'd' as child of 'r' in 'car'.",
    codeLines: [13, 14, 15, 16, 17, 18, 19, 20, 21],
    root: buildTrie(["cat", "car", "dog", "card"], "card", 3),
    word: "card",
    currentChar: "d",
    operation: "insert",
    explanation: "Insert 'card': c exists ✓, a exists ✓, r exists ✓, d doesn't exist under r. Create d. Mark d as end of word. Notice 'r' in 'car' now has no end-of-word mark - it's a prefix of 'card'!",
    theoryConnection: "Nodes can be both end-of-word and intermediate. 'car' is a word, but 'r' is no longer marked as end because we extended it. Wait - actually 'r' should still be marked if 'car' is still a word. Let me clarify: 'r' remains marked, 'd' gets new mark.",
    complexity: "Extended 'car' → 'card', only 1 new node"
  },
  {
    step: 6,
    title: "Final Trie Structure",
    description: "View complete trie with 4 words: cat, car, dog, card.",
    codeLines: [1, 2, 3, 4, 5, 6],
    root: buildTrie(["cat", "car", "dog", "card"]),
    word: "",
    currentChar: "",
    operation: "init",
    explanation: "Complete trie: Root → c → a → t($), r($) → d($). Root → d → o → g($). Green dots mark word endings. Words sharing prefixes share nodes - space efficient!",
    theoryConnection: "This structure enables: 1) Insert/Search/Delete in O(m), 2) Prefix queries (find all words with prefix 'ca'), 3) Autocomplete suggestions. The tradeoff is higher space for faster prefix operations.",
    complexity: "4 words stored, 10 total nodes (including root)"
  },
  {
    step: 7,
    title: "Search for 'car'",
    description: "Check if 'car' exists in trie by following character path.",
    codeLines: [24, 25, 26, 27],
    root: buildTrie(["cat", "car", "dog", "card"]),
    word: "car",
    currentChar: "r",
    operation: "search",
    explanation: "Search 'car': Follow c → a → r. All characters exist! Check if r is marked as end-of-word. Yes! 'car' exists in trie. Return true.",
    theoryConnection: "Search is just following a path. If any character missing, word doesn't exist. If all exist but end node not marked, the word was never inserted (only a prefix was inserted).",
    complexity: "Search: O(m) - same as insert"
  },
  {
    step: 8,
    title: "Search for 'ca' - Prefix Only",
    description: "'ca' exists as prefix but not as complete word.",
    codeLines: [24, 25, 26, 27],
    root: buildTrie(["cat", "car", "dog", "card"]),
    word: "ca",
    currentChar: "a",
    operation: "search",
    explanation: "Search 'ca': Follow c → a. Both exist! But is 'a' marked as end-of-word? No! 'ca' is just a prefix of 'cat' and 'car', not a word itself. Return false for exact search, true for prefix search.",
    theoryConnection: "The isEndOfWord flag distinguishes between actual words and prefixes. This is crucial - without it, we couldn't tell if a path represents a word or just a prefix of longer words.",
    complexity: "Prefix check: O(m) - same path traversal"
  },
  {
    step: 9,
    title: "Search for 'cats' - Not Found",
    description: "'cats' doesn't exist. Path c-a-t exists, but 's' child of 't' doesn't.",
    codeLines: [24, 25, 26, 27, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    root: buildTrie(["cat", "car", "dog", "card"]),
    word: "cats",
    currentChar: "s",
    operation: "search",
    explanation: "Search 'cats': c exists ✓, a exists ✓, t exists ✓, s from t... doesn't exist! Return false immediately. Failed at 4th character.",
    theoryConnection: "Tries excel at quick rejection. Unlike hash tables that must compute hash and compare, tries fail fast when prefixes don't match. Great for spell checking - quick 'not in dictionary' results.",
    complexity: "Early termination at first missing character"
  },
  {
    step: 10,
    title: "Prefix Query - Words Starting with 'ca'",
    description: "Find all words with prefix 'ca': cat, car, card.",
    codeLines: [29, 30, 31, 32],
    root: buildTrie(["cat", "car", "dog", "card"]),
    word: "ca",
    currentChar: "",
    operation: "exists",
    explanation: "startsWith('ca'): Follow c → a. Path exists! Return true - there ARE words with this prefix. To get all words, we'd DFS from 'a' node collecting all end-of-word nodes: cat, car, card.",
    theoryConnection: "Prefix queries are O(m) to find the prefix node, then O(k) to enumerate k matching words. This is why tries power autocomplete - type 'ca', instantly know valid completions exist.",
    complexity: "Prefix exists check: O(m). Enumerate matches: O(k) for k matches"
  },
  {
    step: 11,
    title: "Trie Applications Summary",
    description: "Tries are essential for string-heavy applications.",
    codeLines: [1, 13, 14, 24, 25, 29, 30],
    root: buildTrie(["cat", "car", "dog", "card"]),
    word: "",
    currentChar: "",
    operation: "init",
    explanation: "Common uses: 1) Autocomplete (Google search suggestions), 2) Spell checking, 3) IP routing (longest prefix match), 4) Search engines, 5) DNA sequencing, 6) Compression algorithms.",
    theoryConnection: "Tries trade space for time on prefix operations. Hash tables are faster for exact matches (O(1)), but O(n) for prefix searches. Tries are O(m) for both exact and prefix operations where m = key length.",
    complexity: "The optimal data structure for prefix-heavy workloads!"
  },
];

export default function TrieVisualizerEnhanced() {
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

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div>
          <h3 className="text-white font-semibold text-lg">Trie (Prefix Tree) Visualization</h3>
          <p className="text-[#8b949e] text-sm">Character-by-character storage | O(m) insert/search | Prefix operations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <Type size={14} className="text-[#58a6ff]" />
            <span className="text-[#8b949e] text-xs">Words:</span>
            <span className="text-[#3fb950] font-bold">4</span>
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
          {/* Current Word Display */}
          {step.word && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Search size={20} className="text-[#58a6ff]" />
                <span className="text-[#c9d1d9]">{step.operation === "search" ? "Searching" : "Inserting"}: </span>
                <span className="text-white font-bold font-mono text-xl tracking-wider">
                  {step.word.split("").map((c, i) => (
                    <span key={i} className={c === step.currentChar ? "text-[#f0883e] underline" : ""}>
                      {c}
                    </span>
                  ))}
                </span>
              </div>
            </motion.div>
          )}

          {/* Trie Display */}
          <div className="flex-1 overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 800 350" preserveAspectRatio="xMidYMid meet">
              {renderTrie(step.root)}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#3fb950]" />
              <span className="text-[#8b949e]">New Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#f0883e]" />
              <span className="text-[#8b949e]">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#58a6ff]" />
              <span className="text-[#8b949e]">End of Word</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3fb950]" />
              <span className="text-[#8b949e]">Word Marker</span>
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
