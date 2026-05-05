"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Play, RotateCcw } from "lucide-react";

interface Point {
  x: number;
  y: number;
  id: number;
}

export default function KDTreeMinigameEnhanced() {
  const [points, setPoints] = useState<Point[]>([
    { x: 30, y: 40, id: 0 },
    { x: 70, y: 60, id: 1 },
    { x: 50, y: 20, id: 2 },
    { x: 20, y: 80, id: 3 },
    { x: 80, y: 30, id: 4 },
  ]);

  const [searchPoint, setSearchPoint] = useState({ x: 50, y: 50 });
  const [found, setFound] = useState<Point | null>(null);

  const search = () => {
    const threshold = 15;
    const nearest = points.find(p => 
      Math.abs(p.x - searchPoint.x) < threshold && 
      Math.abs(p.y - searchPoint.y) < threshold
    );
    setFound(nearest || null);
  };

  const reset = () => {
    setFound(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <Layers size={24} className="text-[#f0883e]" />
          KD Tree Search
        </h2>
        <div className="flex gap-2">
          <button onClick={search} className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg">Search</button>
          <button onClick={reset} className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg">Reset</button>
        </div>
      </div>

      <div className="flex-1 flex gap-4">
        <div className="flex-1 bg-[#161b22] rounded-lg p-4 relative">
          <svg className="w-full h-full">
            <line x1="50" y1="0" x2="50" y2="100" stroke="#30363d" strokeWidth={1} />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#30363d" strokeWidth={1} />
            
            {points.map((p) => (
              <motion.circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={8}
                fill={found?.id === p.id ? "#238636" : "#21262d"}
                stroke="#58a6ff"
                strokeWidth={2}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            ))}
            
            <motion.circle
              cx={searchPoint.x}
              cy={searchPoint.y}
              r={10}
              fill="none"
              stroke="#f0883e"
              strokeWidth={2}
              strokeDasharray="5,5"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
        </div>

        <div className="w-48 bg-[#161b22] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Search Point</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[#8b949e] text-sm">X</label>
              <input
                type="range"
                min="0"
                max="100"
                value={searchPoint.x}
                onChange={(e) => setSearchPoint({ ...searchPoint, x: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-[#8b949e] text-sm">Y</label>
              <input
                type="range"
                min="0"
                max="100"
                value={searchPoint.y}
                onChange={(e) => setSearchPoint({ ...searchPoint, y: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            {found && (
              <div className="p-3 bg-[#238636] text-white rounded-lg">
                Found: Point {found.id}
              </div>
            )}
            {!found && found !== null && (
              <div className="p-3 bg-[#f85149] text-white rounded-lg">
                No match
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
