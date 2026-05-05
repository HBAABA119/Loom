"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Cpu, Play, RotateCcw, Lock, Unlock, Database,
  ArrowRight, AlertTriangle, CheckCircle
} from "lucide-react";

interface Thread {
  id: number;
  name: string;
  state: "running" | "waiting" | "done";
  currentAction: string;
  progress: number;
}

interface Resource {
  id: string;
  name: string;
  locked: boolean;
  lockedBy: number | null;
}

export default function ConcurrencyVisualizerEnhanced() {
  const [threads, setThreads] = useState<Thread[]>([
    { id: 1, name: "Thread A", state: "running", currentAction: "Ready", progress: 0 },
    { id: 2, name: "Thread B", state: "running", currentAction: "Ready", progress: 0 },
  ]);
  const [resources, setResources] = useState<Resource[]>([
    { id: "r1", name: "Account X", locked: false, lockedBy: null },
    { id: "r2", name: "Account Y", locked: false, lockedBy: null },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [raceCondition, setRaceCondition] = useState(false);
  const [sharedValue, setSharedValue] = useState(0);

  const reset = () => {
    setThreads([
      { id: 1, name: "Thread A", state: "running", currentAction: "Ready", progress: 0 },
      { id: 2, name: "Thread B", state: "running", currentAction: "Ready", progress: 0 },
    ]);
    setResources([
      { id: "r1", name: "Account X", locked: false, lockedBy: null },
      { id: "r2", name: "Account Y", locked: false, lockedBy: null },
    ]);
    setIsRunning(false);
    setRaceCondition(false);
    setSharedValue(0);
  };

  const runSimulation = () => {
    setIsRunning(true);
    setSharedValue(0);
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      
      setThreads(prev => prev.map(t => {
        if (step <= 3 && t.id === 1) {
          return { ...t, progress: step * 33, currentAction: step === 1 ? "Read value (0)" : step === 2 ? "Compute (0+1)" : "Write (1)" };
        }
        if (step >= 2 && step <= 4 && t.id === 2) {
          const localStep = step - 1;
          return { ...t, progress: localStep * 33, currentAction: localStep === 1 ? "Read value (0)" : localStep === 2 ? "Compute (0+1)" : "Write (1)" };
        }
        return t;
      }));
      
      if (step === 3) {
        setSharedValue(1);
      }
      if (step === 5) {
        // Both threads wrote 1, expected 2
        setRaceCondition(true);
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 1000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#a371f7]/20 rounded-lg">
            <Cpu size={20} className="text-[#a371f7]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Race Condition Demo</h3>
            <p className="text-[#8b949e] text-sm">Concurrent access without synchronization</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Threads */}
        <div className="w-1/2 flex flex-col border-r border-[#30363d] p-4">
          <div className="text-[#8b949e] text-xs mb-3">Threads</div>
          <div className="space-y-3">
            {threads.map(thread => (
              <div key={thread.id} className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu size={14} className="text-[#a371f7]" />
                  <span className="text-white font-medium">{thread.name}</span>
                  <span className={`ml-auto text-xs px-2 py-1 rounded ${
                    thread.state === "running" ? "bg-[#238636]/20 text-[#3fb950]" : "bg-[#f0883e]/20 text-[#f0883e]"
                  }`}>
                    {thread.state}
                  </span>
                </div>
                <div className="text-sm text-[#8b949e] mb-2">{thread.currentAction}</div>
                <div className="h-2 bg-[#30363d] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#a371f7]"
                    animate={{ width: `${thread.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shared State */}
        <div className="w-1/2 flex flex-col p-4">
          <div className="text-[#8b949e] text-xs mb-3">Shared State</div>
          <div className="p-4 bg-[#21262d] rounded-lg border border-[#30363d] mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Database size={14} className="text-[#f0883e]" />
              <span className="text-white">Counter</span>
            </div>
            <div className="text-4xl font-bold text-[#f0883e] font-mono">{sharedValue}</div>
            <div className="text-xs text-[#8b949e] mt-1">Expected: 2</div>
          </div>

          {raceCondition && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-[#f85149]/10 border border-[#f85149] rounded-lg"
            >
              <div className="flex items-center gap-2 text-[#f85149]">
                <AlertTriangle size={16} />
                <span className="font-medium">Race Condition Detected!</span>
              </div>
              <p className="text-sm text-[#c9d1d9] mt-2">
                Both threads read 0, incremented to 1, and wrote back. Final value is 1, not 2.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            <Play size={16} />
            Run Simulation
          </button>
          <button
            onClick={reset}
            className="p-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
