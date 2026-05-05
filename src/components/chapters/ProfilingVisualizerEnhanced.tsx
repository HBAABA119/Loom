"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart2, Play, RotateCcw, Activity, Clock,
  Flame, Layers, Zap
} from "lucide-react";

interface FunctionProfile {
  name: string;
  time: number;
  calls: number;
  color: string;
}

const profileData: FunctionProfile[] = [
  { name: "processData", time: 45, calls: 1000, color: "#f85149" },
  { name: "parseJSON", time: 30, calls: 500, color: "#f0883e" },
  { name: "validate", time: 15, calls: 800, color: "#79c0ff" },
  { name: "transform", time: 7, calls: 300, color: "#3fb950" },
  { name: "saveResult", time: 3, calls: 100, color: "#a371f7" },
];

export default function ProfilingVisualizerEnhanced() {
  const [isRunning, setIsRunning] = useState(false);
  const [showFlameGraph, setShowFlameGraph] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const reset = () => {
    setIsRunning(false);
    setShowFlameGraph(false);
    setHighlighted(null);
  };

  const runProfiler = () => {
    setIsRunning(true);
    setTimeout(() => {
      setShowFlameGraph(true);
      setIsRunning(false);
    }, 2000);
  };

  const totalTime = profileData.reduce((sum, f) => sum + f.time, 0);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#f0883e]/20 rounded-lg">
            <BarChart2 size={20} className="text-[#f0883e]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Performance Profiler</h3>
            <p className="text-[#8b949e] text-sm">Flame graph visualization</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Stats */}
        <div className="w-1/3 flex flex-col border-r border-[#30363d] p-4">
          <div className="text-[#8b949e] text-xs mb-3">Hot Functions</div>
          <div className="space-y-2">
            {profileData.map((func, i) => (
              <motion.div
                key={func.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={() => setHighlighted(func.name)}
                onMouseLeave={() => setHighlighted(null)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  highlighted === func.name
                    ? "bg-[#f0883e]/20 border-[#f0883e]"
                    : "bg-[#21262d] border-[#30363d]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: func.color }}
                  />
                  <span className="text-white font-medium">{func.name}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-[#8b949e]">{func.time}% time</span>
                  <span className="text-[#6e7681]">{func.calls} calls</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Flame Graph */}
        <div className="w-2/3 flex flex-col p-4">
          <div className="text-[#8b949e] text-xs mb-3">Flame Graph</div>
          <div className="flex-1 bg-[#161b22] rounded-lg border border-[#30363d] p-4">
            {showFlameGraph ? (
              <div className="h-full flex flex-col">
                {profileData.map((func, i) => {
                  const width = (func.time / totalTime) * 100;
                  return (
                    <motion.div
                      key={func.name}
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      onMouseEnter={() => setHighlighted(func.name)}
                      onMouseLeave={() => setHighlighted(null)}
                      className="h-12 rounded-lg mb-2 flex items-center px-3 cursor-pointer"
                      style={{ 
                        backgroundColor: func.color,
                        opacity: highlighted && highlighted !== func.name ? 0.3 : 1
                      }}
                    >
                      <span className="text-white font-medium text-sm">{func.name}</span>
                      <span className="ml-auto text-white text-xs">{func.time}%</span>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[#6e7681]">
                Click &quot;Profile&quot; to generate flame graph
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <button
            onClick={runProfiler}
            disabled={isRunning || showFlameGraph}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            <Activity size={16} />
            {isRunning ? "Profiling..." : "Profile"}
          </button>
          <button
            onClick={reset}
            className="p-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
          </button>
          
          {showFlameGraph && (
            <div className="ml-auto flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-[#f85149]" />
                <span className="text-[#8b949e]">Hot path:</span>
                <span className="text-[#f85149]">{profileData[0].name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#8b949e]" />
                <span className="text-[#8b949e]">Total:</span>
                <span className="text-white">{totalTime}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
