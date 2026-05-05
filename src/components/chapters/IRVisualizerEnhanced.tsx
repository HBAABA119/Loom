"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, RotateCcw, GitCommit, ArrowRight, Variable,
  Box, Layers, CheckCircle, Split, Merge
} from "lucide-react";

type IRInstr = { op: string; dest?: string; args?: string[]; };
type Block = { id: string; instrs: IRInstr[]; preds: string[]; succs: string[]; };

const sampleCode = [
  "x = 5",
  "y = 10",
  "if x > 0:",
  "  z = x + y",
  "else:",
  "  z = x - y",
  "result = z * 2",
];

const basicBlocks: Block[] = [
  { id: "B1", instrs: [{ op: "assign", dest: "x", args: ["5"] }, { op: "assign", dest: "y", args: ["10"] }, { op: "br", args: ["x > 0", "B2", "B3"] }], preds: [], succs: ["B2", "B3"] },
  { id: "B2", instrs: [{ op: "add", dest: "z", args: ["x", "y"] }], preds: ["B1"], succs: ["B4"] },
  { id: "B3", instrs: [{ op: "sub", dest: "z", args: ["x", "y"] }], preds: ["B1"], succs: ["B4"] },
  { id: "B4", instrs: [{ op: "phi", dest: "z2", args: ["z.1", "z.2"] }, { op: "mul", dest: "result", args: ["z2", "2"] }], preds: ["B2", "B3"], succs: [] },
];

export default function IRVisualizerEnhanced() {
  const [step, setStep] = useState(0);
  const [showSSA, setShowSSA] = useState(false);
  const [highlightedBlock, setHighlightedBlock] = useState<string | null>(null);

  const reset = () => {
    setStep(0);
    setShowSSA(false);
    setHighlightedBlock(null);
  };

  const nextStep = useCallback(() => {
    setStep(prev => {
      const next = prev + 1;
      if (next === 1) setHighlightedBlock("B1");
      if (next === 2) setShowSSA(true);
      if (next === 3) setHighlightedBlock("B4");
      return next;
    });
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#79c0ff]/20 rounded-lg">
            <GitCommit size={20} className="text-[#79c0ff]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Intermediate Representation</h3>
            <p className="text-[#8b949e] text-sm">Basic blocks, CFG, and SSA form</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 flex flex-col border-r border-[#30363d]">
          <div className="p-4 border-b border-[#30363d]">
            <div className="text-[#8b949e] text-xs mb-2">Source Code</div>
            <div className="bg-[#161b22] rounded-lg p-3 font-mono text-sm">
              {sampleCode.map((line, i) => (
                <div key={i} className="text-[#c9d1d9]">
                  <span className="text-[#6e7681] mr-2">{i + 1}</span>
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 flex gap-2">
            <button
              onClick={nextStep}
              disabled={step >= 3}
              className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              <Play size={16} />
              {step === 0 ? "Build CFG" : step === 1 ? "Convert to SSA" : "Show Phi Functions"}
            </button>
            <button
              onClick={reset}
              className="p-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        <div className="w-2/3 flex flex-col bg-[#0d1117]">
          <div className="flex-1 p-4">
            <div className="text-[#8b949e] text-xs mb-4 flex items-center gap-1">
              <Layers size={12} />
              Control Flow Graph
            </div>
            
            <div className="relative h-full">
              {/* Blocks */}
              <div className="grid grid-cols-3 gap-4">
                {basicBlocks.map((block, idx) => {
                  const isHighlighted = highlightedBlock === block.id || (step >= 2 && block.id === "B4");
                  const isActive = step >= 1;
                  
                  return (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: isActive ? 1 : 0.3, y: 0 }}
                      className={`p-3 rounded-lg border transition-colors ${
                        isHighlighted 
                          ? "bg-[#79c0ff]/20 border-[#79c0ff]" 
                          : "bg-[#21262d] border-[#30363d]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Box size={14} className="text-[#8b949e]" />
                        <span className="text-white font-bold text-sm">{block.id}</span>
                        {block.id === "B4" && showSSA && (
                          <span className="ml-auto text-xs text-[#a371f7]">Join</span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {block.instrs.map((instr, i) => (
                          <div key={i} className="font-mono text-xs text-[#c9d1d9]">
                            {instr.op === "phi" ? (
                              <span className="text-[#a371f7]">
                                {instr.dest} = Φ({instr.args?.join(", ")})
                              </span>
                            ) : instr.dest ? (
                              <>
                                <span className="text-[#79c0ff]">{instr.dest}</span>
                                <span className="text-[#8b949e]"> = </span>
                                <span className="text-[#ffa657]">{instr.op}</span>
                                <span className="text-[#8b949e]">({instr.args?.join(", ")})</span>
                              </>
                            ) : (
                              <span className="text-[#f0883e]">{instr.op} {instr.args?.join(" ")}</span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {block.preds.length > 0 && (
                        <div className="mt-2 text-xs text-[#6e7681]">
                          Preds: {block.preds.join(", ")}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Arrow indicators */}
              {step >= 1 && (
                <div className="absolute top-1/4 left-1/3 w-1/3 flex justify-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-8"
                  >
                    <div className="flex items-center gap-1 text-[#8b949e] text-xs">
                      <ArrowRight size={14} /> B2
                    </div>
                    <div className="flex items-center gap-1 text-[#8b949e] text-xs">
                      <ArrowRight size={14} /> B3
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Phi explanation */}
              {step >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-4 left-4 right-4 p-3 bg-[#a371f7]/10 border border-[#a371f7] rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Merge size={16} className="text-[#a371f7]" />
                    <span className="text-[#c9d1d9] text-sm">
                      Phi (Φ) functions merge values from different predecessors in SSA form
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
