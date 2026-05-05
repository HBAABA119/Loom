"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Hexagon, Play, RotateCcw } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

export default function GeometryMinigameEnhanced() {
  const [points, setPoints] = useState<Point[]>([
    { x: 50, y: 20 },
    { x: 80, y: 70 },
    { x: 20, y: 70 },
  ]);

  const [testPoint, setTestPoint] = useState<Point>({ x: 50, y: 50 });
  const [isInside, setIsInside] = useState<boolean | null>(null);

  const pointInPolygon = (point: Point, polygon: Point[]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;

      const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const check = () => {
    setIsInside(pointInPolygon(testPoint, points));
  };

  const reset = () => {
    setIsInside(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <Hexagon size={24} className="text-[#d2a8ff]" />
          Point in Polygon
        </h2>
        <div className="flex gap-2">
          <button onClick={check} className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg">Check</button>
          <button onClick={reset} className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg">Reset</button>
        </div>
      </div>

      <div className="flex-1 flex gap-4">
        <div className="flex-1 bg-[#161b22] rounded-lg p-4 relative">
          <svg className="w-full h-full">
            <polygon
              points={points.map(p => `${p.x},${p.y}`).join(" ")}
              fill="rgba(88, 166, 255, 0.2)"
              stroke="#58a6ff"
              strokeWidth={2}
            />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={5} fill="#58a6ff" />
            ))}
            <motion.circle
              cx={testPoint.x}
              cy={testPoint.y}
              r={8}
              fill={isInside === true ? "#238636" : isInside === false ? "#f85149" : "#f0883e"}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            />
          </svg>
        </div>

        <div className="w-48 bg-[#161b22] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Test Point</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[#8b949e] text-sm">X</label>
              <input
                type="range"
                min="0"
                max="100"
                value={testPoint.x}
                onChange={(e) => setTestPoint({ ...testPoint, x: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-[#8b949e] text-sm">Y</label>
              <input
                type="range"
                min="0"
                max="100"
                value={testPoint.y}
                onChange={(e) => setTestPoint({ ...testPoint, y: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            {isInside !== null && (
              <div className={`p-3 rounded-lg ${isInside ? 'bg-[#238636]' : 'bg-[#f85149]'} text-white`}>
                {isInside ? "Inside polygon" : "Outside polygon"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
