"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, HelpCircle, RotateCcw, ArrowRight, CheckCircle, Lock, Unlock, Target, Zap, Binary, Search } from "lucide-react";

interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
}

interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  task: "build" | "search" | "findmin" | "traverse" | "validate";
  initialTree?: TreeNode;
  valuesToInsert?: number[];
  searchValue?: number;
  hint: string;
  educationalNote: string;
}

const levels: Level[] = [
  {
    id: 1,
    title: "Build a BST",
    description: "Insert values in the correct BST positions",
    objective: "Insert 50, 30, 70 to create a valid BST",
    task: "build",
    valuesToInsert: [50, 30, 70],
    hint: "Root is first value. For each new value: if smaller go left, if larger go right. Click the correct position to insert.",
    educationalNote: "BST property: All left descendants < parent < all right descendants. This must hold for EVERY node."
  },
  {
    id: 2,
    title: "BST Search",
    description: "Find a value efficiently using BST properties",
    objective: "Search for value 40 in the tree [50,30,70,20,40,60,80]",
    task: "search",
    initialTree: {
      value: 50,
      left: { value: 30, left: { value: 20 }, right: { value: 40 } },
      right: { value: 70, left: { value: 60 }, right: { value: 80 } }
    },
    searchValue: 40,
    hint: "Start at root. 40 < 50, go left. 40 > 30, go right. Found! Click each node in the search path.",
    educationalNote: "BST search eliminates half the tree at each step. For 1 million nodes, only ~20 comparisons needed vs 500,000 for linear search!"
  },
  {
    id: 3,
    title: "Find Minimum",
    description: "The minimum value is always the leftmost node",
    objective: "Find the minimum value in the tree",
    task: "findmin",
    initialTree: {
      value: 50,
      left: { value: 30, left: { value: 20, left: { value: 10 } }, right: { value: 40 } },
      right: { value: 70, left: { value: 60 }, right: { value: 80 } }
    },
    hint: "Minimum is always leftmost. Keep going left until you can't anymore. Click the leftmost node.",
    educationalNote: "FindMin is O(log n) in BST but O(n) in unsorted array. BSTs naturally organize data by value."
  },
  {
    id: 4,
    title: "Inorder Traversal",
    description: "Left → Node → Right gives sorted order",
    objective: "Perform inorder traversal and click nodes in sorted order",
    task: "traverse",
    initialTree: {
      value: 50,
      left: { value: 30, left: { value: 20 }, right: { value: 40 } },
      right: { value: 70, left: { value: 60 }, right: { value: 80 } }
    },
    hint: "Inorder: Left subtree, then current node, then right subtree. Result should be: 20, 30, 40, 50, 60, 70, 80.",
    educationalNote: "BSTs are self-sorting! No need for separate sort algorithm. Tree sort is O(n log n) - same as quicksort."
  },
  {
    id: 5,
    title: "Validate BST",
    description: "Check if a tree satisfies BST property",
    objective: "Is this a valid BST? Check all nodes (Yes/No)",
    task: "validate",
    initialTree: {
      value: 50,
      left: { value: 30, left: { value: 20 }, right: { value: 60 } },  // 60 violates!
      right: { value: 70, left: { value: 60 }, right: { value: 80 } }
    },
    hint: "Check: Is every left child < parent? Is every right child > parent? Look at node 30's right child...",
    educationalNote: "Common interview question! Must validate that ALL descendants satisfy the BST property, not just immediate children."
  }
];

// Calculate node positions for display
const calculatePositions = (node: TreeNode | undefined, x: number, y: number, level: number): Map<number, {x: number, y: number, node: TreeNode}> => {
  const positions = new Map<number, {x: number, y: number, node: TreeNode}>();
  if (!node) return positions;
  
  const horizontalGap = 120 / (level + 1);
  
  positions.set(node.value, { x, y, node });
  
  if (node.left) {
    const leftPositions = calculatePositions(node.left, x - horizontalGap, y + 60, level + 1);
    leftPositions.forEach((val, key) => positions.set(key, val));
  }
  if (node.right) {
    const rightPositions = calculatePositions(node.right, x + horizontalGap, y + 60, level + 1);
    rightPositions.forEach((val, key) => positions.set(key, val));
  }
  
  return positions;
};

// Count nodes in tree
const countNodes = (node: TreeNode | undefined): number => {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
};

// Inorder traversal
const inorderTraversal = (node: TreeNode | undefined): number[] => {
  if (!node) return [];
  return [...inorderTraversal(node.left), node.value, ...inorderTraversal(node.right)];
};

// Check if valid BST
const isValidBST = (node: TreeNode | undefined, min = -Infinity, max = Infinity): boolean => {
  if (!node) return true;
  if (node.value <= min || node.value >= max) return false;
  return isValidBST(node.left, min, node.value) && isValidBST(node.right, node.value, max);
};

export default function BSTMinigameEnhanced() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [tree, setTree] = useState<TreeNode | undefined>(undefined);
  const [clickedNodes, setClickedNodes] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);
  const [insertIndex, setInsertIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");

  const level = levels[currentLevel];

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  const resetLevel = () => {
    setTree(level.initialTree);
    setClickedNodes([]);
    setGameState("playing");
    setFeedback("");
    setShowHint(false);
    setScore(0);
    setAttempts(0);
    setInsertIndex(0);
    setUserAnswer("");
  };

  const handleNodeClick = (value: number) => {
    if (gameState !== "playing") return;

    if (level.task === "search") {
      // Search path validation
      const target = level.searchValue!;
      const newClicked = [...clickedNodes, value];
      setClickedNodes(newClicked);
      setAttempts(a => a + 1);

      // Build correct path
      const correctPath: number[] = [];
      let current = tree;
      while (current) {
        correctPath.push(current.value);
        if (target === current.value) break;
        if (target < current.value) {
          current = current.left;
        } else {
          current = current.right;
        }
      }

      // Check if current click is correct
      if (correctPath[newClicked.length - 1] === value) {
        if (value === target) {
          const points = Math.max(10, 50 - attempts);
          setScore(points);
          setTotalScore(s => s + points);
          setGameState("won");
          setFeedback(`🎉 Found ${target}! Path: ${newClicked.join(" → ")}. +${points} points`);
          if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
            setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
          }
        } else {
          setFeedback(`✅ ${value}: ${target < value ? `${target} < ${value}, go left` : `${target} > ${value}, go right`}`);
        }
      } else {
        setFeedback(`❌ Wrong path! Try again.`);
        setClickedNodes([]);
      }
    } else if (level.task === "findmin") {
      // Find minimum - should click leftmost
      setAttempts(a => a + 1);
      
      // Find actual minimum
      let minNode = tree!;
      while (minNode.left) {
        minNode = minNode.left;
      }

      if (value === minNode.value) {
        const points = Math.max(10, 50 - attempts);
        setScore(points);
        setTotalScore(s => s + points);
        setGameState("won");
        setFeedback(`🎉 Correct! Minimum is ${value}. +${points} points`);
        if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
          setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
        }
      } else {
        setFeedback(`❌ ${value} is not the minimum. Keep going left!`);
      }
    } else if (level.task === "traverse") {
      // Inorder traversal - click in sorted order
      const sorted = inorderTraversal(tree);
      const newClicked = [...clickedNodes, value];
      setClickedNodes(newClicked);
      setAttempts(a => a + 1);

      if (sorted[newClicked.length - 1] === value) {
        if (newClicked.length === sorted.length) {
          const points = Math.max(10, 50 - attempts);
          setScore(points);
          setTotalScore(s => s + points);
          setGameState("won");
          setFeedback(`🎉 Perfect inorder traversal! +${points} points`);
          if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
            setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
          }
        } else {
          setFeedback(`✅ Good! Next: ${sorted[newClicked.length]}`);
        }
      } else {
        setFeedback(`❌ Wrong order! Expected: ${sorted.join(", ")}`);
        setClickedNodes([]);
      }
    }
  };

  const handleInsert = (position: "left" | "right" | "root") => {
    if (gameState !== "playing" || !level.valuesToInsert) return;
    
    const value = level.valuesToInsert[insertIndex];
    if (!value) return;

    setAttempts(a => a + 1);

    if (position === "root" && !tree) {
      setTree({ value });
      setFeedback(`✅ Inserted ${value} as root`);
      nextInsertOrWin();
    } else if (tree) {
      // Try to find correct position
      let current = tree;
      let parent = null as TreeNode | null;
      let dir = "" as "left" | "right";

      while (true) {
        if (value === current.value) {
          setFeedback(`❌ ${value} already exists!`);
          return;
        }
        if (value < current.value) {
          if (!current.left) {
            parent = current;
            dir = "left";
            break;
          }
          current = current.left;
        } else {
          if (!current.right) {
            parent = current;
            dir = "right";
            break;
          }
          current = current.right;
        }
      }

      if (position === dir && parent) {
        // Create new tree with inserted value
        const newTree = JSON.parse(JSON.stringify(tree)); // Deep clone
        const insertInto = (node: TreeNode): boolean => {
          if (node.value === parent.value) {
            if (dir === "left") node.left = { value };
            else node.right = { value };
            return true;
          }
          if (node.left && insertInto(node.left)) return true;
          if (node.right && insertInto(node.right)) return true;
          return false;
        };
        insertInto(newTree);
        setTree(newTree);
        setFeedback(`✅ Inserted ${value} as ${dir} child of ${parent.value}`);
        nextInsertOrWin();
      } else {
        setFeedback(`❌ Wrong position! ${value} should go ${dir} of ${parent?.value}`);
      }
    }
  };

  const nextInsertOrWin = () => {
    const nextIdx = insertIndex + 1;
    if (nextIdx >= (level.valuesToInsert?.length || 0)) {
      const points = Math.max(10, 50 - attempts);
      setScore(points);
      setTotalScore(s => s + points);
      setGameState("won");
      setFeedback(`🎉 BST built successfully! +${points} points`);
      if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
        setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
      }
    } else {
      setInsertIndex(nextIdx);
    }
  };

  const checkValidation = () => {
    if (gameState !== "playing") return;
    setAttempts(a => a + 1);

    const isValid = isValidBST(tree);
    const userSaidYes = userAnswer.toLowerCase() === "yes";
    const userSaidNo = userAnswer.toLowerCase() === "no";

    if ((isValid && userSaidYes) || (!isValid && userSaidNo)) {
      const points = Math.max(10, 50 - attempts);
      setScore(points);
      setTotalScore(s => s + points);
      setGameState("won");
      setFeedback(`🎉 Correct! ${isValid ? "Valid" : "Invalid"} BST. +${points} points`);
      if (!isValid) setFeedback(`🎉 Correct! Invalid BST - node 30's right child 60 violates BST property. +${points} points`);
      if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
        setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
      }
    } else {
      setFeedback(`❌ Incorrect! Check all nodes carefully.`);
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  const positions = tree ? calculatePositions(tree, 300, 40, 0) : new Map();
  const currentInsertValue = level.valuesToInsert?.[insertIndex];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">BST Challenge</h3>
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
        {/* Left - Tree Area */}
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

          {/* Task info */}
          {currentInsertValue && (
            <div className="mb-4 p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg">
              <span className="text-[#f0883e]">Insert: </span>
              <span className="text-white font-bold text-xl">{currentInsertValue}</span>
            </div>
          )}
          {level.searchValue && (
            <div className="mb-4 p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg">
              <span className="text-[#58a6ff]">Search for: </span>
              <span className="text-white font-bold text-xl">{level.searchValue}</span>
            </div>
          )}

          {/* Tree Visualization */}
          <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg relative overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 600 250" preserveAspectRatio="xMidYMid meet">
              {/* Edges */}
              {Array.from(positions.entries()).map(([value, pos]) => {
                const node = pos.node;
                return (
                  <g key={`edges-${value}`}>
                    {node.left && positions.get(node.left.value) && (
                      <line
                        x1={pos.x}
                        y1={pos.y + 20}
                        x2={positions.get(node.left.value)!.x}
                        y2={positions.get(node.left.value)!.y - 20}
                        stroke="#30363d"
                        strokeWidth="2"
                      />
                    )}
                    {node.right && positions.get(node.right.value) && (
                      <line
                        x1={pos.x}
                        y1={pos.y + 20}
                        x2={positions.get(node.right.value)!.x}
                        y2={positions.get(node.right.value)!.y - 20}
                        stroke="#30363d"
                        strokeWidth="2"
                      />
                    )}
                  </g>
                );
              })}
              
              {/* Nodes */}
              {Array.from(positions.entries()).map(([value, pos]) => (
                <motion.g
                  key={`node-${value}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="cursor-pointer"
                  onClick={() => handleNodeClick(value)}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={22}
                    className={`transition-all cursor-pointer hover:stroke-[#58a6ff] ${
                      clickedNodes.includes(value)
                        ? "fill-[#3fb950] stroke-[#3fb950]"
                        : "fill-[#21262d] stroke-[#30363d]"
                    }`}
                    strokeWidth="3"
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`font-bold pointer-events-none ${
                      clickedNodes.includes(value) ? "fill-white" : "fill-[#c9d1d9]"
                    }`}
                  >
                    {value}
                  </text>
                </motion.g>
              ))}
            </svg>

            {/* Empty tree message */}
            {!tree && level.task === "build" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => handleInsert("root")}
                  className="px-6 py-3 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium"
                >
                  Insert {currentInsertValue} as Root
                </button>
              </div>
            )}
          </div>

          {/* Build controls */}
          {level.task === "build" && tree && currentInsertValue && (
            <div className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
              <p className="text-[#8b949e] text-sm mb-2">Where should {currentInsertValue} go?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleInsert("left")}
                  className="px-4 py-2 bg-[#58a6ff] hover:bg-[#79b8ff] text-white rounded-lg"
                >
                  Left Child
                </button>
                <button
                  onClick={() => handleInsert("right")}
                  className="px-4 py-2 bg-[#f0883e] hover:bg-[#f5a623] text-white rounded-lg"
                >
                  Right Child
                </button>
              </div>
            </div>
          )}

          {/* Validation controls */}
          {level.task === "validate" && (
            <div className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
              <p className="text-[#8b949e] text-sm mb-2">Is this a valid BST?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Yes or No"
                  className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white placeholder-[#6e7681] focus:border-[#58a6ff] focus:outline-none"
                />
                <button
                  onClick={checkValidation}
                  className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg"
                >
                  Check
                </button>
              </div>
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
