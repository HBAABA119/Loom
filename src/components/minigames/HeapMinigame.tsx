"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeapNode {
  id: string;
  value: number;
  index: number;
}

export default function HeapMinigame() {
  const [heap, setHeap] = useState<HeapNode[]>([
    { id: "h0", value: 50, index: 0 },
    { id: "h1", value: 30, index: 1 },
    { id: "h2", value: 40, index: 2 },
  ]);
  const [toInsert, setToInsert] = useState<number[]>([45, 25, 60, 35]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [gameComplete, setGameComplete] = useState(false);

  const parent = (i: number) => Math.floor((i - 1) / 2);
  const left = (i: number) => 2 * i + 1;
  const right = (i: number) => 2 * i + 2;

  const isValidHeap = (nodes: HeapNode[]) => {
    for (const node of nodes) {
      const li = left(node.index), ri = right(node.index);
      const leftChild = nodes.find(n => n.index === li);
      const rightChild = nodes.find(n => n.index === ri);
      if (leftChild && leftChild.value > node.value) return false;
      if (rightChild && rightChild.value > node.value) return false;
    }
    return true;
  };

  const insertValue = useCallback(() => {
    if (toInsert.length === 0) {
      if (isValidHeap(heap)) {
        setGameComplete(true);
        setFeedback("🎉 Heap is valid! Great job!");
      } else {
        setFeedback("⚠️ Heap property violated! Fix it by heapifying.");
      }
      return;
    }

    const value = toInsert[0];
    const newIndex = heap.length;
    const newNode: HeapNode = { id: `h${Date.now()}`, value, index: newIndex };
    
    setHeap([...heap, newNode]);
    setToInsert(toInsert.slice(1));
    setFeedback(`Inserted ${value} at index ${newIndex}. Heapify up needed?`);
  }, [heap, toInsert]);

  const heapifyUp = useCallback(() => {
    if (heap.length <= 1) {
      setFeedback("Nothing to heapify!");
      return;
    }

    let nodes = [...heap];
    let i = nodes.length - 1;
    let swaps = 0;

    while (i > 0) {
      const p = parent(i);
      const current = nodes.find(n => n.index === i);
      const parentNode = nodes.find(n => n.index === p);
      
      if (!current || !parentNode) break;
      
      if (current.value > parentNode.value) {
        // Swap indices
        const tempIdx = current.index;
        current.index = parentNode.index;
        parentNode.index = tempIdx;
        swaps++;
        i = p;
      } else {
        break;
      }
    }

    if (swaps > 0) {
      setHeap(nodes);
      setScore(score + swaps * 5);
      setFeedback(`✅ Heapified up! ${swaps} swap(s) made.`);
    } else {
      setFeedback("No swaps needed - heap property satisfied!");
    }
  }, [heap, score]);

  const resetGame = () => {
    setHeap([
      { id: "h0", value: 50, index: 0 },
      { id: "h1", value: 30, index: 1 },
      { id: "h2", value: 40, index: 2 },
    ]);
    setToInsert([45, 25, 60, 35]);
    setScore(0);
    setFeedback("");
    setGameComplete(false);
  };

  // Calculate positions for tree layout
  const getX = (index: number) => {
    const level = Math.floor(Math.log2(index + 1));
    const posInLevel = index - Math.pow(2, level) + 1;
    const nodesInLevel = Math.pow(2, level);
    const levelWidth = 400;
    const nodeWidth = levelWidth / nodesInLevel;
    return 100 + nodeWidth * posInLevel + nodeWidth / 2;
  };

  const getY = (index: number) => Math.floor(Math.log2(index + 1)) * 70 + 50;

  const sortedNodes = [...heap].sort((a, b) => a.index - b.index);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Max Heap Construction Minigame</h3>
        <div className="flex items-center gap-4">
          <span className="text-[#8b949e]">Score: <span className="text-[#58a6ff] font-bold">{score}</span></span>
          <span className="text-[#8b949e]">Remaining: <span className="text-[#f0883e] font-bold">{toInsert.length}</span></span>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden">
        {/* Tree View */}
        <svg className="w-full h-2/3" viewBox="0 0 500 220">
          {sortedNodes.map((node) => {
            if (node.index === 0) return null;
            const pIdx = parent(node.index);
            const parentNode = sortedNodes.find(n => n.index === pIdx);
            if (!parentNode) return null;
            return (
              <line key={`edge-${node.index}`} x1={getX(node.index)} y1={getY(node.index)} x2={getX(parentNode.index)} y2={getY(parentNode.index)} stroke="#30363d" strokeWidth={2} />
            );
          })}
          <AnimatePresence>
            {sortedNodes.map((node) => (
              <motion.g key={node.id} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <circle cx={getX(node.index)} cy={getY(node.index)} r={22} fill="#21262d" stroke="#30363d" strokeWidth={2} />
                <text x={getX(node.index)} y={getY(node.index)} dy="5" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">{node.value}</text>
                <text x={getX(node.index)} y={getY(node.index) + 35} fill="#8b949e" fontSize="10" textAnchor="middle">i:{node.index}</text>
              </motion.g>
            ))}
          </AnimatePresence>
        </svg>

        {/* Array View */}
        <div className="absolute top-4 left-4 right-4 flex justify-center gap-1">
          {sortedNodes.map((node) => (
            <div key={node.id} className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center bg-[#21262d] border border-[#30363d] rounded text-white font-mono text-sm">{node.value}</div>
              <span className="text-xs text-[#8b949e]">{node.index}</span>
            </div>
          ))}
        </div>

        {/* Next to insert */}
        {toInsert.length > 0 && !gameComplete && (
          <div className="absolute top-20 left-4 p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
            <span className="text-[#8b949e]">Next to insert: </span>
            <span className="text-[#f0883e] font-mono font-bold text-xl">{toInsert[0]}</span>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-20 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <p className={feedback.includes("❌") || feedback.includes("⚠️") ? "text-[#f85149]" : feedback.includes("✅") || feedback.includes("🎉") ? "text-[#3fb950]" : "text-[#58a6ff]"}>{feedback}</p>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-[#30363d] flex items-center justify-between">
        <div className="text-sm text-[#8b949e]">
          <p>Build a valid max heap:</p>
          <p className="text-xs mt-1">Parent ≥ Children. Use Heapify Up after insert!</p>
        </div>
        <div className="flex items-center gap-2">
          {!gameComplete ? (
            <>
              <button onClick={insertValue} disabled={toInsert.length === 0 && isValidHeap(heap)} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 font-semibold">
                {toInsert.length > 0 ? "Insert" : "Check"}
              </button>
              <button onClick={heapifyUp} className="px-4 py-2 bg-[#8957e5] text-white rounded-md hover:bg-[#a371f7] font-semibold">
                Heapify Up
              </button>
            </>
          ) : (
            <button onClick={resetGame} className="px-6 py-2 bg-[#8957e5] text-white rounded-md hover:bg-[#a371f7] font-semibold">
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
