"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TreeNode {
  id: string;
  value: number;
  x: number;
  y: number;
  left: string | null;
  right: string | null;
}

const initialNodes: TreeNode[] = [
  { id: "root", value: 50, x: 300, y: 50, left: null, right: null }
];

export default function BSTMinigame() {
  const [nodes, setNodes] = useState<TreeNode[]>(initialNodes);
  const [toInsert, setToInsert] = useState<number[]>([30, 70, 20, 40, 60, 80]);
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState<string>("");
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const getNextPosition = (parentValue: number, newValue: number, parentX: number, parentY: number): { x: number; y: number } => {
    const isLeft = newValue < parentValue;
    const offsetX = isLeft ? -80 : 80;
    const offsetY = 70;
    return { x: parentX + offsetX, y: parentY + offsetY };
  };

  const findParent = (value: number, nodeList: TreeNode[]): { parent: TreeNode | null; isLeft: boolean } => {
    const root = nodeList.find(n => n.id === "root");
    if (!root) return { parent: null, isLeft: false };
    
    let current: TreeNode = root;

    while (true) {
      if (value < current.value) {
        if (current.left === null) return { parent: current, isLeft: true };
        const next = nodeList.find(n => n.id === current.left);
        if (!next) break;
        current = next;
      } else {
        if (current.right === null) return { parent: current, isLeft: false };
        const next = nodeList.find(n => n.id === current.right);
        if (!next) break;
        current = next;
      }
    }
    return { parent: null, isLeft: false };
  };

  const insertNode = useCallback(() => {
    if (toInsert.length === 0) {
      setGameComplete(true);
      setFeedback("🎉 BST Complete! Great job!");
      return;
    }

    const value = toInsert[0];
    const { parent, isLeft } = findParent(value, nodes);

    if (!parent) {
      setFeedback("❌ Cannot insert - position occupied!");
      return;
    }

    const newId = `node${Date.now()}`;
    const pos = getNextPosition(parent.value, value, parent.x, parent.y);
    
    const newNode: TreeNode = {
      id: newId,
      value,
      x: pos.x,
      y: pos.y,
      left: null,
      right: null
    };

    const updatedNodes = nodes.map(n => 
      n.id === parent.id 
        ? { ...n, [isLeft ? "left" : "right"]: newId }
        : n
    );
    
    setNodes([...updatedNodes, newNode]);
    setToInsert(toInsert.slice(1));
    setCurrentStep(currentStep + 1);
    setScore(score + 10);
    setFeedback(`✅ Inserted ${value}. ${isLeft ? "Left" : "Right"} of ${parent.value}`);
  }, [nodes, toInsert, currentStep, score]);

  const resetGame = () => {
    setNodes(initialNodes);
    setToInsert([30, 70, 20, 40, 60, 80]);
    setCurrentStep(0);
    setScore(0);
    setFeedback("");
    setGameComplete(false);
  };

  const getEdge = (node: TreeNode) => {
    const edges = [];
    if (node.left) {
      const leftNode = nodes.find(n => n.id === node.left);
      if (leftNode) {
        edges.push(
          <line key={`${node.id}-left`} x1={node.x} y1={node.y + 20} x2={leftNode.x} y2={leftNode.y - 20} stroke="#30363d" strokeWidth={2} />
        );
      }
    }
    if (node.right) {
      const rightNode = nodes.find(n => n.id === node.right);
      if (rightNode) {
        edges.push(
          <line key={`${node.id}-right`} x1={node.x} y1={node.y + 20} x2={rightNode.x} y2={rightNode.y - 20} stroke="#30363d" strokeWidth={2} />
        );
      }
    }
    return edges;
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">BST Construction Minigame</h3>
        <div className="flex items-center gap-4">
          <span className="text-[#8b949e]">Score: <span className="text-[#58a6ff] font-bold">{score}</span></span>
          <span className="text-[#8b949e]">Remaining: <span className="text-[#f0883e] font-bold">{toInsert.length}</span></span>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden">
        {/* Tree SVG */}
        <svg className="w-full h-full" viewBox="0 0 600 350">
          {/* Edges */}
          {nodes.flatMap(getEdge)}
          
          {/* Nodes */}
          <AnimatePresence>
            {nodes.map((node) => (
              <motion.g key={node.id} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <circle cx={node.x} cy={node.y} r={22} fill="#21262d" stroke="#30363d" strokeWidth={2} />
                <text x={node.x} y={node.y} dy="5" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">{node.value}</text>
              </motion.g>
            ))}
          </AnimatePresence>
        </svg>

        {/* Next to insert */}
        {toInsert.length > 0 && (
          <div className="absolute top-4 left-4 p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
            <span className="text-[#8b949e]">Next to insert: </span>
            <span className="text-[#f0883e] font-mono font-bold text-xl">{toInsert[0]}</span>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <p className={feedback.includes("❌") ? "text-[#f85149]" : feedback.includes("✅") ? "text-[#3fb950]" : "text-[#58a6ff]"}>{feedback}</p>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-[#30363d] flex items-center justify-between">
        <div className="text-sm text-[#8b949e]">
          <p>Insert nodes following BST rules:</p>
          <p className="text-xs mt-1">Smaller values go LEFT, larger go RIGHT</p>
        </div>
        <div className="flex items-center gap-2">
          {!gameComplete ? (
            <button onClick={insertNode} disabled={toInsert.length === 0} className="px-6 py-3 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed font-semibold">
              Insert Node
            </button>
          ) : (
            <button onClick={resetGame} className="px-6 py-3 bg-[#8957e5] text-white rounded-md hover:bg-[#a371f7] font-semibold">
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
