"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, RotateCcw, Plus, Grid3X3,
  Layers, ArrowRight, Activity
} from "lucide-react";

type BlockStatus = "free" | "allocated" | "fragmented";

interface MemoryBlock {
  id: number;
  size: number;
  status: BlockStatus;
  data?: string;
}

export default function AllocatorVisualizerEnhanced() {
  const [heap, setHeap] = useState<MemoryBlock[]>([
    { id: 0, size: 4, status: "free" },
    { id: 1, size: 2, status: "allocated", data: "A" },
    { id: 2, size: 3, status: "free" },
    { id: 3, size: 2, status: "allocated", data: "B" },
    { id: 4, size: 4, status: "free" },
    { id: 5, size: 1, status: "allocated", data: "C" },
    { id: 6, size: 3, status: "free" },
  ]);
  const [strategy, setStrategy] = useState<"first-fit" | "best-fit" | "worst-fit">("first-fit");
  const [nextId, setNextId] = useState(7);
  const [allocationLog, setAllocationLog] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 19, used: 5, free: 14, fragmentation: 0 });

  const calculateStats = useCallback((blocks: MemoryBlock[]) => {
    const total = blocks.reduce((sum, b) => sum + b.size, 0);
    const used = blocks.filter(b => b.status === "allocated").reduce((sum, b) => sum + b.size, 0);
    const free = total - used;
    
    // Calculate fragmentation: free blocks that can't satisfy max request
    const freeBlocks = blocks.filter(b => b.status === "free");
    const maxFree = Math.max(...freeBlocks.map(b => b.size), 0);
    const fragmented = freeBlocks.filter(b => b.size < 3).reduce((sum, b) => sum + b.size, 0);
    
    setStats({ total, used, free, fragmentation: Math.round((fragmented / free) * 100) || 0 });
  }, []);

  const allocate = (size: number, label: string) => {
    setHeap(prevHeap => {
      let newHeap = [...prevHeap];
      let allocated = false;
      let log = "";

      if (strategy === "first-fit") {
        // Find first block that fits
        for (let i = 0; i < newHeap.length; i++) {
          if (newHeap[i].status === "free" && newHeap[i].size >= size) {
            const remaining = newHeap[i].size - size;
            
            // Split block if there's remaining space
            if (remaining > 0) {
              newHeap.splice(i, 1,
                { id: nextId, size, status: "allocated", data: label },
                { id: newHeap[i].id, size: remaining, status: "free" }
              );
            } else {
              newHeap[i] = { ...newHeap[i], status: "allocated", data: label };
            }
            
            log = `First-fit: allocated ${size}KB for ${label} at block ${i}`;
            allocated = true;
            break;
          }
        }
      } else if (strategy === "best-fit") {
        // Find smallest block that fits
        let bestIdx = -1;
        let bestSize = Infinity;
        
        for (let i = 0; i < newHeap.length; i++) {
          if (newHeap[i].status === "free" && newHeap[i].size >= size && newHeap[i].size < bestSize) {
            bestIdx = i;
            bestSize = newHeap[i].size;
          }
        }
        
        if (bestIdx >= 0) {
          const remaining = bestSize - size;
          
          if (remaining > 0) {
            newHeap.splice(bestIdx, 1,
              { id: nextId, size, status: "allocated", data: label },
              { id: newHeap[bestIdx].id, size: remaining, status: "free" }
            );
          } else {
            newHeap[bestIdx] = { ...newHeap[bestIdx], status: "allocated", data: label };
          }
          
          log = `Best-fit: allocated ${size}KB for ${label} at block ${bestIdx} (exact fit: ${remaining === 0})`;
          allocated = true;
        }
      }

      if (!allocated) {
        log = `Failed to allocate ${size}KB - no suitable block found`;
      } else {
        setNextId(id => id + 1);
      }

      setAllocationLog(logs => [...logs.slice(-3), log]);
      calculateStats(newHeap);
      return newHeap;
    });
  };

  const free = (id: number) => {
    setHeap(prevHeap => {
      const newHeap = prevHeap.map(b => 
        b.id === id ? { ...b, status: "free", data: undefined } : b
      );
      
      // Coalesce adjacent free blocks
      const coalesced: MemoryBlock[] = [];
      for (const block of newHeap) {
        if (coalesced.length > 0 && 
            coalesced[coalesced.length - 1].status === "free" && 
            block.status === "free") {
          coalesced[coalesced.length - 1].size += block.size;
        } else {
          coalesced.push({ ...block });
        }
      }
      
      const freedBlock = prevHeap.find(b => b.id === id);
      setAllocationLog(logs => [...logs.slice(-3), `Freed ${freedBlock?.data} (${freedBlock?.size}KB), coalesced adjacent free blocks`]);
      calculateStats(coalesced);
      return coalesced;
    });
  };

  const reset = () => {
    setHeap([
      { id: 0, size: 4, status: "free" },
      { id: 1, size: 2, status: "allocated", data: "A" },
      { id: 2, size: 3, status: "free" },
      { id: 3, size: 2, status: "allocated", data: "B" },
      { id: 4, size: 4, status: "free" },
      { id: 5, size: 1, status: "allocated", data: "C" },
      { id: 6, size: 3, status: "free" },
    ]);
    setNextId(7);
    setAllocationLog([]);
    setStats({ total: 19, used: 5, free: 14, fragmentation: 0 });
  };

  const quickAllocations = [
    { size: 2, label: "D" },
    { size: 3, label: "E" },
    { size: 1, label: "F" },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#79c0ff]/20 rounded-lg">
            <Grid3X3 size={20} className="text-[#79c0ff]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Memory Allocator</h3>
            <p className="text-[#8b949e] text-sm">Free list allocation strategies</p>
          </div>
        </div>
        <select
          value={strategy}
          onChange={(e) => setStrategy(e.target.value as any)}
          className="px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-lg text-white text-sm"
        >
          <option value="first-fit">First Fit</option>
          <option value="best-fit">Best Fit</option>
          <option value="worst-fit">Worst Fit</option>
        </select>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left - Heap Visualization */}
        <div className="flex-1 flex flex-col p-4">
          {/* Heap Blocks */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-2xl">
              <div className="flex h-32 rounded-lg overflow-hidden border-2 border-[#30363d]">
                <AnimatePresence>
                  {heap.map((block, i) => {
                    const width = (block.size / stats.total) * 100;
                    return (
                      <motion.div
                        key={block.id}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: `${width}%`, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className={`relative flex items-center justify-center border-r border-[#30363d] last:border-r-0 cursor-pointer transition-all hover:brightness-110 ${
                          block.status === "allocated" 
                            ? "bg-[#58a6ff]/30" 
                            : "bg-[#238636]/20"
                        }`}
                        style={{
                          minWidth: "40px",
                        }}
                        onClick={() => block.status === "allocated" && free(block.id)}
                      >
                        {block.status === "allocated" ? (
                          <div className="text-center">
                            <span className="text-[#58a6ff] font-bold text-lg">{block.data}</span>
                            <span className="block text-xs text-[#8b949e]">{block.size}KB</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-[#238636] text-xs">FREE</span>
                            <span className="block text-xs text-[#8b949e]">{block.size}KB</span>
                          </div>
                        )}
                        
                        {block.status === "allocated" && (
                          <div className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-[#f85149] text-xs">Click to free</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              
              {/* Scale */}
              <div className="flex justify-between mt-2 text-xs text-[#6e7681]">
                <span>0 KB</span>
                <span>{Math.round(stats.total / 2)} KB</span>
                <span>{stats.total} KB</span>
              </div>
            </div>
          </div>

          {/* Quick Allocate Buttons */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[#8b949e] text-sm">Quick Allocate:</span>
            {quickAllocations.map(({ size, label }) => (
              <button
                key={label}
                onClick={() => allocate(size, label)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg text-sm transition-colors"
              >
                <Plus size={14} />
                {label} ({size}KB)
              </button>
            ))}
            <button
              onClick={reset}
              className="ml-auto p-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Log */}
          <div className="mt-3 p-3 bg-[#161b22] rounded-lg h-24 overflow-auto">
            <div className="text-[#8b949e] text-xs mb-2">Activity Log</div>
            <div className="space-y-1">
              {allocationLog.length === 0 ? (
                <div className="text-[#6e7681] text-sm">Click a block to free it, or use Quick Allocate...</div>
              ) : (
                allocationLog.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-[#7ee787]"
                  >
                    {log}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right - Stats */}
        <div className="w-64 border-l border-[#30363d] bg-[#161b22] p-4 space-y-4">
          <div>
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Activity size={16} className="text-[#58a6ff]" />
              Statistics
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#8b949e]">Total Heap</span>
                <span className="text-white font-bold">{stats.total} KB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8b949e]">Used</span>
                <span className="text-[#58a6ff] font-bold">{stats.used} KB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8b949e]">Free</span>
                <span className="text-[#238636] font-bold">{stats.free} KB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8b949e]">Fragmentation</span>
                <span className={`font-bold ${stats.fragmentation > 30 ? "text-[#f85149]" : "text-[#7ee787]"}`}>
                  {stats.fragmentation}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Layers size={16} className="text-[#79c0ff]" />
              Allocation Strategies
            </h4>
            <div className="space-y-2 text-xs">
              <div className={`p-2 rounded ${strategy === "first-fit" ? "bg-[#58a6ff]/20" : "bg-[#21262d]"}`}>
                <span className="text-[#58a6ff] font-medium">First Fit</span>
                <p className="text-[#8b949e] mt-1">Use first block that fits. Fast but may fragment.</p>
              </div>
              <div className={`p-2 rounded ${strategy === "best-fit" ? "bg-[#58a6ff]/20" : "bg-[#21262d]"}`}>
                <span className="text-[#58a6ff] font-medium">Best Fit</span>
                <p className="text-[#8b949e] mt-1">Use smallest adequate block. Slower, less waste.</p>
              </div>
              <div className={`p-2 rounded ${strategy === "worst-fit" ? "bg-[#58a6ff]/20" : "bg-[#21262d]"}`}>
                <span className="text-[#58a6ff] font-medium">Worst Fit</span>
                <p className="text-[#8b949e] mt-1">Use largest block. Leaves bigger remainders.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
