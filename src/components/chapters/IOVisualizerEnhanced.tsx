"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Zap, Play, RotateCcw, Layers, CheckCircle, Clock,
  ArrowRight, Server, Activity
} from "lucide-react";

interface Connection {
  id: number;
  name: string;
  status: "waiting" | "ready" | "processing" | "done";
}

export default function IOVisualizerEnhanced() {
  const [connections, setConnections] = useState<Connection[]>([
    { id: 1, name: "Client A", status: "waiting" },
    { id: 2, name: "Client B", status: "waiting" },
    { id: 3, name: "Client C", status: "waiting" },
    { id: 4, name: "Client D", status: "waiting" },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState<number | null>(null);

  const reset = () => {
    setConnections([
      { id: 1, name: "Client A", status: "waiting" },
      { id: 2, name: "Client B", status: "waiting" },
      { id: 3, name: "Client C", status: "waiting" },
      { id: 4, name: "Client D", status: "waiting" },
    ]);
    setIsRunning(false);
    setCompletedCount(0);
    setCurrentProcessing(null);
  };

  const runEventLoop = () => {
    setIsRunning(true);
    let processed = 0;
    
    const processNext = () => {
      setConnections(prev => {
        const ready = prev.find(c => c.status === "waiting");
        if (!ready) {
          setIsRunning(false);
          return prev;
        }
        
        setCurrentProcessing(ready.id);
        
        setTimeout(() => {
          setConnections(p => p.map(c => 
            c.id === ready.id ? { ...c, status: "done" } : c
          ));
          setCompletedCount(p => p + 1);
          setCurrentProcessing(null);
          processed++;
          
          if (processed < prev.length) {
            setTimeout(processNext, 500);
          }
        }, 1500);
        
        return prev.map(c => c.id === ready.id ? { ...c, status: "processing" } : c);
      });
    };
    
    processNext();
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#f0883e]/20 rounded-lg">
            <Zap size={20} className="text-[#f0883e]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Event Loop</h3>
            <p className="text-[#8b949e] text-sm">Single-threaded I/O multiplexing</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Connections */}
        <div className="w-1/2 flex flex-col border-r border-[#30363d] p-4">
          <div className="text-[#8b949e] text-xs mb-3">Connections</div>
          <div className="space-y-2">
            {connections.map(conn => (
              <motion.div
                key={conn.id}
                className={`p-3 rounded-lg border transition-colors ${
                  conn.status === "done"
                    ? "bg-[#238636]/10 border-[#238636]"
                    : conn.status === "processing"
                    ? "bg-[#f0883e]/20 border-[#f0883e]"
                    : "bg-[#21262d] border-[#30363d]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Server size={14} className="text-[#8b949e]" />
                  <span className="text-white font-medium">{conn.name}</span>
                  <span className={`ml-auto text-xs px-2 py-1 rounded ${
                    conn.status === "done"
                      ? "bg-[#238636]/20 text-[#3fb950]"
                      : conn.status === "processing"
                      ? "bg-[#f0883e]/20 text-[#f0883e]"
                      : "bg-[#30363d] text-[#8b949e]"
                  }`}>
                    {conn.status}
                  </span>
                </div>
                {conn.status === "processing" && (
                  <div className="mt-2 h-1 bg-[#30363d] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#f0883e]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5 }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Event Loop */}
        <div className="w-1/2 flex flex-col p-4">
          <div className="text-[#8b949e] text-xs mb-3">Event Loop Status</div>
          <div className="p-4 bg-[#21262d] rounded-lg border border-[#30363d]">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-[#f0883e]" />
              <span className="text-white font-medium">Loop Iteration</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-[#8b949e]" />
                <span className="text-[#c9d1d9]">Check I/O readiness (epoll_wait)</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight size={14} className="text-[#8b949e]" />
                <span className="text-[#c9d1d9]">Process ready events</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#8b949e]" />
                <span className="text-[#c9d1d9]">Run callbacks (setTimeout, promises)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#161b22] rounded-lg border border-[#30363d]">
            <div className="flex items-center justify-between">
              <span className="text-[#8b949e] text-sm">Completed</span>
              <span className="text-[#3fb950] font-bold">{completedCount} / {connections.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <button
            onClick={runEventLoop}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            <Play size={16} />
            Run Event Loop
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
