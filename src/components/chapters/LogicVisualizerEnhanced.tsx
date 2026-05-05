"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, ArrowRight, RotateCcw, Lightbulb } from "lucide-react";

type GateType = "AND" | "OR" | "NOT" | "XOR" | "NAND" | "NOR";

interface GateConfig {
  type: GateType;
  inputs: number;
  icon: string;
}

const gates: GateConfig[] = [
  { type: "AND", inputs: 2, icon: "&" },
  { type: "OR", inputs: 2, icon: "≥1" },
  { type: "NOT", inputs: 1, icon: "1" },
  { type: "XOR", inputs: 2, icon: "=1" },
  { type: "NAND", inputs: 2, icon: "&̄" },
  { type: "NOR", inputs: 2, icon: "≥1̄" },
];

const computeGate = (type: GateType, inputs: boolean[]): boolean => {
  switch (type) {
    case "AND":
      return inputs.every(i => i);
    case "OR":
      return inputs.some(i => i);
    case "NOT":
      return !inputs[0];
    case "XOR":
      return inputs[0] !== inputs[1];
    case "NAND":
      return !inputs.every(i => i);
    case "NOR":
      return !inputs.some(i => i);
    default:
      return false;
  }
};

const getTruthTable = (type: GateType): { inputs: boolean[]; output: boolean }[] => {
  const numInputs = type === "NOT" ? 1 : 2;
  const rows = Math.pow(2, numInputs);
  return Array.from({ length: rows }, (_, i) => {
    const inputs = Array.from({ length: numInputs }, (_, j) => 
      Boolean((i >> (numInputs - 1 - j)) & 1)
    );
    return { inputs, output: computeGate(type, inputs) };
  });
};

export default function LogicVisualizerEnhanced() {
  const [selectedGate, setSelectedGate] = useState<GateType>("AND");
  const [inputA, setInputA] = useState(false);
  const [inputB, setInputB] = useState(false);
  const [showTruthTable, setShowTruthTable] = useState(false);

  const output = computeGate(selectedGate, selectedGate === "NOT" ? [inputA] : [inputA, inputB]);
  const truthTable = getTruthTable(selectedGate);

  const toggleInput = useCallback((input: "A" | "B") => {
    if (input === "A") setInputA(prev => !prev);
    else setInputB(prev => !prev);
  }, []);

  return (
    <div className="w-full h-full bg-[#0d1117] rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-[#58a6ff]" />
          <div>
            <h3 className="text-white font-semibold">Logic Gates</h3>
            <p className="text-[#8b949e] text-sm">Interactive gate simulator</p>
          </div>
        </div>
        <button
          onClick={() => setShowTruthTable(!showTruthTable)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            showTruthTable ? "bg-[#58a6ff] text-white" : "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
          }`}
        >
          Truth Table
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left - Gate Selector */}
        <div className="w-full lg:w-64 p-4 border-r border-[#30363d] bg-[#161b22]">
          <h4 className="text-[#8b949e] text-sm font-medium mb-3">Select Gate</h4>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {gates.map((gate) => (
              <button
                key={gate.type}
                onClick={() => {
                  setSelectedGate(gate.type);
                  if (gate.type === "NOT") setInputB(false);
                }}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedGate === gate.type
                    ? "bg-[#58a6ff] text-white"
                    : "bg-[#0d1117] text-[#c9d1d9] hover:bg-[#21262d]"
                }`}
              >
                <span className="font-bold text-lg">{gate.type}</span>
                <span className="text-xs opacity-75 block">
                  {gate.inputs} input{gate.inputs > 1 ? "s" : ""}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Center - Gate Visualization */}
        <div className="flex-1 p-6 flex items-center justify-center bg-[#0d1117]">
          <div className="flex flex-col items-center gap-6">
            {/* Input A */}
            <div className="flex items-center gap-4">
              <span className="text-[#8b949e] font-mono w-8">A</span>
              <motion.button
                onClick={() => toggleInput("A")}
                whileTap={{ scale: 0.95 }}
                className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${
                  inputA
                    ? "bg-[#238636] text-white shadow-lg shadow-[#238636]/30"
                    : "bg-[#21262d] text-[#6e7681] border-2 border-[#30363d]"
                }`}
              >
                {inputA ? "1" : "0"}
              </motion.button>
              <motion.div
                animate={{ 
                  backgroundColor: inputA ? "#238636" : "#30363d",
                  boxShadow: inputA ? "0 0 10px #238636" : "none"
                }}
                className="w-24 h-1 rounded"
              />
            </div>

            {/* Input B (hidden for NOT gate) */}
            <AnimatePresence>
              {selectedGate !== "NOT" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-[#8b949e] font-mono w-8">B</span>
                  <motion.button
                    onClick={() => toggleInput("B")}
                    whileTap={{ scale: 0.95 }}
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${
                      inputB
                        ? "bg-[#238636] text-white shadow-lg shadow-[#238636]/30"
                        : "bg-[#21262d] text-[#6e7681] border-2 border-[#30363d]"
                    }`}
                  >
                    {inputB ? "1" : "0"}
                  </motion.button>
                  <motion.div
                    animate={{ 
                      backgroundColor: inputB ? "#238636" : "#30363d",
                      boxShadow: inputB ? "0 0 10px #238636" : "none"
                    }}
                    className="w-24 h-1 rounded"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gate Symbol */}
            <div className="relative">
              <motion.div
                key={selectedGate}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-32 h-32 rounded-xl flex items-center justify-center text-3xl font-bold transition-all ${
                  output
                    ? "bg-[#f0883e] text-white shadow-lg shadow-[#f0883e]/30"
                    : "bg-[#21262d] text-[#6e7681] border-2 border-[#30363d]"
                }`}
              >
                {selectedGate}
              </motion.div>
              
              {/* Output connection */}
              <div className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 flex items-center">
                <motion.div
                  animate={{ 
                    backgroundColor: output ? "#f0883e" : "#30363d",
                    boxShadow: output ? "0 0 10px #f0883e" : "none"
                  }}
                  className="w-16 h-1 rounded"
                />
              </div>
            </div>

            {/* Output */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  backgroundColor: output ? "#f0883e" : "#30363d",
                  boxShadow: output ? "0 0 10px #f0883e" : "none"
                }}
                className="w-24 h-1 rounded"
              />
              <motion.div
                animate={{ 
                  backgroundColor: output ? "#f0883e" : "#21262d",
                  borderColor: output ? "#f0883e" : "#30363d"
                }}
                className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold border-2"
              >
                <span className={output ? "text-white" : "text-[#6e7681]"}>
                  {output ? "1" : "0"}
                </span>
              </motion.div>
              <span className="text-[#8b949e] font-mono w-12">OUT</span>
            </div>

            {/* Boolean Expression */}
            <div className="mt-4 p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
              <span className="text-[#8b949e] text-sm">Expression: </span>
              <span className="text-[#c9d1d9] font-mono">
                {selectedGate === "NOT" 
                  ? `OUT = ${inputA ? "0" : "1"}` 
                  : `OUT = ${inputA ? "1" : "0"} ${selectedGate} ${inputB ? "1" : "0"}`
                }
              </span>
            </div>
          </div>
        </div>

        {/* Right - Truth Table */}
        <AnimatePresence>
          {showTruthTable && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-64 p-4 border-l border-[#30363d] bg-[#161b22]"
            >
              <h4 className="text-white font-medium mb-4">Truth Table: {selectedGate}</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#30363d]">
                    {selectedGate !== "NOT" && (
                      <>
                        <th className="text-left py-2 text-[#8b949e]">A</th>
                        <th className="text-left py-2 text-[#8b949e]">B</th>
                      </>
                    )}
                    {selectedGate === "NOT" && (
                      <th className="text-left py-2 text-[#8b949e]">A</th>
                    )}
                    <th className="text-left py-2 text-[#58a6ff]">OUT</th>
                  </tr>
                </thead>
                <tbody>
                  {truthTable.map((row, i) => (
                    <tr 
                      key={i} 
                      className={`border-b border-[#21262d] ${
                        (selectedGate === "NOT" ? [inputA] : [inputA, inputB]).every((v, j) => v === row.inputs[j])
                          ? "bg-[#58a6ff]/20"
                          : ""
                      }`}
                    >
                      {row.inputs.map((input, j) => (
                        <td key={j} className="py-2 text-[#c9d1d9] font-mono">
                          {input ? "1" : "0"}
                        </td>
                      ))}
                      <td className={`py-2 font-mono font-bold ${row.output ? "text-[#238636]" : "text-[#6e7681]"}`}>
                        {row.output ? "1" : "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
