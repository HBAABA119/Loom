"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Play, RotateCcw, ArrowUp, Layers,
  Shield, CheckCircle, Zap, Activity
} from "lucide-react";

interface StackFrame {
  id: string;
  function: string;
  hasCatch: boolean;
  catchType?: string;
}

const callStack: StackFrame[] = [
  { id: "f1", function: "main()", hasCatch: false },
  { id: "f2", function: "processData()", hasCatch: false },
  { id: "f3", function: "parseJSON()", hasCatch: true, catchType: "ParseError" },
  { id: "f4", function: "validate()", hasCatch: false },
  { id: "f5", function: "checkValue()", hasCatch: false },
];

export default function ExceptionVisualizerEnhanced() {
  const [step, setStep] = useState(0);
  const [unwoundFrames, setUnwoundFrames] = useState<string[]>([]);
  const [caughtAt, setCaughtAt] = useState<string | null>(null);

  const reset = () => {
    setStep(0);
    setUnwoundFrames([]);
    setCaughtAt(null);
  };

  const throwException = () => {
    setStep(1);
    
    // Simulate unwinding
    let delay = 0;
    for (let i = callStack.length - 1; i >= 0; i--) {
      const frame = callStack[i];
      delay += 500;
      
      setTimeout(() => {
        setUnwoundFrames(prev => [frame.id, ...prev]);
        
        if (frame.hasCatch && !caughtAt) {
          setCaughtAt(frame.id);
          setStep(2);
        }
      }, delay);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#f85149]/20 rounded-lg">
            <AlertTriangle size={20} className="text-[#f85149]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Exception Stack Unwinding</h3>
            <p className="text-[#8b949e] text-sm">From throw to catch</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Call Stack */}
        <div className="w-1/2 flex flex-col border-r border-[#30363d] p-4">
          <div className="text-[#8b949e] text-xs mb-3 flex items-center gap-1">
            <Layers size={12} />
            Call Stack
          </div>
          <div className="space-y-2">
            {callStack.map((frame, i) => {
              const isUnwound = unwoundFrames.includes(frame.id);
              const isCaught = caughtAt === frame.id;
              const isThrowPoint = frame.id === "f5";
              
              return (
                <motion.div
                  key={frame.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: isUnwound ? 0.5 : 1, 
                    x: 0,
                    scale: isCaught ? 1.05 : 1,
                  }}
                  className={`p-3 rounded-lg border transition-colors ${
                    isCaught
                      ? "bg-[#3fb950]/20 border-[#3fb950]"
                      : isThrowPoint && step >= 1
                      ? "bg-[#f85149]/20 border-[#f85149]"
                      : isUnwound
                      ? "bg-[#21262d] border-[#30363d] opacity-50"
                      : "bg-[#21262d] border-[#30363d]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isThrowPoint && step >= 1 && (
                      <Zap size={14} className="text-[#f85149]" />
                    )}
                    {isCaught && (
                      <Shield size={14} className="text-[#3fb950]" />
                    )}
                    <span className={`font-mono ${isCaught ? "text-[#3fb950] font-bold" : "text-[#c9d1d9]"}`}>
                      {frame.function}
                    </span>
                    {frame.hasCatch && (
                      <span className="ml-auto text-xs text-[#8b949e] bg-[#30363d] px-2 py-1 rounded">
                        catch({frame.catchType})
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Unwinding Process */}
        <div className="w-1/2 flex flex-col p-4">
          <div className="text-[#8b949e] text-xs mb-3 flex items-center gap-1">
            <Activity size={12} />
            Unwinding Progress
          </div>
          
          <div className="flex-1">
            {step >= 1 && (
              <div className="space-y-3">
                <AnimatePresence>
                  {unwoundFrames.map((frameId, i) => {
                    const frame = callStack.find(f => f.id === frameId)!;
                    return (
                      <motion.div
                        key={frameId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <ArrowUp size={14} className="text-[#f85149]" />
                        <span className="text-[#8b949e]">Unwinding:</span>
                        <span className="text-[#c9d1d9] font-mono">{frame.function}</span>
                        {frame.hasCatch && frameId === caughtAt && (
                          <span className="ml-2 text-[#3fb950] text-xs">Handler found!</span>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {step >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-[#3fb950]/10 border border-[#3fb950] rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-[#3fb950]">
                      <CheckCircle size={16} />
                      <span className="font-medium">
                        Exception caught in {callStack.find(f => f.id === caughtAt)?.function}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <button
            onClick={throwException}
            disabled={step > 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#f85149] hover:bg-[#ff6b6b] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            <AlertTriangle size={16} />
            Throw Exception
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
