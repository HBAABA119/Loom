"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, RotateCcw, Zap, Flame, Gauge,
  Layers, ArrowRight, Code, Cpu, Activity,
  Clock, TrendingUp, CheckCircle
} from "lucide-react";

type CodePhase = "bytecode" | "warmup" | "compiling" | "native";

interface Optimization {
  name: string;
  description: string;
  speedup: number;
  applied: boolean;
}

const optimizations: Optimization[] = [
  { name: "Inlining", description: "Replace call with callee body", speedup: 1.5, applied: false },
  { name: "Devirtualization", description: "Convert virtual to direct call", speedup: 2.0, applied: false },
  { name: "Constant Folding", description: "Compute constants at compile time", speedup: 1.3, applied: false },
  { name: "Escape Analysis", description: "Stack allocation for non-escaping objects", speedup: 1.8, applied: false },
  { name: "Loop Unrolling", description: "Reduce loop overhead", speedup: 1.4, applied: false },
  { name: "Bounds Check Elim", description: "Remove array bounds checks", speedup: 1.6, applied: false },
];

export default function JITVisualizerEnhanced() {
  const [phase, setPhase] = useState<CodePhase>("bytecode");
  const [invocationCount, setInvocationCount] = useState(0);
  const [compilationThreshold] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const [executionSpeed, setExecutionSpeed] = useState(100); // ms per iteration
  const [totalTime, setTotalTime] = useState(0);
  const [iterationCount, setIterationCount] = useState(0);
  const [appliedOpts, setAppliedOpts] = useState<string[]>([]);
  const [showIR, setShowIR] = useState(false);

  const phaseInfo = {
    bytecode: { 
      label: "Bytecode (Interpreter)", 
      color: "#8b949e",
      speed: 100,
      description: "Executing bytecode in interpreter"
    },
    warmup: { 
      label: "Warmup (Profiling)", 
      color: "#f0883e",
      speed: 80,
      description: "Collecting profiling data"
    },
    compiling: { 
      label: "JIT Compiling", 
      color: "#d2a8ff",
      speed: 20,
      description: "Compiling to native code"
    },
    native: { 
      label: "Native Code", 
      color: "#238636",
      speed: 10,
      description: "Running optimized native code"
    },
  };

  const reset = () => {
    setPhase("bytecode");
    setInvocationCount(0);
    setIsRunning(false);
    setTotalTime(0);
    setIterationCount(0);
    setAppliedOpts([]);
    setShowIR(false);
  };

  useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(() => {
        setIterationCount(prev => {
          const newCount = prev + 1;
          setInvocationCount(inv => inv + 1);
          
          // Phase transitions
          if (invocationCount >= compilationThreshold * 0.5 && phase === "bytecode") {
            setPhase("warmup");
          } else if (invocationCount >= compilationThreshold && phase === "warmup") {
            setPhase("compiling");
            // Simulate compilation time
            setTimeout(() => {
              setPhase("native");
              // Apply random optimizations
              const numOpts = Math.floor(Math.random() * 3) + 2;
              const shuffled = [...optimizations].sort(() => Math.random() - 0.5);
              setAppliedOpts(shuffled.slice(0, numOpts).map(o => o.name));
            }, 1500);
          }
          
          setTotalTime(t => t + phaseInfo[phase].speed);
          return newCount;
        });
      }, phase === "compiling" ? 50 : 200);
      
      return () => clearTimeout(timer);
    }
  }, [isRunning, phase, invocationCount, compilationThreshold]);

  const currentSpeedup = appliedOpts.reduce((sum, optName) => {
    const opt = optimizations.find(o => o.name === optName);
    return sum * (opt?.speedup || 1);
  }, 1);

  const bytecodeExample = `
0: LOAD_CONST  1
1: LOAD_CONST  2
2: ADD
3: STORE_VAR   "sum"
4: LOAD_VAR    "sum"
5: RETURN
`;

  const irExample = `
bb0:
  v1 = Const 1
  v2 = Const 2
  v3 = Add v1, v2
  Store "sum", v3
  v4 = Load "sum"
  Return v4
`;

  const nativeExample = `
; Inlined addition
mov eax, 1
add eax, 2
mov [sum], eax
mov eax, [sum]
ret
`;

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#d2a8ff]/20 rounded-lg">
            <Zap size={20} className="text-[#d2a8ff]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">JIT Compilation</h3>
            <p className="text-[#8b949e] text-sm">From bytecode to native code</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIR(!showIR)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showIR ? "bg-[#58a6ff] text-white" : "bg-[#21262d] text-[#8b949e]"
            }`}
          >
            Show IR
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left - Execution */}
        <div className="w-1/2 flex flex-col border-r border-[#30363d]">
          {/* Phase Indicator */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              {["bytecode", "warmup", "compiling", "native"].map((p, i) => (
                <React.Fragment key={p}>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    phase === p ? "ring-2 ring-offset-2 ring-offset-[#0d1117]" : "opacity-50"
                  }`}
                  style={{ 
                    backgroundColor: `${phaseInfo[p as CodePhase].color}20`,
                    borderColor: phaseInfo[p as CodePhase].color,
                    borderWidth: phase === p ? "2px" : "0"
                  }}
                  >
                    {p === "bytecode" && <Code size={16} style={{ color: phaseInfo[p as CodePhase].color }} />}
                    {p === "warmup" && <Clock size={16} style={{ color: phaseInfo[p as CodePhase].color }} />}
                    {p === "compiling" && <Layers size={16} style={{ color: phaseInfo[p as CodePhase].color }} />}
                    {p === "native" && <Cpu size={16} style={{ color: phaseInfo[p as CodePhase].color }} />}
                    <span className="text-sm font-medium" style={{ color: phaseInfo[p as CodePhase].color }}>
                      {phaseInfo[p as CodePhase].label}
                    </span>
                  </div>
                  {i < 3 && <ArrowRight size={16} className="text-[#6e7681]" />}
                </React.Fragment>
              ))}
            </div>

            {/* Current Phase Info */}
            <div className="p-3 bg-[#21262d] rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[#8b949e]">{phaseInfo[phase].description}</span>
                <span className="text-white font-bold">
                  {phaseInfo[phase].speed}ms / iteration
                </span>
              </div>
            </div>
          </div>

          {/* Code View */}
          <div className="flex-1 p-4">
            <div className="text-[#8b949e] text-xs mb-2">Current Representation</div>
            <div className="p-4 bg-[#0d1117] rounded-lg font-mono text-sm border border-[#30363d] h-48 overflow-auto">
              {phase === "bytecode" && (
                <div className="text-[#8b949e]">
                  {bytecodeExample.split("\n").map((line, i) => (
                    <div key={i} className="hover:bg-[#21262d] px-2 rounded">
                      {line}
                    </div>
                  ))}
                </div>
              )}
              {phase === "warmup" && (
                <div className="text-[#f0883e]">
                  <div className="mb-2">// Profiling data collected:</div>
                  <div>invocation_count: {invocationCount}</div>
                  <div>hot_spots: [0, 2, 4]</div>
                  <div>type_profile: {"{x: int, y: int}"}</div>
                  <div className="mt-2 text-[#8b949e]">
                    {bytecodeExample.split("\n").map((line, i) => (
                      <div key={i} className="opacity-50">{line}</div>
                    ))}
                  </div>
                </div>
              )}
              {(phase === "compiling" || phase === "native") && showIR && (
                <div className="text-[#d2a8ff]">
                  <div className="mb-2">// Intermediate Representation (SSA)</div>
                  {irExample.split("\n").map((line, i) => (
                    <div key={i} className="hover:bg-[#21262d] px-2 rounded">
                      {line}
                    </div>
                  ))}
                </div>
              )}
              {phase === "native" && !showIR && (
                <div className="text-[#7ee787]">
                  <div className="mb-2">// Native x86-64 Assembly</div>
                  {nativeExample.split("\n").map((line, i) => (
                    <div key={i} className="hover:bg-[#21262d] px-2 rounded">
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-[#30363d]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium transition-colors"
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                {isRunning ? "Pause" : "Run"}
              </button>
              <button
                onClick={reset}
                className="p-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
              </button>
              <div className="ml-auto text-sm text-[#8b949e]">
                Threshold: {compilationThreshold} invocations
              </div>
            </div>
          </div>
        </div>

        {/* Right - Stats & Optimizations */}
        <div className="w-1/2 flex flex-col bg-[#161b22]">
          {/* Metrics */}
          <div className="p-4 border-b border-[#30363d]">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Activity size={16} className="text-[#58a6ff]" />
              Performance Metrics
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#21262d] rounded-lg">
                <div className="text-[#8b949e] text-xs">Iterations</div>
                <div className="text-white font-bold text-xl">{iterationCount}</div>
              </div>
              <div className="p-3 bg-[#21262d] rounded-lg">
                <div className="text-[#8b949e] text-xs">Invocations</div>
                <div className="text-white font-bold text-xl">{invocationCount}</div>
              </div>
              <div className="p-3 bg-[#21262d] rounded-lg">
                <div className="text-[#8b949e] text-xs">Total Time</div>
                <div className="text-white font-bold text-xl">{totalTime}ms</div>
              </div>
              <div className="p-3 bg-[#21262d] rounded-lg">
                <div className="text-[#8b949e] text-xs">Speedup</div>
                <div className="text-[#3fb950] font-bold text-xl">
                  {currentSpeedup.toFixed(1)}x
                </div>
              </div>
            </div>
          </div>

          {/* Optimizations */}
          <div className="flex-1 p-4">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Flame size={16} className="text-[#f0883e]" />
              Applied Optimizations
            </h4>
            <div className="space-y-2">
              {optimizations.map((opt) => {
                const isApplied = appliedOpts.includes(opt.name);
                return (
                  <motion.div
                    key={opt.name}
                    initial={isApplied ? { scale: 0.9 } : {}}
                    animate={isApplied ? { scale: 1 } : {}}
                    className={`p-3 rounded-lg border transition-all ${
                      isApplied 
                        ? "bg-[#238636]/10 border-[#238636]" 
                        : "bg-[#21262d] border-transparent opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isApplied && <CheckCircle size={14} className="text-[#3fb950]" />}
                        <span className={isApplied ? "text-white font-medium" : "text-[#8b949e]"}>
                          {opt.name}
                        </span>
                      </div>
                      {isApplied && (
                        <span className="text-[#3fb950] text-sm font-bold">
                          +{((opt.speedup - 1) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div className="text-[#8b949e] text-xs mt-1">
                      {opt.description}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
