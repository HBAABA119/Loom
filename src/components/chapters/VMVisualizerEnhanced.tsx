"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Code, Layers, Database, Terminal, ArrowUp, Play, Pause, SkipForward, RotateCcw } from "lucide-react";

type Opcode = "LOAD" | "STORE" | "ADD" | "SUB" | "MUL" | "DIV" | "JUMP" | "JUMP_IF_ZERO" | "CALL" | "RETURN" | "HALT";

interface Instruction {
  opcode: Opcode;
  operand?: number;
}

interface VMState {
  stack: number[];
  locals: Record<string, number>;
  pc: number;
  running: boolean;
}

const bytecodePrograms = [
  {
    name: "Simple Addition",
    description: "Load two numbers, add them, and store the result",
    bytecode: [
      { opcode: "LOAD", operand: 5 },
      { opcode: "LOAD", operand: 3 },
      { opcode: "ADD" },
      { opcode: "STORE", operand: 0 },
      { opcode: "HALT" }
    ]
  },
  {
    name: "Factorial",
    description: "Calculate factorial of 4 using a loop",
    bytecode: [
      { opcode: "LOAD", operand: 4 },
      { opcode: "STORE", operand: 0 },
      { opcode: "LOAD", operand: 1 },
      { opcode: "STORE", operand: 1 },
      { opcode: "LOAD", operand: 0 },
      { opcode: "JUMP_IF_ZERO", operand: 12 },
      { opcode: "LOAD", operand: 1 },
      { opcode: "LOAD", operand: 0 },
      { opcode: "MUL" },
      { opcode: "STORE", operand: 1 },
      { opcode: "LOAD", operand: 0 },
      { opcode: "LOAD", operand: 1 },
      { opcode: "SUB" },
      { opcode: "STORE", operand: 0 },
      { opcode: "JUMP", operand: 6 },
      { opcode: "HALT" }
    ]
  },
  {
    name: "Sum of Array",
    description: "Sum values from memory locations",
    bytecode: [
      { opcode: "LOAD", operand: 10 },
      { opcode: "STORE", operand: 0 },
      { opcode: "LOAD", operand: 20 },
      { opcode: "STORE", operand: 1 },
      { opcode: "LOAD", operand: 30 },
      { opcode: "STORE", operand: 2 },
      { opcode: "LOAD", operand: 0 },
      { opcode: "ADD" },
      { opcode: "STORE", operand: 0 },
      { opcode: "LOAD", operand: 1 },
      { opcode: "ADD" },
      { opcode: "STORE", operand: 0 },
      { opcode: "LOAD", operand: 2 },
      { opcode: "ADD" },
      { opcode: "STORE", operand: 0 },
      { opcode: "HALT" }
    ]
  }
];

export default function VMVisualizerEnhanced() {
  const [selectedProgram, setSelectedProgram] = useState(0);
  const [bytecode, setBytecode] = useState<Instruction[]>(bytecodePrograms[0].bytecode);
  const [vmState, setVmState] = useState<VMState>({
    stack: [],
    locals: {},
    pc: 0,
    running: false
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [totalSteps, setTotalSteps] = useState(0);

  useEffect(() => {
    resetVM();
  }, [selectedProgram]);

  const resetVM = () => {
    setVmState({
      stack: [],
      locals: {},
      pc: 0,
      running: false
    });
    setExecutionLog([]);
    setTotalSteps(0);
    setIsExecuting(false);
  };

  const handleProgramChange = (index: number) => {
    setSelectedProgram(index);
    setBytecode(bytecodePrograms[index].bytecode);
  };

  const executeStep = () => {
    if (vmState.pc >= bytecode.length) {
      setIsExecuting(false);
      return;
    }

    const instr = bytecode[vmState.pc];
    const newStack = [...vmState.stack];
    const newLocals = { ...vmState.locals };
    let logMessage = "";

    switch (instr.opcode) {
      case "LOAD":
        if (instr.operand !== undefined) {
          newStack.push(instr.operand);
          logMessage = "PUSH " + instr.operand;
        }
        break;
      case "STORE":
        if (instr.operand !== undefined && newStack.length > 0) {
          newLocals["var" + instr.operand] = newStack.pop()!;
          logMessage = "STORE " + newLocals["var" + instr.operand] + " → var" + instr.operand;
        }
        break;
      case "ADD":
        if (newStack.length >= 2) {
          const b = newStack.pop()!;
          const a = newStack.pop()!;
          newStack.push(a + b);
          logMessage = a + " + " + b + " = " + (a + b);
        }
        break;
      case "SUB":
        if (newStack.length >= 2) {
          const b = newStack.pop()!;
          const a = newStack.pop()!;
          newStack.push(a - b);
          logMessage = a + " - " + b + " = " + (a - b);
        }
        break;
      case "MUL":
        if (newStack.length >= 2) {
          const b = newStack.pop()!;
          const a = newStack.pop()!;
          newStack.push(a * b);
          logMessage = a + " × " + b + " = " + (a * b);
        }
        break;
      case "DIV":
        if (newStack.length >= 2) {
          const b = newStack.pop()!;
          const a = newStack.pop()!;
          if (b !== 0) {
            newStack.push(Math.floor(a / b));
            logMessage = a + " ÷ " + b + " = " + Math.floor(a / b);
          }
        }
        break;
      case "JUMP":
        if (instr.operand !== undefined) {
          setVmState(prev => ({ ...prev, pc: instr.operand! }));
          logMessage = "JUMP → " + instr.operand;
          setExecutionLog(prev => [...prev, logMessage]);
          setTotalSteps(prev => prev + 1);
          return;
        }
        break;
      case "JUMP_IF_ZERO":
        if (instr.operand !== undefined) {
          const top = newStack.length > 0 ? newStack[newStack.length - 1] : 0;
          if (top === 0) {
            setVmState(prev => ({ ...prev, pc: instr.operand!, stack: newStack }));
            logMessage = "TOP=0, JUMP → " + instr.operand;
            setExecutionLog(prev => [...prev, logMessage]);
            setTotalSteps(prev => prev + 1);
            return;
          } else {
            logMessage = "TOP=" + top + " ≠ 0, CONTINUE";
          }
        }
        break;
      case "HALT":
        setIsExecuting(false);
        logMessage = "HALT";
        break;
      default:
        logMessage = "UNKNOWN: " + instr.opcode;
    }

    setVmState(prev => ({ ...prev, stack: newStack, locals: newLocals, pc: prev.pc + 1 }));
    setExecutionLog(prev => [...prev, logMessage]);
    setTotalSteps(prev => prev + 1);
  };

  const startExecution = () => {
    if (!vmState.running) {
      setVmState(prev => ({ ...prev, running: true }));
    }
    setIsExecuting(true);
  };

  const pauseExecution = () => {
    setIsExecuting(false);
  };

  const stepOnce = () => {
    if (!vmState.running) {
      setVmState(prev => ({ ...prev, running: true }));
    }
    executeStep();
  };

  const getOpcodeColor = (opcode: Opcode) => {
    if (opcode === "HALT") return "text-[#f85149]";
    if (["JUMP", "JUMP_IF_ZERO", "CALL", "RETURN"].includes(opcode)) return "text-[#d2a8ff]";
    if (["LOAD", "STORE"].includes(opcode)) return "text-[#79c0ff]";
    if (["ADD", "SUB", "MUL", "DIV"].includes(opcode)) return "text-[#ffa657]";
    return "text-[#3fb950]";
  };

  const formatOperand = (instr: Instruction) => {
    if (instr.operand === undefined) return "";
    return String(instr.operand);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExecuting && vmState.pc < bytecode.length && bytecode[vmState.pc].opcode !== "HALT") {
      interval = setInterval(() => {
        executeStep();
      }, speed);
    } else {
      setIsExecuting(false);
    }
    return () => clearInterval(interval);
  }, [isExecuting, vmState.pc, speed]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
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
        <div className="w-1/2 flex flex-col border-r border-[#30363d]">
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

          <div className="flex-1 overflow-auto p-4">
            <div className="text-[#8b949e] text-xs mb-2 flex items-center gap-1">
              <Code size={12} />
              Bytecode
            </div>
            <div className="font-mono text-sm space-y-1">
              {bytecode.map((instr, i) => (
                <motion.div
                  key={i}
                  className={"flex items-center gap-3 px-3 py-2 rounded-lg " + (
                    i === vmState.pc 
                      ? "bg-[#f0883e]/20 border border-[#f0883e]" 
                      : i < vmState.pc 
                      ? "bg-[#238636]/10 text-[#7ee787]"
                      : "bg-[#21262d] text-[#8b949e]"
                  )}
                  animate={i === vmState.pc ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <span className="w-6 text-right text-xs text-[#6e7681]">{i}</span>
                  <span className={"font-bold " + getOpcodeColor(instr.opcode)}>{instr.opcode}</span>
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

          <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={startExecution}
                disabled={isExecuting || vmState.pc >= bytecode.length}
                className="flex items-center gap-2 px-3 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Play size={16} />
                Run
              </button>
              <button
                onClick={pauseExecution}
                disabled={!isExecuting}
                className="flex items-center gap-2 px-3 py-2 bg-[#d29922] hover:bg-[#e3b341] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Pause size={16} />
                Pause
              </button>
              <button
                onClick={stepOnce}
                disabled={isExecuting || vmState.pc >= bytecode.length}
                className="flex items-center gap-2 px-3 py-2 bg-[#1f6feb] hover:bg-[#388bfd] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <SkipForward size={16} />
                Step
              </button>
              <button
                onClick={resetVM}
                className="flex items-center gap-2 px-3 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8b949e]">Speed:</span>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-[#8b949e] w-12 text-right">{speed}ms</span>
            </div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col bg-[#0d1117]">
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
                      key={"stack-" + i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="px-4 py-3 bg-[#21262d] rounded-lg flex items-center justify-between"
                    >
                      <span className="text-white font-mono font-bold text-lg">{value}</span>
                      {i === vmState.stack.length - 1 && (
                        <span className="text-xs text-[#58a6ff]">← Top</span>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

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
