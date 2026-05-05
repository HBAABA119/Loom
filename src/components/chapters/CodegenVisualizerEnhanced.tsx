"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Play, RotateCcw, ArrowRight, Layers,
  Box, Database, Hash, Palette, CheckCircle
} from "lucide-react";

const irInstructions = [
  { op: "add", dest: "t1", args: ["a", "b"] },
  { op: "mul", dest: "t2", args: ["t1", "c"] },
  { op: "sub", dest: "t3", args: ["t2", "d"] },
  { op: "store", dest: "result", args: ["t3"] },
];

const registers = ["rax", "rbx", "rcx", "rdx"];

const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4"];

export default function CodegenVisualizerEnhanced() {
  const [step, setStep] = useState(0);
  const [assignedRegs, setAssignedRegs] = useState<Record<string, string>>({});
  const [generatedAsm, setGeneratedAsm] = useState<string[]>([]);

  const reset = () => {
    setStep(0);
    setAssignedRegs({});
    setGeneratedAsm([]);
  };

  const nextStep = () => {
    setStep(prev => {
      const next = prev + 1;
      
      if (next === 1) {
        // Register allocation simulation
        const allocation: Record<string, string> = {};
        let regIdx = 0;
        irInstructions.forEach(instr => {
          if (instr.dest && !allocation[instr.dest]) {
            allocation[instr.dest] = registers[regIdx % registers.length];
            regIdx++;
          }
        });
        setAssignedRegs(allocation);
      }
      
      if (next === 2) {
        // Code generation
        const asm: string[] = [];
        irInstructions.forEach(instr => {
          const rd = instr.dest ? assignedRegs[instr.dest] || "?" : "";
          const rs = instr.args?.map(a => assignedRegs[a] || a).join(", ") || "";
          
          switch (instr.op) {
            case "add": asm.push(`add ${rd}, ${rs}`); break;
            case "mul": asm.push(`mul ${rd}, ${rs}`); break;
            case "sub": asm.push(`sub ${rd}, ${rs}`); break;
            case "store": asm.push(`mov [result], ${rs}`); break;
          }
        });
        setGeneratedAsm(asm);
      }
      
      return next;
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#f0883e]/20 rounded-lg">
            <Cpu size={20} className="text-[#f0883e]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Code Generation</h3>
            <p className="text-[#8b949e] text-sm">From IR to assembly</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* IR Panel */}
        <div className="w-1/3 flex flex-col border-r border-[#30363d]">
          <div className="p-4 border-b border-[#30363d]">
            <div className="flex items-center gap-2 text-[#8b949e] text-xs">
              <Layers size={12} />
              Intermediate Representation
            </div>
          </div>
          <div className="flex-1 p-4 space-y-2">
            {irInstructions.map((instr, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-[#21262d] rounded-lg font-mono text-sm"
              >
                <span className="text-[#79c0ff]">{instr.dest}</span>
                <span className="text-[#8b949e]"> = </span>
                <span className="text-[#ffa657]">{instr.op}</span>
                <span className="text-[#8b949e]">({instr.args?.join(", ")})</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Allocation Panel */}
        <div className="w-1/3 flex flex-col border-r border-[#30363d]">
          <div className="p-4 border-b border-[#30363d]">
            <div className="flex items-center gap-2 text-[#8b949e] text-xs">
              <Palette size={12} />
              Register Allocation
            </div>
          </div>
          <div className="flex-1 p-4">
            {step >= 1 ? (
              <div className="space-y-3">
                {Object.entries(assignedRegs).map(([varName, reg], i) => (
                  <motion.div
                    key={varName}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    />
                    <span className="text-white font-mono">{varName}</span>
                    <ArrowRight size={14} className="text-[#8b949e]" />
                    <span className="text-[#3fb950] font-bold font-mono">{reg}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[#6e7681]">
                Click Next to allocate registers
              </div>
            )}
          </div>
        </div>

        {/* Assembly Panel */}
        <div className="w-1/3 flex flex-col">
          <div className="p-4 border-b border-[#30363d]">
            <div className="flex items-center gap-2 text-[#8b949e] text-xs">
              <Box size={12} />
              Generated Assembly
            </div>
          </div>
          <div className="flex-1 p-4">
            {step >= 2 ? (
              <div className="space-y-2 font-mono text-sm">
                {generatedAsm.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-[#c9d1d9]"
                  >
                    <span className="text-[#6e7681] mr-3">{i + 1}</span>
                    {line}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[#6e7681]">
                Assembly will appear here
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <button
            onClick={nextStep}
            disabled={step >= 2}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            <Play size={16} />
            {step === 0 ? "Allocate Registers" : step === 1 ? "Generate Code" : "Complete"}
          </button>
          <button
            onClick={reset}
            className="p-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[#8b949e] text-sm">Step:</span>
            <span className="text-white font-bold">{step} / 2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
