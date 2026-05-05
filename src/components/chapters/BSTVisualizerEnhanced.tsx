"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  ChevronLeft, ChevronRight, Binary, ArrowRight, ArrowLeftRight
} from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface TreeNode {
  value: number;
  x: number;
  y: number;
  left?: TreeNode;
  right?: TreeNode;
  isNew?: boolean;
  isTarget?: boolean;
  isComparing?: boolean;
  isVisited?: boolean;
  parent?: TreeNode;
}

interface Step {
  step: number;
  title: string;
  description: string;
  codeLines: number[];
  tree: TreeNode;
  currentNode?: TreeNode;
  path: number[];
  operation: "init" | "insert" | "search" | "delete" | "traverse" | "balance";
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
  "// Binary Search Tree (BST)",
  "class BST {",
  "  constructor() {",
  "    this.root = null;  // Empty tree",
  "  }",
  "",
  "  // O(log n) average - Insert value",
  "  insert(value) {",
  "    this.root = this._insert(this.root, value);",
  "  }",
  "",
  "  _insert(node, value) {",
  "    if (!node) return { value, left: null, right: null };",
  "",
  "    if (value < node.value) {",
  "      node.left = this._insert(node.left, value);  // Go left",
  "    } else if (value > node.value) {",
  "      node.right = this._insert(node.right, value);  // Go right",
  "    }",
  "",
  "    return node;  // Return unchanged node",
  "  }",
  "",
  "  // O(log n) average - Search for value",
  "  search(value) {",
  "    return this._search(this.root, value);",
  "  }",
  "",
  "  _search(node, value) {",
  "    if (!node) return false;  // Not found",
  "",
  "    if (value === node.value) return true;  // Found!",
  "    if (value < node.value) {",
  "      return this._search(node.left, value);   // Go left",
  "    }",
  "    return this._search(node.right, value);  // Go right",
  "  }",
  "",
  "  // O(log n) average - Find min (leftmost)",
  "  findMin(node = this.root) {",
  "    while (node.left) node = node.left;",
  "    return node.value;",
  "  }",
  "}",
];

// Calculate tree layout
const calculateLayout = (node: TreeNode | undefined, x: number, y: number, level: number): TreeNode | undefined => {
  if (!node) return undefined;
  
  const horizontalGap = 80 / (level + 1);
  
  return {
    ...node,
    x,
    y,
    left: calculateLayout(node.left, x - horizontalGap, y + 60, level + 1),
    right: calculateLayout(node.right, x + horizontalGap, y + 60, level + 1),
  };
};

const generateSteps = (): Step[] => {
  const buildStep = (stepNum: number, values: number[], targetValue: number | null, title: string, desc: string, op: Step["operation"], lines: number[], expl: string, theory: string, comp: string): Step => {
    // Build tree from values
    const root: TreeNode = { value: values[0], x: 400, y: 50 };
    
    for (let i = 1; i < values.length; i++) {
      let current = root;
      const val = values[i];
      while (true) {
        if (val < current.value) {
          if (!current.left) {
            current.left = { value: val, x: 0, y: 0 };
            break;
          }
          current = current.left;
        } else {
          if (!current.right) {
            current.right = { value: val, x: 0, y: 0 };
            break;
          }
          current = current.right;
        }
      }
    }

    // Calculate positions
    const layoutRoot = calculateLayout(root, 400, 50, 0);

    return {
      step: stepNum,
      title,
      description: desc,
      codeLines: lines,
      tree: layoutRoot!,
      currentNode: targetValue !== null ? undefined : undefined,
      path: [],
      operation: op,
      explanation: expl,
      theoryConnection: theory,
      complexity: comp,
    };
  };

  return [
    {
      step: 0,
      title: "What is a Binary Search Tree?",
      description: "A BST is a binary tree where for every node: left subtree values < node.value < right subtree values.",
      codeLines: [1, 2, 3, 4],
      tree: { value: 50, x: 400, y: 50 },
      path: [],
      operation: "init",
      explanation: "Start with empty tree. BST property: All left descendants are smaller, all right descendants are larger. This enables O(log n) search on average.",
      theoryConnection: "BSTs combine the flexibility of linked lists with search efficiency of arrays. They're used in database indexing, file systems, and expression parsing.",
      complexity: "Balanced BST: O(log n) for all operations. Worst case (skewed): O(n)"
    },
    {
      step: 1,
      title: "Insert Root: 50",
      description: "First element becomes the root of the tree.",
      codeLines: [7, 8, 11, 12],
      tree: { value: 50, x: 400, y: 50, isNew: true },
      path: [],
      operation: "insert",
      explanation: "Insert 50 into empty tree. Since root is null, we create new node with value 50. This is our starting point for building the BST.",
      theoryConnection: "Root selection matters! If we insert sorted data [1,2,3,4,5], tree becomes a linked list (worst case). Random insertion gives better balance.",
      complexity: "Insert into empty tree: O(1)"
    },
    {
      step: 2,
      title: "Insert 30 - Goes Left",
      description: "30 < 50, so it becomes the left child.",
      codeLines: [14, 15],
      tree: calculateLayout({ 
        value: 50, x: 400, y: 50,
        left: { value: 30, x: 0, y: 0, isNew: true }
      }, 400, 50, 0)!,
      path: [50],
      operation: "insert",
      explanation: "Compare 30 with root (50): 30 < 50, go left. Left is null, so insert 30 there. BST property maintained: left child (30) < parent (50).",
      theoryConnection: "This is the key BST invariant. At every node, this property must hold. It allows us to eliminate half the tree at each comparison.",
      complexity: "Compare and insert: O(log n) average"
    },
    {
      step: 3,
      title: "Insert 70 - Goes Right",
      description: "70 > 50, so it becomes the right child.",
      codeLines: [16, 17],
      tree: calculateLayout({ 
        value: 50, x: 400, y: 50,
        left: { value: 30, x: 0, y: 0 },
        right: { value: 70, x: 0, y: 0, isNew: true }
      }, 400, 50, 0)!,
      path: [50],
      operation: "insert",
      explanation: "70 > 50, go right. Right is null, insert 70. Now root has two children: 30 (left) and 70 (right). Tree is balanced with 3 nodes.",
      theoryConnection: "This forms the foundation. A balanced binary tree with n nodes has height log₂(n). Each level doubles the nodes we can store.",
      complexity: "Two-level tree: O(2) comparisons"
    },
    {
      step: 4,
      title: "Insert 20 - Deeper Left",
      description: "20 < 50, go left. 20 < 30, go left again.",
      codeLines: [14, 15],
      tree: calculateLayout({ 
        value: 50, x: 400, y: 50,
        left: { 
          value: 30, x: 0, y: 0,
          left: { value: 20, x: 0, y: 0, isNew: true }
        },
        right: { value: 70, x: 0, y: 0 }
      }, 400, 50, 0)!,
      path: [50, 30],
      operation: "insert",
      explanation: "20 < 50 → go left to 30. 20 < 30 → go left (null). Insert 20 as left child of 30. Tree grows deeper on left side.",
      theoryConnection: "Path length equals number of comparisons. In a balanced tree with n nodes, max path is log₂(n). For 1 million nodes, that's only 20 comparisons!",
      complexity: "Tree height determines worst-case comparisons"
    },
    {
      step: 5,
      title: "Insert More Values",
      description: "Add 40, 60, 80 to create a fuller tree.",
      codeLines: [7, 8, 14, 15, 16, 17],
      tree: calculateLayout({ 
        value: 50, x: 400, y: 50,
        left: { 
          value: 30, x: 0, y: 0,
          left: { value: 20, x: 0, y: 0 },
          right: { value: 40, x: 0, y: 0, isNew: true }
        },
        right: { 
          value: 70, x: 0, y: 0,
          left: { value: 60, x: 0, y: 0, isNew: true },
          right: { value: 80, x: 0, y: 0, isNew: true }
        }
      }, 400, 50, 0)!,
      path: [50, 30, 70],
      operation: "insert",
      explanation: "40 goes right of 30. 60 goes left of 70. 80 goes right of 70. Now we have a nicely balanced tree with 7 nodes spanning 3 levels.",
      theoryConnection: "Perfect binary tree with height h has 2ʰ-1 nodes. Our height-2 tree can hold up to 7 nodes. Height-3 tree can hold 15 nodes.",
      complexity: "Current height: 2, Max nodes at this height: 7"
    },
    {
      step: 6,
      title: "Search for 60",
      description: "Find if 60 exists in the tree. Follow the BST property.",
      codeLines: [22, 23, 24, 25, 26, 27, 28, 29],
      tree: calculateLayout({ 
        value: 50, x: 400, y: 50, isComparing: true,
        left: { 
          value: 30, x: 0, y: 0,
          left: { value: 20, x: 0, y: 0 },
          right: { value: 40, x: 0, y: 0 }
        },
        right: { 
          value: 70, x: 0, y: 0,
          left: { value: 60, x: 0, y: 0, isTarget: true },
          right: { value: 80, x: 0, y: 0 }
        }
      }, 400, 50, 0)!,
      path: [50, 70],
      operation: "search",
      explanation: "Search 60: 60 > 50 → go right to 70. 60 < 70 → go left. Found 60! Only 2 comparisons vs 7 for linear search. BST efficiency in action!",
      theoryConnection: "Search eliminates half the tree at each step. This is binary search on a tree structure. Compare to array binary search - same O(log n) complexity.",
      complexity: "Search: O(log n) - only 2 comparisons for 7 nodes!"
    },
    {
      step: 7,
      title: "Search for 100 - Not Found",
      description: "Search for a value that doesn't exist. Reach null.",
      codeLines: [22, 23, 24, 25],
      tree: calculateLayout({ 
        value: 50, x: 400, y: 50, isVisited: true,
        left: { 
          value: 30, x: 0, y: 0,
          left: { value: 20, x: 0, y: 0 },
          right: { value: 40, x: 0, y: 0 }
        },
        right: { 
          value: 70, x: 0, y: 0, isVisited: true,
          left: { value: 60, x: 0, y: 0 },
          right: { value: 80, x: 0, y: 0, isComparing: true }
        }
      }, 400, 50, 0)!,
      path: [50, 70, 80],
      operation: "search",
      explanation: "100 > 50 → right. 100 > 70 → right. 100 > 80 → right. Right is null! Return false. Even 'not found' is efficient - we don't check every node.",
      theoryConnection: "Failed search still benefits from BST structure. We know 100 doesn't exist without checking nodes 30, 20, 40, 60. That's 4 fewer checks!",
      complexity: "Failed search: O(log n) - still efficient!"
    },
    {
      step: 8,
      title: "Find Minimum Value",
      description: "Minimum is always the leftmost node.",
      codeLines: [33, 34, 35],
      tree: calculateLayout({ 
        value: 50, x: 400, y: 50,
        left: { 
          value: 30, x: 0, y: 0,
          left: { value: 20, x: 0, y: 0, isTarget: true },
          right: { value: 40, x: 0, y: 0 }
        },
        right: { 
          value: 70, x: 0, y: 0,
          left: { value: 60, x: 0, y: 0 },
          right: { value: 80, x: 0, y: 0 }
        }
      }, 400, 50, 0)!,
      path: [50, 30, 20],
      operation: "traverse",
      explanation: "FindMin: Start at root, keep going left until null. 50 → 30 → 20. 20 has no left child, so 20 is minimum. This is O(log n) vs O(n) for arrays!",
      theoryConnection: "Similarly, maximum is rightmost. These operations are trivial in BSTs but require full scan in unsorted arrays. BSTs naturally sort data.",
      complexity: "FindMin/Max: O(log n) - just follow one edge direction"
    },
    {
      step: 9,
      title: "Inorder Traversal - Sorted Output",
      description: "BST traversal gives values in sorted order automatically!",
      codeLines: [33, 34, 35],
      tree: calculateLayout({ 
        value: 50, x: 400, y: 50, isVisited: true,
        left: { 
          value: 30, x: 0, y: 0, isVisited: true,
          left: { value: 20, x: 0, y: 0, isVisited: true },
          right: { value: 40, x: 0, y: 0, isVisited: true }
        },
        right: { 
          value: 70, x: 0, y: 0, isVisited: true,
          left: { value: 60, x: 0, y: 0, isVisited: true },
          right: { value: 80, x: 0, y: 0, isVisited: true }
        }
      }, 400, 50, 0)!,
      path: [20, 30, 40, 50, 60, 70, 80],
      operation: "traverse",
      explanation: "Inorder: Left → Node → Right. Result: 20, 30, 40, 50, 60, 70, 80. Sorted! BSTs are self-sorting. No need for separate sort algorithm.",
      theoryConnection: "This is why BSTs are used for ordered data. Tree sort is O(n log n) - same as quicksort/mergesort, but maintains order dynamically during insertions.",
      complexity: "Inorder traversal: O(n) - visits each node once"
    },
    {
      step: 10,
      title: "Unbalanced BST - Worst Case",
      description: "Inserting sorted data creates a linked list structure.",
      codeLines: [1, 2, 3, 4],
      tree: calculateLayout({ 
        value: 10, x: 400, y: 50,
        right: { 
          value: 20, x: 0, y: 0,
          right: { 
            value: 30, x: 0, y: 0,
            right: { 
              value: 40, x: 0, y: 0,
              right: { value: 50, x: 0, y: 0 }
            }
          }
        }
      }, 400, 50, 0)!,
      path: [10, 20, 30, 40, 50],
      operation: "balance",
      explanation: "Inserting 10, 20, 30, 40, 50 creates a right-skewed tree. Height = 5, but only 5 nodes! Search degrades to O(n). This is the BST worst case.",
      theoryConnection: "Solution: Self-balancing BSTs! AVL trees and Red-Black trees automatically rebalance after insertions/deletions to maintain O(log n) guarantee.",
      complexity: "Unbalanced: O(n) - as slow as linked list!"
    },
    {
      step: 11,
      title: "BST Applications Summary",
      description: "BSTs are fundamental in computer science with many applications.",
      codeLines: [1, 2, 33, 34, 35],
      tree: calculateLayout({ 
        value: 50, x: 400, y: 50,
        left: { 
          value: 30, x: 0, y: 0,
          left: { value: 20, x: 0, y: 0 },
          right: { value: 40, x: 0, y: 0 }
        },
        right: { 
          value: 70, x: 0, y: 0,
          left: { value: 60, x: 0, y: 0 },
          right: { value: 80, x: 0, y: 0 }
        }
      }, 400, 50, 0)!,
      path: [],
      operation: "init",
      explanation: "Common uses: 1) Database indexing (B-trees are multi-way BSTs), 2) File systems, 3) Expression parsing/evaluation, 4) Priority queues, 5) Set/map implementations (C++ std::map, Java TreeMap).",
      theoryConnection: "BSTs provide the best of both worlds: O(log n) search like sorted arrays, but with O(log n) insertion like linked lists. The foundation for many advanced data structures.",
      complexity: "Balanced BST: The holy grail of data structures!"
    },
  ];
};

// Render tree recursively
const renderTree = (node: TreeNode | undefined, parentX?: number, parentY?: number): JSX.Element[] => {
  if (!node) return [];
  
  const elements: JSX.Element[] = [];
  
  // Draw edge to parent
  if (parentX !== undefined && parentY !== undefined) {
    elements.push(
      <line
        key={`edge-${node.value}`}
        x1={parentX}
        y1={parentY + 20}
        x2={node.x}
        y2={node.y - 20}
        stroke="#30363d"
        strokeWidth="2"
      />
    );
  }
  
  // Draw node
  elements.push(
    <motion.g key={`node-${node.value}`} initial={{ scale: 0 }} animate={{ scale: 1 }}>
      <circle
        cx={node.x}
        cy={node.y}
        r={25}
        className={`transition-all ${
          node.isNew
            ? "fill-[#3fb950] stroke-[#3fb950]"
            : node.isTarget
            ? "fill-[#f0883e] stroke-[#f0883e]"
            : node.isComparing
            ? "fill-[#58a6ff] stroke-[#58a6ff]"
            : node.isVisited
            ? "fill-[#8b949e] stroke-[#8b949e]"
            : "fill-[#21262d] stroke-[#30363d]"
        }`}
        strokeWidth="3"
      />
      <text
        x={node.x}
        y={node.y}
        textAnchor="middle"
        dominantBaseline="middle"
        className={`font-bold text-lg ${
          node.isNew || node.isTarget || node.isComparing ? "fill-white" : "fill-[#c9d1d9]"
        }`}
      >
        {node.value}
      </text>
    </motion.g>
  );
  
  // Draw children
  if (node.left) {
    elements.push(...renderTree(node.left, node.x, node.y));
  }
  if (node.right) {
    elements.push(...renderTree(node.right, node.x, node.y));
  }
  
  return elements;
};

export default function BSTVisualizerEnhanced() {
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
  }, [step, setActiveLines]);

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
          <h3 className="text-white font-semibold text-lg">Binary Search Tree Visualization</h3>
          <p className="text-[#8b949e] text-sm">Left &lt; Parent &lt; Right: O(log n) search, insert, delete</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <Binary size={14} className="text-[#58a6ff]" />
            <span className="text-[#8b949e] text-xs">Height:</span>
            <span className="text-white font-mono font-bold">{Math.floor(currentStep / 3) + 1}</span>
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
          {/* Tree Display */}
          <div className="flex-1 flex items-center justify-center overflow-auto">
            <svg width="800" height="350" viewBox="0 0 800 350">
              {renderTree(step.tree)}
            </svg>
          </div>

          {/* Path indicator */}
          {step.path.length > 0 && (
            <div className="mt-4 p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg">
              <div className="flex items-center gap-2">
                <ArrowLeftRight size={16} className="text-[#58a6ff]" />
                <span className="text-[#8b949e] text-sm">Search Path: </span>
                <span className="text-white font-mono">
                  {step.path.join(" → ")}
                </span>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#3fb950]" />
              <span className="text-[#8b949e]">New</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#f0883e]" />
              <span className="text-[#8b949e]">Target</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#58a6ff]" />
              <span className="text-[#8b949e]">Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#8b949e]" />
              <span className="text-[#8b949e]">Visited</span>
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
