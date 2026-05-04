"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  visited: boolean;
}

interface Edge {
  from: string;
  to: string;
}

export default function GraphMinigame() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: "A", label: "A", x: 100, y: 150, visited: false },
    { id: "B", label: "B", x: 250, y: 80, visited: false },
    { id: "C", label: "C", x: 250, y: 220, visited: false },
    { id: "D", label: "D", x: 400, y: 150, visited: false },
  ]);
  const [edges] = useState<Edge[]>([
    { from: "A", to: "B" }, { from: "A", to: "C" }, { from: "B", to: "D" }, { from: "C", to: "D" },
  ]);
  const [order, setOrder] = useState<string[]>(["A", "B", "C", "D"]);
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const clickNode = (id: string) => {
    if (userOrder.includes(id)) return;
    const newOrder = [...userOrder, id];
    setUserOrder(newOrder);
    setNodes(nodes.map(n => n.id === id ? { ...n, visited: true } : n));
    if (newOrder.length === 4) {
      const correct = newOrder.every((n, i) => n === order[i]);
      setScore(correct ? 100 : 0);
    }
  };

  const reset = () => {
    setNodes(nodes.map(n => ({ ...n, visited: false })));
    setUserOrder([]);
    setScore(0);
  };

  const getNode = (id: string) => nodes.find(n => n.id === id);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">BFS Traversal Minigame</h3>
        <span className="text-[#8b949e]">Score: <span className="text-[#58a6ff] font-bold">{score}</span></span>
      </div>
      <div className="flex-1 p-4 relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 500 300">
          {edges.map((e) => {
            const from = getNode(e.from), to = getNode(e.to);
            if (!from || !to) return null;
            return <line key={`${e.from}-${e.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#30363d" strokeWidth={3} />;
          })}
          {nodes.map((n) => (
            <motion.g key={n.id} onClick={() => clickNode(n.id)} className="cursor-pointer">
              <circle cx={n.x} cy={n.y} r={30} fill={n.visited ? "#238636" : "#21262d"} stroke={n.visited ? "#3fb950" : "#8957e5"} strokeWidth={3} />
              <text x={n.x} y={n.y} dy="5" fill="white" fontSize="18" fontWeight="bold" textAnchor="middle">{n.label}</text>
              {userOrder.includes(n.id) && <text x={n.x} y={n.y - 40} fill="#58a6ff" fontSize="14" textAnchor="middle">#{userOrder.indexOf(n.id) + 1}</text>}
            </motion.g>
          ))}
        </svg>
        {userOrder.length === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-4 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg text-center">
            <p className={score > 0 ? "text-[#3fb950]" : "text-[#f85149]"}>{score > 0 ? "✅ Perfect BFS order!" : "❌ Not quite right. Try again!"}</p>
            <p className="text-[#8b949e] text-sm mt-1">Correct: A → B → C → D</p>
          </motion.div>
        )}
      </div>
      <div className="p-4 border-t border-[#30363d] flex items-center justify-between">
        <span className="text-[#8b949e] text-sm">Click nodes in BFS order starting from A</span>
        <button onClick={reset} className="px-4 py-2 bg-[#8957e5] text-white rounded-md hover:bg-[#a371f7]">Reset</button>
      </div>
    </div>
  );
}
