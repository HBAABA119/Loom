"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft, ChevronRight, Cpu, Database } from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Cell { address: number; value: string | null; type: "code" | "stack" | "heap" | "free" | null; highlighted?: boolean; }
interface Step { step: number; title: string; description: string; codeLines: number[]; memory: Cell[]; activeRegion: string; pointer: number | null; explanation: string; theoryConnection: string; complexity: string; }

const speeds = [{ label: "0.5x", value: 0.5 }, { label: "1x", value: 1 }, { label: "1.5x", value: 1.5 }, { label: "2x", value: 2 }, { label: "3x", value: 3 }];

const codeLines = ["// Memory Layout: Code, Stack, Heap", "int globalVar = 42;  // Data segment", "", "void function() {", "  int localVar = 10;   // Stack", "  int* ptr = malloc(4); // Heap", "  *ptr = 20;", "  free(ptr);  // Deallocate", "}", "", "// Memory regions:", "// Code: Program instructions (read-only)", "// Stack: Local variables, return addresses (LIFO)", "// Heap: Dynamic allocation (manual manage)", "// Data: Global/static variables"];

const generateSteps = (): Step[] => {
  const memory: Cell[] = Array.from({ length: 32 }, (_, i) => ({ address: i * 4, value: null, type: null }));
  
  return [
    { step: 0, title: "Memory Architecture", description: "How programs organize memory: Code, Stack, Heap, Data segments.", codeLines: [1, 2, 11, 12, 13, 14, 15], memory: memory.map(m => ({ ...m })), activeRegion: "all", pointer: null, explanation: "Programs use virtual memory divided into segments: Code (instructions), Data (globals/static), Stack (function calls, local vars), Heap (dynamic allocation). Each has different lifetime and management rules.", theoryConnection: "Memory hierarchy: Registers → L1 Cache → L2 Cache → RAM → Disk. Stack grows down, Heap grows up. Stack is automatic (fast), Heap is manual (flexible). Stack overflow = recursion too deep. Heap fragmentation = wasted space.", complexity: "Stack allocation: O(1). Heap allocation: O(1) amortized. Access: O(1)." },
    { step: 1, title: "Code Segment", description: "Stores compiled program instructions. Read-only, shared between processes.", codeLines: [1, 11, 12], memory: memory.map((m, i) => i < 8 ? { ...m, type: "code", value: "instr" } : m), activeRegion: "code", pointer: null, explanation: "Code segment contains machine instructions. Loaded from executable file. Marked read-only to prevent accidental modification (security). Multiple processes can share same code (shared libraries).", theoryConnection: "Harvard vs Von Neumann architecture. Modern systems use virtual memory: each process sees its own address space. Code segment usually at low addresses. Size determined at compile time.", complexity: "Code is fixed at runtime. No allocation overhead during execution." },
    { step: 2, title: "Data Segment", description: "Global and static variables. Initialized at program start.", codeLines: [2, 15], memory: memory.map((m, i) => i >= 8 && i < 12 ? { ...m, type: "code", value: i === 8 ? "42" : "global" } : m), activeRegion: "data", pointer: 32, explanation: "Data segment holds global variables and static locals. Initialized before main() runs. Lifetime = entire program execution. Two parts: initialized data (like globalVar=42) and BSS (zeroed data).", theoryConnection: "Global variables persist across function calls. Static variables inside functions keep values between calls. Both stored in data segment. Size known at compile/link time.", complexity: "Data segment size fixed. Allocation: zero overhead (part of program load)." },
    { step: 3, title: "Stack - Function Call", description: "Stack stores local variables and return addresses. LIFO structure.", codeLines: [4, 5, 13], memory: memory.map((m, i) => i >= 12 && i < 16 ? { ...m, type: "stack", value: i === 13 ? "10" : "local" } : m), activeRegion: "stack", pointer: 52, explanation: "When function() is called: return address pushed, then localVar (10) allocated on stack. Stack pointer moves down. Stack grows downward (toward lower addresses). Automatic allocation/deallocation.", theoryConnection: "Stack frame = activation record. Contains: return address, saved registers, local variables, parameters. Pushed on call, popped on return. LIFO matches function call/return pattern perfectly.", complexity: "Push/Pop: O(1). Extremely fast - single pointer move." },
    { step: 4, title: "Heap - Dynamic Allocation", description: "Heap for dynamic memory. Programmer controls lifetime.", codeLines: [6, 7, 14], memory: memory.map((m, i) => i >= 24 && i < 28 ? { ...m, type: "heap", value: i === 24 ? "ptr→20" : null } : m), activeRegion: "heap", pointer: 96, explanation: "malloc(4) allocates 4 bytes on heap. Returns address (e.g., 96). Heap grows upward. Unlike stack, heap memory persists until free() called. Programmer manages lifetime - flexible but error-prone.", theoryConnection: "Heap managed by memory allocator (ptmalloc, jemalloc). Can fragment over time. malloc: find free block, split if needed, return address. free: mark block free, coalesce adjacent free blocks.", complexity: "malloc: O(1) amortized. free: O(1). Fragmentation: can cause O(n) in worst case." },
    { step: 5, title: "Pointer Dereference", description: "Access heap memory through pointer. *ptr = 20 writes to address 96.", codeLines: [7], memory: memory.map((m, i) => i === 24 ? { ...m, type: "heap", value: "20" } : m), activeRegion: "heap", pointer: 96, explanation: "*ptr = 20 writes value 20 to heap address stored in ptr. Two memory accesses: 1) Read ptr from stack to get address (96), 2) Write 20 to address 96. Indirection adds overhead but enables dynamic structures.", theoryConnection: "Pointer = memory address. Dereference = access data at that address. Enables linked structures, dynamic arrays, objects. Core concept in C/C++. Null pointer = address 0 (invalid).", complexity: "Dereference: O(1). Two memory accesses instead of one." },
    { step: 6, title: "Memory Deallocation", description: "free(ptr) returns heap memory. Pointer becomes dangling.", codeLines: [8], memory: memory.map((m, i) => i === 24 ? { ...m, type: "free", value: null } : m), activeRegion: "heap", pointer: null, explanation: "free(ptr) marks heap block as available. Memory not cleared (for speed). ptr still holds address 96 but it's now invalid - dangling pointer. Using it = undefined behavior/segfault.", theoryConnection: "Common bugs: memory leak (forget free), use-after-free (dangling pointer), double free. Modern languages use garbage collection (GC) or smart pointers to automate. RAII pattern in C++.", complexity: "free: O(1) typically. GC: pause times vary (milliseconds to seconds)." },
    { step: 7, title: "Stack Cleanup", description: "Function returns, stack frame popped automatically.", codeLines: [4, 5, 6, 7, 8], memory: memory.map((m, i) => i >= 12 && i < 16 ? { ...m, type: "free", value: null } : m), activeRegion: "stack", pointer: 64, explanation: "function() returns. Stack pointer restored to previous position. localVar and ptr automatically deallocated. Return address popped, execution continues at caller. All automatic - no programmer action needed.", theoryConnection: "Stack cleanup is automatic and fast. No garbage collection needed. That's why stack allocation is preferred when possible. Limited by stack size (typically 1-8 MB).", complexity: "Stack cleanup: O(1) - single pointer restore. Fastest deallocation." },
  ];
};

export default function MemoryVisualizerEnhanced() {
  const { currentStep: stepIndex, totalSteps, isPlaying, playbackSpeed, togglePlay, pause, setStep, nextStep, prevStep, setTotalSteps, setPlaybackSpeed } = useTimeline();
  const { setActiveLines } = useCodeHighlight();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => { setTotalSteps(generateSteps().length); }, [setTotalSteps]);
  useEffect(() => { setCurrentStep(stepIndex); }, [stepIndex]);
  const steps = generateSteps();
  const step = steps[currentStep] || steps[0];
  useEffect(() => { if (step?.codeLines) setActiveLines(step.codeLines); }, [step]);
  useEffect(() => { let interval: NodeJS.Timeout; if (isPlaying && currentStep < steps.length - 1) { interval = setInterval(() => nextStep(), 2500 / playbackSpeed); } else if (currentStep >= steps.length - 1 && isPlaying) pause(); return () => clearInterval(interval); }, [isPlaying, currentStep, steps.length, playbackSpeed, nextStep, pause]);
  const handleReset = useCallback(() => { pause(); setStep(0); }, [pause, setStep]);

  const getCellColor = (cell: Cell) => {
    if (cell.type === "code") return "bg-[#58a6ff]/20 border-[#58a6ff] text-[#58a6ff]";
    if (cell.type === "stack") return "bg-[#3fb950]/20 border-[#3fb950] text-[#3fb950]";
    if (cell.type === "heap") return "bg-[#f0883e]/20 border-[#f0883e] text-[#f0883e]";
    if (cell.type === "free") return "bg-[#21262d] border-[#30363d] text-[#6e7681]";
    return "bg-[#161b22] border-[#30363d]";
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div><h3 className="text-white font-semibold text-lg">Memory Management</h3><p className="text-[#8b949e] text-sm">Stack | Heap | Code | Data Segments</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><Cpu size={14} className="text-[#58a6ff]" /><span className="text-[#8b949e] text-xs">Active:</span><span className="text-[#f0883e] font-bold capitalize">{step.activeRegion}</span></div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full"><div className="h-full bg-[#58a6ff] rounded-full transition-all" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} /></div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          <div className="flex-1 grid grid-cols-8 gap-2 content-center">
            {step.memory.map((cell, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.01 }} className={`h-12 border-2 rounded-lg flex items-center justify-center text-xs font-mono ${getCellColor(cell)} ${step.pointer === cell.address ? "ring-2 ring-white" : ""}`}>
                <div className="text-center"><div className="text-[#6e7681] text-[10px]">0x{cell.address.toString(16).toUpperCase()}</div><div className="truncate px-1">{cell.value || (cell.type === "free" ? "·" : "")}</div></div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg"><span className="text-[#58a6ff] text-xs">Code</span><p className="text-white font-bold">Read-only instructions</p></div>
            <div className="p-3 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-lg"><span className="text-[#3fb950] text-xs">Stack</span><p className="text-white font-bold">Local vars, LIFO</p></div>
            <div className="p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg"><span className="text-[#f0883e] text-xs">Heap</span><p className="text-white font-bold">Dynamic allocation</p></div>
            <div className="p-3 bg-[#21262d] border border-[#30363d] rounded-lg"><span className="text-[#6e7681] text-xs">Free</span><p className="text-white font-bold">Available</p></div>
          </div>
        </div>
        <div className="w-96 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-5 border-b border-[#30363d]"><span className="text-[#58a6ff] text-xs font-mono uppercase tracking-wider">Step {currentStep + 1}: {step.title}</span><p className="text-[#c9d1d9] mt-3 leading-relaxed">{step.description}</p></div>
          <div className="p-5 border-b border-[#30363d] flex-1 overflow-y-auto"><h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">What is Happening</h4><p className="text-[#c9d1d9] text-sm leading-relaxed mb-4">{step.explanation}</p><div className="mt-4 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg"><h4 className="text-[#3fb950] text-xs uppercase tracking-wider mb-1">💡 Theory Connection</h4><p className="text-[#c9d1d9] text-sm leading-relaxed">{step.theoryConnection}</p></div><div className="mt-4 p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg"><h4 className="text-[#58a6ff] text-xs uppercase tracking-wider mb-1">⏱️ Complexity</h4><p className="text-[#c9d1d9] text-sm font-mono">{step.complexity}</p></div></div>
          <div className="p-4 bg-[#0d1117] max-h-56 overflow-y-auto"><h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">Code Reference</h4><div className="text-xs font-mono">{codeLines.map((line, i) => (<div key={i} className={`px-2 py-0.5 rounded ${step.codeLines?.includes(i + 1) ? "bg-[#238636]/30 text-[#7ee787] border-l-2 border-[#238636]" : "text-[#8b949e]"}`}><span className="text-[#6e7681] w-6 inline-block select-none">{i + 1}</span>{line || " "}</div>))}</div></div>
        </div>
      </div>
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><button onClick={() => { pause(); setStep(0); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><SkipBack size={18} /></button><button onClick={prevStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><ChevronLeft size={20} /></button><button onClick={togglePlay} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center gap-2">{isPlaying ? <Pause size={18} /> : <Play size={18} />}{isPlaying ? "Pause" : "Play"}</button><button onClick={nextStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><ChevronRight size={20} /></button><button onClick={() => { pause(); setStep(steps.length - 1); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><SkipForward size={18} /></button><button onClick={handleReset} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><RotateCcw size={18} /></button></div>
          <div className="flex items-center gap-3"><span className="text-[#8b949e] text-sm">Speed:</span><div className="flex gap-1">{speeds.map(s => <button key={s.value} onClick={() => setPlaybackSpeed(s.value)} className={`px-2 py-1 rounded text-xs font-medium ${playbackSpeed === s.value ? "bg-[#58a6ff] text-white" : "bg-[#21262d] text-[#8b949e]"}`}>{s.label}</button>)}</div></div>
        </div>
      </div>
    </div>
  );
}
