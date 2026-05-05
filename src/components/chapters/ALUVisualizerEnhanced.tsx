"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Plus, Minus, X, ArrowRight, RefreshCcw } from "lucide-react";

type Operation = "ADD" | "SUB" | "AND" | "OR" | "XOR";

interface OperationConfig {
  name: string;
  symbol: string;
  color: string;
}

const operations: Record<Operation, OperationConfig> = {
  ADD: { name: "Addition", symbol: "+", color: "#238636" },
  SUB: { name: "Subtraction", symbol: "-", color: "#f0883e" },
  AND: { name: "AND", symbol: "&", color: "#58a6ff" },
  OR: { name: "OR", symbol: "|", color: "#a371f7" },
  XOR: { name: "XOR", symbol: "⊕", color: "#3fb950" },
};

const compute = (op: Operation, a: number, b: number): number => {
  switch (op) {
    case "ADD":
      return (a + b) & 0xFF;
    case "SUB":
      return (a - b) & 0xFF;
    case "AND":
      return a & b;
    case "OR":
      return a | b;
    case "XOR":
      return a ^ b;
    default:
      return 0;
  }
};

const toBinary = (n: number): string => n.toString(2).padStart(8, '0');

export default function ALUVisualizerEnhanced() {
  const [opA, setOpA] = useState(15);
  const [opB, setOpB] = useState(10);
  const [operation, setOperation] = useState<Operation>("ADD");
  const [showDetails, setShowDetails] = useState(false);

  const result = compute(operation, opA, opB);
  const config = operations[operation];

  return (
    <div className="w-full h-full bg-[#0d1117] rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-[#58a6ff]" />
          <div>
            <h3 className="text-white font-semibold">ALU - Arithmetic Logic Unit</h3>
            <p className="text-[#8b949e] text-sm">Core computation engine</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            showDetails ? "bg-[#58a6ff] text-white" : "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
          }`}
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left - Controls */}
        <div className="w-full lg:w-80 p-6 border-r border-[#30363d] space-y-6">
          {/* Operation Selector */}
          <div className="space-y-3">
            <label className="text-[#8b949e] text-sm font-medium">Operation</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(operations) as Operation[]).map((op) => (
                <button
                  key={op}
                  onClick={() => setOperation(op)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    operation === op
                      ? "bg-[#58a6ff] text-white"
                      : "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
                  }`}
                >
                  <span className="text-lg font-bold">{op}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Operand A */}
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <label className="text-[#8b949e] text-sm font-medium mb-3 block">Operand A</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpA((v) => Math.max(0, v - 1))}
                className="w-10 h-10 bg-[#0d1117] hover:bg-[#21262d] text-white rounded-lg font-bold"
              >
                -
              </button>
              <div className="flex-1 text-center">
                <span className="text-3xl font-bold text-[#58a6ff]">{opA}</span>
              </div>
              <button
                onClick={() => setOpA((v) => Math.min(255, v + 1))}
                className="w-10 h-10 bg-[#0d1117] hover:bg-[#21262d] text-white rounded-lg font-bold"
              >
                +
              </button>
            </div>
            <p className="text-[#6e7681] text-xs text-center mt-2 font-mono">
              {toBinary(opA)}
            </p>
          </div>

          {/* Operand B */}
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <label className="text-[#8b949e] text-sm font-medium mb-3 block">Operand B</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpB((v) => Math.max(0, v - 1))}
                className="w-10 h-10 bg-[#0d1117] hover:bg-[#21262d] text-white rounded-lg font-bold"
              >
                -
              </button>
              <div className="flex-1 text-center">
                <span className="text-3xl font-bold text-[#58a6ff]">{opB}</span>
              </div>
              <button
                onClick={() => setOpB((v) => Math.min(255, v + 1))}
                className="w-10 h-10 bg-[#0d1117] hover:bg-[#21262d] text-white rounded-lg font-bold"
              >
                +
              </button>
            </div>
            <p className="text-[#6e7681] text-xs text-center mt-2 font-mono">
              {toBinary(opB)}
            </p>
          </div>
        </div>

        {/* Center - Visualization */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center bg-[#0d1117]">
          <div className="flex flex-col items-center gap-8">
            {/* Input A */}
            <motion.div
              key={`a-${opA}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-4"
            >
              <div className="text-center">
                <span className="text-[#8b949e] text-sm block mb-1">A</span>
                <div className="w-24 h-24 bg-[#161b22] border-2 border-[#58a6ff] rounded-xl flex items-center justify-center">
                  <span className="text-4xl font-bold text-[#58a6ff]">{opA}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                {toBinary(opA).split('').map((bit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono ${
                      bit === '1' ? 'bg-[#58a6ff] text-white' : 'bg-[#21262d] text-[#6e7681]'
                    }`}
                  >
                    {bit}
                  </motion.div>
                )).reverse()}
              </div>
            </motion.div>

            {/* Operation Arrow */}
            <div className="flex items-center gap-4">
              <ArrowRight className="text-[#8b949e]" size={24} />
              <motion.div
                key={operation}
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                className="w-24 h-24 rounded-xl flex items-center justify-center text-4xl font-bold"
                style={{ backgroundColor: config.color, color: 'white' }}
              >
                {config.symbol}
              </motion.div>
              <ArrowRight className="text-[#8b949e]" size={24} />
            </div>

            {/* Input B */}
            <motion.div
              key={`b-${opB}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-4"
            >
              <div className="text-center">
                <span className="text-[#8b949e] text-sm block mb-1">B</span>
                <div className="w-24 h-24 bg-[#161b22] border-2 border-[#58a6ff] rounded-xl flex items-center justify-center">
                  <span className="text-4xl font-bold text-[#58a6ff]">{opB}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                {toBinary(opB).split('').map((bit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono ${
                      bit === '1' ? 'bg-[#58a6ff] text-white' : 'bg-[#21262d] text-[#6e7681]'
                    }`}
                  >
                    {bit}
                  </motion.div>
                )).reverse()}
              </div>
            </motion.div>

            {/* Result */}
            <motion.div
              key={`r-${result}`}
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div className="text-center">
                <span className="text-[#8b949e] text-sm block mb-1">Result</span>
                <div 
                  className="w-24 h-24 rounded-xl flex items-center justify-center border-2"
                  style={{ borderColor: config.color }}
                >
                  <span className="text-4xl font-bold" style={{ color: config.color }}>
                    {result}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                {toBinary(result).split('').map((bit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono ${
                      bit === '1' ? 'text-white' : 'bg-[#21262d] text-[#6e7681]'
                    }`}
                    style={{ backgroundColor: bit === '1' ? config.color : undefined }}
                  >
                    {bit}
                  </motion.div>
                )).reverse()}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right - Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-72 p-4 border-l border-[#30363d] bg-[#161b22] overflow-y-auto"
            >
              <h4 className="text-white font-medium mb-4">Bit-by-bit {operation}</h4>
              
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#58a6ff] w-8">A:</span>
                  <span className="text-[#c9d1d9]">{toBinary(opA)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#58a6ff] w-8">B:</span>
                  <span className="text-[#c9d1d9]">{toBinary(opB)}</span>
                </div>
                <div className="border-t border-[#30363d] my-2"></div>
                
                {/* Per-bit calculation */}
                <div className="space-y-1">
                  {Array.from({ length: 8 }, (_, i) => {
                    const bitPos = 7 - i;
                    const bitA = (opA >> bitPos) & 1;
                    const bitB = (opB >> bitPos) & 1;
                    let bitResult = 0;
                    switch (operation) {
                      case "ADD":
                        // Simplified - doesn't show carry
                        bitResult = (bitA + bitB) & 1;
                        break;
                      case "SUB":
                        bitResult = (bitA - bitB) & 1;
                        break;
                      case "AND":
                        bitResult = bitA & bitB;
                        break;
                      case "OR":
                        bitResult = bitA | bitB;
                        break;
                      case "XOR":
                        bitResult = bitA ^ bitB;
                        break;
                    }
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[#8b949e] w-8">{bitPos}:</span>
                        <span className={bitA ? 'text-[#238636]' : 'text-[#6e7681]'}>{bitA}</span>
                        <span className="text-[#8b949e]">{config.symbol}</span>
                        <span className={bitB ? 'text-[#238636]' : 'text-[#6e7681]'}>{bitB}</span>
                        <span className="text-[#8b949e]">=</span>
                        <span className={bitResult ? 'text-[#f0883e] font-bold' : 'text-[#6e7681]'}>
                          {bitResult}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="border-t border-[#30363d] my-2"></div>
                <div className="flex items-center gap-2">
                  <span className="text-[#f0883e] w-8">R:</span>
                  <span className="text-[#f0883e] font-bold">{toBinary(result)}</span>
                </div>
              </div>

              <div className="mt-6 p-3 bg-[#0d1117] rounded-lg">
                <h5 className="text-[#8b949e] text-xs mb-2">Operation Info</h5>
                <p className="text-[#c9d1d9] text-sm">{config.name}</p>
                <p className="text-[#8b949e] text-xs mt-1">
                  {operation === "ADD" && "Binary addition with carry propagation"}
                  {operation === "SUB" && "Subtraction using two's complement"}
                  {operation === "AND" && "Bitwise AND - output 1 only if both inputs 1"}
                  {operation === "OR" && "Bitwise OR - output 1 if any input is 1"}
                  {operation === "XOR" && "Bitwise XOR - output 1 if inputs differ"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
