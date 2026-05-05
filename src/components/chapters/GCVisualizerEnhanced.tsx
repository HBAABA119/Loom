"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, RotateCcw, Trash2, CheckCircle, 
  Circle, Target, Layers, Activity, Zap,
  MousePointer
} from "lucide-react";

type ObjectStatus = "white" | "grey" | "black" | "free";

interface HeapObject {
  id: number;
  status: ObjectStatus;
  size: number;
  refs: number[];
  name: string;
}

interface GCState {
  phase: "idle" | "mark" | "sweep" | "complete";
  marked: number;
  swept: number;
  currentScanning: number | null;
}

const initialHeap: HeapObject[] = [
  { id: 0, status: "black", size: 2, refs: [1, 2], name: "root" },
  { id: 1, status: "white", size: 1, refs: [3], name: "A" },
  { id: 2, status: "white", size: 1, refs: [], name: "B" },
  { id: 3, status: "white", size: 1, refs: [4], name: "C" },
  { id: 4, status: "white", size: 1, refs: [], name: "D" },
  { id: 5, status: "white", size: 1, refs: [6], name: "E" }, // Garbage - cycle
  { id: 6, status: "white", size: 1, refs: [5], name: "F" }, // Garbage - cycle
  { id: 7, status: "white", size: 1, refs: [], name: "G" }, // Garbage - unreachable
];

export default function GCVisualizerEnhanced() {
  const [heap, setHeap] = useState<HeapObject[]>(initialHeap);
  const [gcState, setGcState] = useState<GCState>({
    phase: "idle",
    marked: 0,
    swept: 0,
    currentScanning: null
  });
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [markQueue, setMarkQueue] = useState<number[]>([]);

  const reset = () => {
    setHeap(initialHeap.map(obj => ({ ...obj, status: obj.id === 0 ? "black" : "white" })));
    setGcState({
      phase: "idle",
      marked: 0,
      swept: 0,
      currentScanning: null
    });
    setMarkQueue([]);
    setIsRunning(false);
  };

  const startGC = () => {
    setGcState(prev => ({ ...prev, phase: "mark", marked: 0, swept: 0 }));
    // Start with root's references
    const root = heap.find(o => o.id === 0);
    if (root) {
      setMarkQueue(root.refs);
      setHeap(prev => prev.map(o => 
        o.id === 0 ? { ...o, status: "black" } : o
      ));
    }
    setIsRunning(true);
  };

  const stepGC = useCallback(() => {
    setGcState(prevState => {
      const state = { ...prevState };
      
      if (state.phase === "mark") {
        if (markQueue.length > 0) {
          const objId = markQueue[0];
          setMarkQueue(q => q.slice(1));
          
          setHeap(prevHeap => {
            const obj = prevHeap.find(o => o.id === objId);
            if (!obj || obj.status !== "white") return prevHeap;
            
            // Mark this object grey (being processed)
            const newHeap = prevHeap.map(o => 
              o.id === objId ? { ...o, status: "grey" } : o
            );
            
            // Add its references to queue
            setTimeout(() => {
              setMarkQueue(q => [...q, ...obj.refs.filter(refId => {
                const refObj = prevHeap.find(o => o.id === refId);
                return refObj && refObj.status === "white";
              })]);
              
              // Mark as black (fully processed)
              setHeap(p => p.map(o => 
                o.id === objId ? { ...o, status: "black" } : o
              ));
              setGcState(s => ({ ...s, marked: s.marked + 1 }));
            }, speed / 2);
            
            return newHeap;
          });
          
          state.currentScanning = objId;
        } else {
          // Mark phase complete, start sweep
          state.phase = "sweep";
          state.currentScanning = null;
        }
      } else if (state.phase === "sweep") {
        setHeap(prevHeap => {
          const whiteObjects = prevHeap.filter(o => o.status === "white");
          if (whiteObjects.length > 0) {
            const toSweep = whiteObjects[0];
            state.swept += toSweep.size;
            return prevHeap.map(o => 
              o.id === toSweep.id ? { ...o, status: "free" } : o
            );
          } else {
            state.phase = "complete";
            setIsRunning(false);
          }
          return prevHeap;
        });
      }
      
      return state;
    });
  }, [markQueue, speed]);

  useEffect(() => {
    if (isRunning && gcState.phase !== "idle" && gcState.phase !== "complete") {
      const timer = setTimeout(() => {
        stepGC();
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [isRunning, gcState.phase, markQueue.length, speed, stepGC]);

  const getStatusColor = (status: ObjectStatus) => {
    switch (status) {
      case "white": return "#8b949e"; // Unvisited/garbage
      case "grey": return "#f0883e"; // Being scanned
      case "black": return "#238636"; // Reachable
      case "free": return "#21262d"; // Freed (with strikethrough)
    }
  };

  const liveObjects = heap.filter(o => o.status === "black" || o.status === "grey").length;
  const garbageObjects = heap.filter(o => o.status === "white" || o.status === "free").length;
  const totalSize = heap.reduce((sum, o) => o.status !== "free" ? sum + o.size : sum, 0);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#238636]/20 rounded-lg">
            <Trash2 size={20} className="text-[#3fb950]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Garbage Collector</h3>
            <p className="text-[#8b949e] text-sm">Tri-color marking visualization</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <Circle size={10} className="text-[#8b949e]" />
            White
          </span>
          <span className="flex items-center gap-1">
            <Circle size={10} className="text-[#f0883e]" />
            Grey
          </span>
          <span className="flex items-center gap-1">
            <Circle size={10} className="text-[#238636]" />
            Black
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left - Heap Visualization */}
        <div className="flex-1 flex flex-col p-4">
          {/* Phase Indicator */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                gcState.phase === "idle" ? "bg-[#21262d] text-[#8b949e]" :
                gcState.phase === "mark" ? "bg-[#f0883e]/20 text-[#f0883e] animate-pulse" :
                gcState.phase === "sweep" ? "bg-[#f85149]/20 text-[#f85149] animate-pulse" :
                "bg-[#238636]/20 text-[#3fb950]"
              }`}>
                {gcState.phase === "idle" && "Ready"}
                {gcState.phase === "mark" && "Marking Phase"}
                {gcState.phase === "sweep" && "Sweeping Phase"}
                {gcState.phase === "complete" && "Complete"}
              </div>
              {gcState.currentScanning !== null && (
                <span className="text-[#8b949e] text-sm">
                  Scanning: Object {gcState.currentScanning}
                </span>
              )}
            </div>
          </div>

          {/* Heap Grid */}
          <div className="flex-1 grid grid-cols-4 gap-3 content-start">
            <AnimatePresence>
              {heap.map((obj) => (
                <motion.div
                  key={obj.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ 
                    scale: gcState.currentScanning === obj.id ? 1.05 : 1,
                    opacity: obj.status === "free" ? 0.3 : 1
                  }}
                  className={`relative p-3 rounded-lg border-2 transition-all ${
                    obj.id === 0 ? "col-span-2" : ""
                  }`}
                  style={{
                    backgroundColor: `${getStatusColor(obj.status)}20`,
                    borderColor: getStatusColor(obj.status),
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{obj.name}</span>
                    <span className="text-xs text-[#8b949e]">id:{obj.id}</span>
                  </div>
                  <div className="text-xs text-[#8b949e]">Size: {obj.size} KB</div>
                  
                  {obj.refs.length > 0 && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      <span className="text-xs text-[#6e7681]">refs:</span>
                      {obj.refs.map(ref => (
                        <span key={ref} className="text-xs px-1 bg-[#21262d] rounded text-[#c9d1d9]">
                          {heap.find(o => o.id === ref)?.name || ref}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {obj.status === "free" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[#f85149] font-bold text-lg">✗</span>
                    </div>
                  )}
                  
                  {obj.id === 0 && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-[#58a6ff] text-white text-xs rounded-full">
                      ROOT
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={startGC}
              disabled={isRunning || gcState.phase !== "idle"}
              className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              <Play size={16} />
              Start GC
            </button>
            <button
              onClick={() => setIsRunning(!isRunning)}
              disabled={gcState.phase === "idle" || gcState.phase === "complete"}
              className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? "Pause" : "Resume"}
            </button>
            <button
              onClick={reset}
              className="p-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[#8b949e] text-sm">Speed:</span>
              <input
                type="range"
                min="200"
                max="1500"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
        </div>

        {/* Right - Stats & Legend */}
        <div className="w-64 border-l border-[#30363d] bg-[#161b22] p-4 space-y-4">
          {/* Stats */}
          <div>
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Activity size={16} className="text-[#58a6ff]" />
              Statistics
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#8b949e]">Live Objects</span>
                <span className="text-[#3fb950] font-bold">{liveObjects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8b949e]">Garbage</span>
                <span className="text-[#f85149] font-bold">{garbageObjects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8b949e]">Marked</span>
                <span className="text-[#f0883e] font-bold">{gcState.marked}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8b949e]">Freed</span>
                <span className="text-[#f85149] font-bold">{gcState.swept} KB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8b949e]">Heap Used</span>
                <span className="text-white font-bold">{totalSize} KB</span>
              </div>
            </div>
          </div>

          {/* Algorithm Steps */}
          <div>
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Layers size={16} className="text-[#79c0ff]" />
              Algorithm
            </h4>
            <div className="space-y-1 text-xs">
              <div className={`p-2 rounded ${gcState.phase === "mark" ? "bg-[#f0883e]/20 text-[#f0883e]" : "text-[#8b949e]"}`}>
                1. Mark Phase
                <div className="text-[#6e7681] mt-1">Trace from roots, mark reachable</div>
              </div>
              <div className={`p-2 rounded ${gcState.phase === "sweep" ? "bg-[#f85149]/20 text-[#f85149]" : "text-[#8b949e]"}`}>
                2. Sweep Phase
                <div className="text-[#6e7681] mt-1">Free unmarked objects</div>
              </div>
              <div className={`p-2 rounded ${gcState.phase === "complete" ? "bg-[#238636]/20 text-[#3fb950]" : "text-[#8b949e]"}`}>
                3. Complete
                <div className="text-[#6e7681] mt-1">Memory reclaimed</div>
              </div>
            </div>
          </div>

          {/* Educational Note */}
          <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d]">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-[#f0883e]" />
              <span className="text-[#f0883e] text-xs font-medium">Key Insight</span>
            </div>
            <p className="text-[#8b949e] text-xs">
              Objects E↔F form a cycle but are garbage because neither is reachable from root.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
