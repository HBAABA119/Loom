"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link, Play, RotateCcw, FileCode, CheckCircle, X,
  ArrowRight, AlertCircle, Puzzle
} from "lucide-react";

interface Symbol {
  name: string;
  type: "defined" | "undefined";
  value?: string;
}

interface ObjectFile {
  id: string;
  symbols: Symbol[];
}

const objectFiles: ObjectFile[] = [
  {
    id: "main.o",
    symbols: [
      { name: "main", type: "defined" },
      { name: "printf", type: "undefined" },
      { name: "add", type: "undefined" },
    ],
  },
  {
    id: "math.o",
    symbols: [
      { name: "add", type: "defined", value: "0x1000" },
      { name: "sub", type: "defined", value: "0x2000" },
    ],
  },
  {
    id: "libc.o",
    symbols: [
      { name: "printf", type: "defined", value: "0x3000" },
      { name: "malloc", type: "defined", value: "0x4000" },
    ],
  },
];

export default function LinkerVisualizerEnhanced() {
  const [step, setStep] = useState(0);
  const [resolvedSymbols, setResolvedSymbols] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const reset = () => {
    setStep(0);
    setResolvedSymbols({});
    setErrors([]);
  };

  const runLinker = () => {
    setStep(1);
    
    setTimeout(() => {
      const resolved: Record<string, string> = {};
      const errs: string[] = [];
      
      // Collect all defined symbols
      objectFiles.forEach(file => {
        file.symbols.forEach(sym => {
          if (sym.type === "defined") {
            if (resolved[sym.name]) {
              errs.push(`Duplicate symbol: ${sym.name}`);
            } else {
              resolved[sym.name] = sym.value || "resolved";
            }
          }
        });
      });
      
      // Check undefined symbols
      objectFiles.forEach(file => {
        file.symbols.forEach(sym => {
          if (sym.type === "undefined" && !resolved[sym.name]) {
            errs.push(`Undefined reference: ${sym.name}`);
          }
        });
      });
      
      setResolvedSymbols(resolved);
      setErrors(errs);
      setStep(2);
    }, 1000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#79c0ff]/20 rounded-lg">
            <Link size={20} className="text-[#79c0ff]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Symbol Linker</h3>
            <p className="text-[#8b949e] text-sm">Resolve symbols across object files</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Object Files */}
        <div className="w-1/2 flex flex-col border-r border-[#30363d] p-4">
          <div className="text-[#8b949e] text-xs mb-3 flex items-center gap-1">
            <FileCode size={12} />
            Object Files
          </div>
          <div className="space-y-3">
            {objectFiles.map((file, i) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Puzzle size={14} className="text-[#8b949e]" />
                  <span className="text-white font-mono font-bold">{file.id}</span>
                </div>
                <div className="space-y-1">
                  {file.symbols.map((sym, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm">
                      {sym.type === "defined" ? (
                        <CheckCircle size={12} className="text-[#3fb950]" />
                      ) : (
                        <AlertCircle size={12} className="text-[#f0883e]" />
                      )}
                      <span className={sym.type === "defined" ? "text-[#c9d1d9]" : "text-[#f0883e]"}>
                        {sym.name}
                      </span>
                      {sym.type === "defined" && sym.value && (
                        <span className="text-[#6e7681] text-xs">@ {sym.value}</span>
                      )}
                      {sym.type === "undefined" && resolvedSymbols[sym.name] && (
                        <span className="text-[#3fb950] text-xs">resolved</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Resolution */}
        <div className="w-1/2 flex flex-col p-4">
          <div className="text-[#8b949e] text-xs mb-3 flex items-center gap-1">
            <Link size={12} />
            Symbol Resolution
          </div>
          
          {step >= 2 ? (
            <div className="space-y-4">
              <div className="p-3 bg-[#21262d] rounded-lg">
                <div className="text-[#8b949e] text-xs mb-2">Resolved Symbols</div>
                <div className="space-y-1">
                  {Object.entries(resolvedSymbols).map(([name, value]) => (
                    <div key={name} className="flex items-center gap-2">
                      <CheckCircle size={12} className="text-[#3fb950]" />
                      <span className="text-white font-mono">{name}</span>
                      <ArrowRight size={12} className="text-[#8b949e]" />
                      <span className="text-[#79c0ff] font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {errors.length > 0 && (
                <div className="p-3 bg-[#f85149]/10 border border-[#f85149] rounded-lg">
                  <div className="text-[#f85149] text-xs mb-2 flex items-center gap-1">
                    <X size={12} />
                    Link Errors
                  </div>
                  <div className="space-y-1">
                    {errors.map((err, i) => (
                      <div key={i} className="text-[#f85149] text-sm">{err}</div>
                    ))}
                  </div>
                </div>
              )}
              
              {errors.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-[#238636]/10 border border-[#238636] rounded-lg"
                >
                  <div className="flex items-center gap-2 text-[#3fb950]">
                    <CheckCircle size={16} />
                    <span className="font-medium">Link successful!</span>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[#6e7681]">
              {step === 0 ? "Click Link to resolve symbols" : "Resolving..."}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <button
            onClick={runLinker}
            disabled={step > 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            <Link size={16} />
            Link
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
