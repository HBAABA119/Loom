"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Network, Play, RotateCcw } from "lucide-react";

interface Node {
  id: number;
  x: number;
  y: number;
  visited: boolean;
}

interface Edge {
  from: number;
  to: number;
  weight?: number;
}

export default function GraphTraversalMinigameEnhanced() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 0, x: 50, y: 50, visited: false },
    { id: 1, x: 150, y: 30, visited: false },
    { id: 2, x: 250, y: 50, visited: false },
    { id: 3, x: 100, y: 120, visited: false },
    { id: 4, x: 200, y: 120, visited: false },
  ]);

  const [edges] = useState<Edge[]>([
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 0, to: 3 },
    { from: 1, to: 4 },
    { from: 3, to: 4 },
  ]);

  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [visitedOrder, setVisitedOrder] = useState<number[]>([]);

  const visitNode = (id: number) => {
    if (nodes[id].visited) return;
    
    setNodes(prev => prev.map(n => n.id === id ? { ...n, visited: true } : n));
    setCurrentNode(id);
    setVisitedOrder(prev => [...prev, id]);
  };

  const reset = () => {
    setNodes(prev => prev.map(n => ({ ...n, visited: false })));
    setCurrentNode(null);
    setVisitedOrder([]);
  };

  const runBFS = () => {
    reset();
    let queue = [0];
    const visited = new Set<number>();
    const order: number[] = [];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (!visited.has(current)) {
        visited.add(current);
        order.push(current);
        
        const neighbors = edges
          .filter(e => e.from === current || e.to === current)
          .map(e => e.from === current ? e.to : e.from)
          .filter(n => !visited.has(n));
        
        queue.push(...neighbors);
      }
    }
    
    order.forEach((id, i) => {
      setTimeout(() => visitNode(id), i * 800);
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <Network size={24} className="text-[#58a6ff]" />
          Graph Traversal
        </h2>
        <div className="flex gap-2">
          <button
            onClick={runBFS}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition-colors"
          >
            <Play size={16} />
            Run BFS
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4">
        <div className="flex-1 bg-[#161b22] rounded-lg p-4 relative">
          <svg className="w-full h-full">
            {edges.map((edge, i) => {
              const fromNode = nodes[edge.from];
              const toNode = nodes[edge.to];
              return (
                <line
                  key={i}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#30363d"
                  strokeWidth={2}
                />
              );
            })}
            {nodes.map((node) => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={20}
                  fill={node.visited ? "#238636" : "#21262d"}
                  stroke={currentNode === node.id ? "#f0883e" : "#30363d"}
                  strokeWidth={2}
                  className="cursor-pointer"
                  onClick={() => visitNode(node.id)}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize={14}
                  fontWeight="bold"
                >
                  {node.id}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="w-48 bg-[#161b22] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Visited Order</h3>
          <div className="flex flex-wrap gap-2">
            {visitedOrder.map((id, i) => (
              <motion.span
                key={id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-[#238636] text-white rounded-full text-sm font-bold"
              >
                {id}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
