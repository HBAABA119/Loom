"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, RotateCcw, StepForward, Cpu, 
  Layers, ArrowUp, ArrowDown, Database, Activity,
  Terminal, Zap, Code
} from "lucide-react";

type Opcode = 
  | "PUSH" | "POP" | "ADD" | "SUB" | "MUL" | "DIV" 
  | "LOAD" | "STORE" | "JUMP" | "JUMP_IF_ZERO" | "CALL" | "RETURN" | "HALT";

interface Instruction {
  opcode: Opcode;
  operand?: number | string;
}

interface VMState {
  pc: number;
  stack: number[];
  locals: Record<string, number>;
  running: boolean;
}

const bytecodePrograms = [
  {
    name: "Simple Math",
    description: "Calculate 5 + 3 * 2",
    code: [
      { opcode: "PUSH" as Opcode, operand: 5 },
      { opcode: "PUSH" as Opcode, operand: 3 },
      { opcode: "PUSH" as Opcode, operand: 2 },
      { opcode: "MUL" as Opcode },
      { opcode: "ADD" as Opcode },
      { opcode: "HALT" as Opcode },
    ]
  },
  {
    name: "Conditional",
    description: "If 5 > 3 then result = 1 else 0",
    code: [
      { opcode: "PUSH" as Opcode, operand: 5 },
      { opcode: "PUSH" as Opcode, operand: 3 },
      { opcode: "SUB" as Opcode },
      { opcode: "JUMP_IF_ZERO" as Opcode, operand: 8 },
      { opcode: "PUSH" as Opcode, operand: 1 },
      { opcode: "STORE" as Opcode, operand: "result" },
      { opcode: "JUMP" as Opcode, operand: 10 },
      { opcode: "PUSH" as Opcode, operand: 0 },
      { opcode: "STORE" as Opcode, operand: "result" },
      { opcode: "HALT" as Opcode },
    ]
  },
  {
    name: "Loop",
    description: "Sum numbers 1 to 5",
    code: [
      { opcode: "PUSH" as Opcode, operand: 0 },
      { opcode: "STORE" as Opcode, operand: "sum" },
      { opcode: "PUSH" as Opcode, operand: 1 },
      { opcode: "STORE" as Opcode, operand: "i" },
      // Loop start
      { opcode: "LOAD" as Opcode, operand: "i" },
      { opcode: "PUSH" as Opcode, operand: 6 },
      { opcode: "SUB" as Opcode },
      { opcode: "JUMP_IF_ZERO" as Opcode, operand: 16 },
      { opcode: "LOAD" as Opcode, operand: "sum" },
      { opcode: "LOAD" as Opcode, operand: "i" },
      { opcode: "ADD" as Opcode },
      { opcode: "STORE" as Opcode, operand: "sum" },
      { opcode: "LOAD" as Opcode, operand: "i" },
      { opcode: "PUSH" as Opcode, operand: 1 },
      { opcode: "ADD" as Opcode },
      { opcode: "STORE" as Opcode, operand: "i" },
      { opcode: "JUMP" as Opcode, operand: 4 },
      { opcode: "HALT" as Opcode },
    ]
  }
];

export default function VMVisualizerEnhanced() {
  const [selectedProgram, setSelectedProgram] = useState(0);
  const [bytecode, setBytecode] = useState<Instruction[]>(bytecodePrograms[0].code);
  const [vmState, setVmState] = useState<VMState>({
    pc: 0,
    stack: [],
    locals: {},
    running: false
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [totalSteps, setTotalSteps] = useState(0);

  const reset = () => {
    setVmState({
      pc: 0,
      stack: [],
      locals: {},
      running: false
    });
    setIsExecuting(false);
    setExecutionLog([]);
    setTotalSteps(0);
  };

  const handleProgramChange = (idx: number) => {
    setSelectedProgram(idx);
    setBytecode(bytecodePrograms[idx].code);
    reset();
  };

  const executeStep = useCallback(() => {
    setVmState(prev => {
      if (prev.pc >= bytecode.length || !prev.running) {
        return { ...prev, running: false };
      }

      const instr = bytecode[prev.pc];
      const newState = { ...prev, pc: prev.pc + 1 };
      let logEntry = `PC=${prev.pc}: ${instr.opcode}`;

      switch (instr.opcode) {
        case "PUSH":
          newState.stack = [...prev.stack, instr.operand as number];
          logEntry += ` ${instr.operand} → Stack: [${newState.stack.join(", ")}]`;
          break;
        case "POP":
          newState.stack = prev.stack.slice(0, -1);
          logEntry += ` → Stack: [${newState.stack.join(", ")}]`;
          break;
        case "ADD": {
          const b = prev.stack.pop() || 0;
          const a = prev.stack.pop() || 0;
          newState.stack = [...prev.stack, a + b];
          logEntry += ` ${a} + ${b} = ${a + b} → Stack: [${newState.stack.join(", ")}]`;
          break;
        }
        case "SUB": {
          const b = prev.stack.pop() || 0;
          const a = prev.stack.pop() || 0;
          newState.stack = [...prev.stack, a - b];
          logEntry += ` ${a} - ${b} = ${a - b} → Stack: [${newState.stack.join(", ")}]`;
          break;
        }
        case "MUL": {
          const b = prev.stack.pop() || 0;
          const a = prev.stack.pop() || 0;
          newState.stack = [...prev.stack, a * b];
          logEntry += ` ${a} * ${b} = ${a * b} → Stack: [${newState.stack.join(", ")}]`;
          break;
        }
        case "DIV": {
          const b = prev.stack.pop() || 0;
          const a = prev.stack.pop() || 0;
          newState.stack = [...prev.stack, b !== 0 ? a / b : 0];
          logEntry += ` ${a} / ${b} = ${b !== 0 ? a / b : "div0"} → Stack: [${newState.stack.join(", ")}]`;
          break;
        }
        case "LOAD":
          newState.stack = [...prev.stack, prev.locals[instr.operand as string] || 0];
          logEntry += ` ${instr.operand}(${prev.locals[instr.operand as string] || 0}) → Stack: [${newState.stack.join(", ")}]`;
          break;
        case "STORE": {
          const value = prev.stack[prev.stack.length - 1] || 0;
          newState.locals = { ...prev.locals, [instr.operand as string]: value };
          newState.stack = prev.stack.slice(0, -1);
          logEntry += ` ${instr.operand} = ${value} → Locals: ${JSON.stringify(newState.locals)}`;
          break;
        }
        case "JUMP":
          newState.pc = instr.operand as number;
          logEntry += ` → PC=${newState.pc}`;
          break;
        case "JUMP_IF_ZERO": {
          const value = prev.stack.pop() || 0;
          newState.stack = prev.stack.slice(0, -1);
          if (value === 0) {
            newState.pc = instr.operand as number;
            logEntry += ` (condition true) → PC=${newState.pc}`;
          } else {
            logEntry += ` (condition false, value=${value}) → PC=${newState.pc}`;
          }
          break;
        }
        case "HALT":
          newState.running = false;
          logEntry += ` → Execution halted`;
          break;
      }

      setExecutionLog(logs => [...logs.slice(-4), logEntry]);
      setTotalSteps(s => s + 1);

      return newState;
    });
  }, [bytecode]);

  useEffect(() => {
    if (isExecuting && vmState.running) {
      const timer = setTimeout(() => {
        executeStep();
      }, speed);
      return () => clearTimeout(timer);
    } else if (isExecuting && !vmState.running) {
      setIsExecuting(false);
    }
  }, [isExecuting, vmState.running, speed, executeStep]);

  const startExecution = () => {
    setVmState(prev => ({ ...prev, running: true }));
    setIsExecuting(true);
  };

  const stepOnce = () => {
    if (!vmState.running) {
      setVmState(prev => ({ ...prev, running: true }));
    }
    executeStep();
  };

  const formatOperand = (instr: Instruction) => {
    if (instr.operand === undefined) return "";
    return String(instr.operand);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#f0883e]/20 rounded-lg">
            <Cpu size={20} className="text-[#f0883e]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Virtual Machine</h3>
            <p className="text-[#8b949e] text-sm">Stack-based bytecode execution</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left - Bytecode & Controls */}
        <div className="w-1/2 flex flex-col border-r border-[#30363d]">
          {/* Program Selector */}
          <div className="p-3 border-b border-[#30363d]">
            <select
              value={selectedProgram}
              onChange={(e) => handleProgramChange(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-white text-sm"
            >
              {bytecodePrograms.map((prog, i) => (
                <option key={i} value={i}>{prog.name}</option>
              ))}
            </select>
            <p className="text-[#8b949e] text-xs mt-1">{bytecodePrograms[selectedProgram].description}</p>
          </div>

          {/* Bytecode Display */}
          <div className="flex-1 overflow-auto p-4">
            <div className="text-[#8b949e] text-xs mb-2 flex items-center gap-1">
              <Code size={12} />
              Bytecode
            </div>
            <div className="font-mono text-sm space-y-1">
              {bytecode.map((instr, i) => (
                <motion.div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                    i === vmState.pc 
                      ? "bg-[#f0883e]/20 border border-[#f0883e]" 
                      : i < vmState.pc 
                      ? "bg-[#238636]/10 text-[#7ee787]"
                      : "bg-[#21262d] text-[#8b949e]"
                  }`}
                  animate={i === vmState.pc ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <span className="w-6 text-right text-xs text-[#6e7681]">{i}</span>
                  <span className={`font-bold ${
                    instr.opcode === "HALT" ? "text-[#f85149]" :
                    ["JUMP", "JUMP_IF_ZERO", "CALL", "RETURN"].includes(instr.opcode) ? "text-[#d2a8ff]" :
                    ["LOAD", "STORE"].includes(instr.opcode) ? "text-[#79c0ff]" :
                    ["ADD", "SUB", "MUL", "DIV"].includes(instr.opcode) ? "text-[#ffa657]" :
                    "text-[#3fb950]"
                  }">{instr.opcode}</span>
                  {instr.operand !== undefined && (
                    <span className="text-[#c9d1d9]">{formatOperand(instr)}</span>
                  )}
                  {i === vmState.pc && (
                    <span className="ml-auto text-xs text-[#f0883e] font-bold">← PC</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={startExecution}
                disabled={isExecuting || vmState.pc >= bytecode.length}
                className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                <Play size={16} />
                Run
              </button>
              <button
                onClick={() => setIsExecuting(!isExecuting)}
                disabled={!vmState.running}
                className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {isExecuting ? <Pause size={16} /> : <Play size={16} />}
                {isExecuting ? "Pause" : "Resume"}
              </button>
              <button
                onClick={stepOnce}
                disabled={vmState.pc >= bytecode.length}
                className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                <StepForward size={16} />
                Step
              </button>
              <button
                onClick={reset}
                className="p-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8b949e]">Speed:</span>
              <input
                type="range"
                min="100"
                max="1000"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-[#8b949e] w-12 text-right">{speed}ms</span>
            </div>
          </div>
        </div>

        {/* Right - VM State */}
        <div className="w-1/2 flex flex-col bg-[#0d1117]">
          {/* Stack */}
          <div className="flex-1 p-4 border-b border-[#30363d]">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={16} className="text-[#58a6ff]" />
              <span className="text-white font-medium">Operand Stack</span>
              <span className="ml-auto text-xs text-[#8b949e]">{vmState.stack.length} items</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {vmState.stack.length === 0 ? (
                  <div className="text-center py-8 text-[#6e7681]">
                    <ArrowUp size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Stack is empty</p>
                  </div>
                ) : (
                  vmState.stack.map((value, i) => (
                    <motion.div
                      key={`${i}-${value}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg font-mono ${
                        i === vmState.stack.length - 1 
                          ? "bg-[#58a6ff]/20 border border-[#58a6ff]" 
                          : "bg-[#21262d]"
                      }`}
                    >
                      <span className="text-[#6e7681] text-xs">[{i}]</span>
                      <span className="text-white text-lg font-bold">{value}</span>
                      {i === vmState.stack.length - 1 && (
                        <span className="text-xs text-[#58a6ff]">← Top</span>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Local Variables */}
          <div className="h-1/3 p-4 border-b border-[#30363d]">
            <div className="flex items-center gap-2 mb-3">
              <Database size={16} className="text-[#79c0ff]" />
              <span className="text-white font-medium">Local Variables</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(vmState.locals).length === 0 ? (
                <div className="col-span-2 text-center py-4 text-[#6e7681]">
                  <p className="text-sm">No local variables</p>
                </div>
              ) : (
                Object.entries(vmState.locals).map(([name, value]) => (
                  <motion.div
                    key={name}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-2 bg-[#21262d] rounded-lg"
                  >
                    <span className="text-[#8b949e] text-xs">{name}</span>
                    <div className="text-white font-mono font-bold">{value}</div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Execution Log */}
          <div className="h-1/3 p-4 bg-[#161b22]">
            <div className="flex items-center gap-2 mb-2">
              <Terminal size={16} className="text-[#3fb950]" />
              <span className="text-white font-medium">Execution Log</span>
              <span className="ml-auto text-xs text-[#8b949e]">{totalSteps} steps</span>
            </div>
            <div className="font-mono text-xs space-y-1 h-24 overflow-auto">
              {executionLog.length === 0 ? (
                <div className="text-[#6e7681]">Click Run or Step to begin execution...</div>
              ) : (
                executionLog.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[#7ee787]"
                  >
                    {log}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
