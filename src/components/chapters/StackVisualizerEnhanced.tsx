"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  ChevronLeft, ChevronRight, ArrowDown, ArrowUp
} from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface StackElement {
  value: string;
  index: number;
  isNew?: boolean;
  isPopping?: boolean;
  isTop?: boolean;
}

interface Step {
  step: number;
  title: string;
  description: string;
  codeLines: number[];
  elements: StackElement[];
  topIndex: number;
  action: "init" | "push" | "pop" | "peek" | "empty";
  explanation: string;
  theoryConnection: string;
  complexity: string;
}

const speeds = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
];

const codeLines = [
  "// Stack - LIFO: Last In, First Out",
  "class Stack {",
  "  constructor() {",
  "    this.items = [];     // Underlying array",
  "    this.top = -1;       // Index of top element",
  "  }",
  "",
  "  // O(1) - Add element to top",
  "  push(value) {",
  "    this.top++;          // Move top pointer up",
  "    this.items[this.top] = value;  // Store value",
  "  }",
  "",
  "  // O(1) - Remove and return top element",
  "  pop() {",
  "    if (this.isEmpty()) return undefined;",
  "    const value = this.items[this.top];  // Get top",
  "    this.top--;          // Move top pointer down",
  "    return value;        // Return removed value",
  "  }",
  "",
  "  // O(1) - View top element without removing",
  "  peek() {",
  "    if (this.isEmpty()) return undefined;",
  "    return this.items[this.top];",
  "  }",
  "",
  "  // O(1) - Check if stack is empty",
  "  isEmpty() {",
  "    return this.top === -1;",
  "  }",
  "",
  "  // O(1) - Get number of elements",
  "  size() {",
  "    return this.top + 1;",
  "  }",
  "}",
];

const generateSteps = (): Step[] => [
  {
    step: 0,
    title: "What is a Stack?",
    description: "A Stack is a LIFO (Last In, First Out) data structure. Think of a stack of plates - you add and remove from the top only.",
    codeLines: [1, 2, 3, 4, 5],
    elements: [],
    topIndex: -1,
    action: "init",
    explanation: "The stack starts empty. 'top' is initialized to -1, indicating no elements. The underlying array is ready but empty.",
    theoryConnection: "Real-world analogy: A stack of books, cafeteria trays, or browser back button history. The last thing you added is the first you can access.",
    complexity: "All operations: O(1) constant time"
  },
  {
    step: 1,
    title: "Push Operation - Adding 'A'",
    description: "Push adds an element to the TOP of the stack. The top pointer moves up.",
    codeLines: [8, 9, 10],
    elements: [{ value: "A", index: 0, isNew: true, isTop: true }],
    topIndex: 0,
    action: "push",
    explanation: "top increments from -1 to 0. items[0] = 'A'. A is now the top element. This is always O(1) - no shifting needed!",
    theoryConnection: "Like placing a plate on top of a stack. You don't need to move other plates - just place it on top.",
    complexity: "Push: O(1) - Direct index access"
  },
  {
    step: 2,
    title: "Push Operation - Adding 'B'",
    description: "Push another element. B goes on top of A.",
    codeLines: [8, 9, 10],
    elements: [
      { value: "A", index: 0 },
      { value: "B", index: 1, isNew: true, isTop: true }
    ],
    topIndex: 1,
    action: "push",
    explanation: "top becomes 1. B is now the top element, sitting above A. Notice A stays in place - no elements shift.",
    theoryConnection: "Stack maintains insertion order internally, but access is always from the top. B was added second but is accessed first.",
    complexity: "Push: O(1) - Still constant time"
  },
  {
    step: 3,
    title: "Push More Elements",
    description: "Add C and D to the stack. Watch the stack grow upward.",
    codeLines: [8, 9, 10],
    elements: [
      { value: "A", index: 0 },
      { value: "B", index: 1 },
      { value: "C", index: 2, isNew: true, isTop: false },
      { value: "D", index: 3, isNew: true, isTop: true }
    ],
    topIndex: 3,
    action: "push",
    explanation: "Stack now has 4 elements. D is at top (index 3). The stack grows upward visually, but in memory it's just sequential array indices.",
    theoryConnection: "This is why we call it a 'stack' - it literally stacks up! Each new item sits on top of the previous ones.",
    complexity: "All pushes: O(1) each"
  },
  {
    step: 4,
    title: "Peek Operation - View Top",
    description: "Peek lets us see the top element without removing it. D is still on top.",
    codeLines: [19, 20, 21],
    elements: [
      { value: "A", index: 0 },
      { value: "B", index: 1 },
      { value: "C", index: 2 },
      { value: "D", index: 3, isTop: true }
    ],
    topIndex: 3,
    action: "peek",
    explanation: "peek() returns items[top] = 'D'. Stack unchanged! Peek is useful when you need to check what's on top before deciding to pop.",
    theoryConnection: "Like peeking at the top book in a stack without taking it. You can check the title before deciding to read it.",
    complexity: "Peek: O(1) - Simple array access"
  },
  {
    step: 5,
    title: "Pop Operation - Remove 'D'",
    description: "Pop removes the top element. D is removed, and top moves down to C.",
    codeLines: [13, 14, 15, 16, 17],
    elements: [
      { value: "A", index: 0 },
      { value: "B", index: 1 },
      { value: "C", index: 2, isTop: true },
      { value: "D", index: 3, isPopping: true }
    ],
    topIndex: 2,
    action: "pop",
    explanation: "D is returned and removed. top decrements to 2. C is now the top element. Notice: D is still in memory at items[3], but we ignore it.",
    theoryConnection: "LIFO in action: D was Last In, so it's First Out. This is fundamental to stack behavior - crucial for undo systems and expression parsing.",
    complexity: "Pop: O(1) - Just move pointer"
  },
  {
    step: 6,
    title: "Pop Again - Remove 'C'",
    description: "Pop C. Now B becomes the top element.",
    codeLines: [13, 14, 15, 16, 17],
    elements: [
      { value: "A", index: 0 },
      { value: "B", index: 1, isTop: true },
      { value: "C", index: 2, isPopping: true }
    ],
    topIndex: 1,
    action: "pop",
    explanation: "C is popped. top = 1. B is now accessible as top. The stack is shrinking. Two elements remain.",
    theoryConnection: "Undo operations work like this: each action is pushed. When you undo, the most recent action (top) is popped and reversed.",
    complexity: "Pop: O(1) - Constant time"
  },
  {
    step: 7,
    title: "Push 'E' - Mixing Operations",
    description: "After popping, we can push again. E goes on top of B.",
    codeLines: [8, 9, 10],
    elements: [
      { value: "A", index: 0 },
      { value: "B", index: 1 },
      { value: "E", index: 2, isNew: true, isTop: true }
    ],
    topIndex: 2,
    action: "push",
    explanation: "E is pushed to index 2 (where C used to be). C and D are effectively overwritten when we push again. Stack contains [A, B, E].",
    theoryConnection: "This shows how stacks reuse memory. Old popped values get overwritten. This is memory-efficient compared to dynamic resizing.",
    complexity: "Push: O(1) - Reuses slot"
  },
  {
    step: 8,
    title: "Pop All - Emptying the Stack",
    description: "Pop remaining elements to empty the stack.",
    codeLines: [13, 14, 15, 16, 17],
    elements: [
      { value: "A", index: 0, isPopping: true },
      { value: "B", index: 1, isPopping: true },
      { value: "E", index: 2, isPopping: true }
    ],
    topIndex: -1,
    action: "pop",
    explanation: "After popping E, B, and A, top returns to -1. The stack is empty. isEmpty() would return true.",
    theoryConnection: "Expression evaluation uses this: push operands, apply operators that pop needed values, push result. When done, one value remains.",
    complexity: "Each pop: O(1)"
  },
  {
    step: 9,
    title: "Stack Applications Summary",
    description: "Stacks are everywhere in computing. Let's review the key use cases.",
    codeLines: [27, 28, 29],
    elements: [],
    topIndex: -1,
    action: "init",
    explanation: "Common uses: 1) Undo/Redo systems, 2) Browser back/forward, 3) Expression evaluation (postfix), 4) Function call stack, 5) Balanced parentheses checking.",
    theoryConnection: "Your program's function calls use a stack! When main() calls foo(), foo is pushed. When foo returns, it's popped and execution resumes in main.",
    complexity: "All stack ops: O(1) - incredibly efficient!"
  },
];

export default function StackVisualizerEnhanced() {
  const { 
    currentStep: stepIndex, 
    totalSteps, 
    isPlaying, 
    playbackSpeed,
    togglePlay, 
    pause,
    setStep, 
    nextStep, 
    prevStep,
    setTotalSteps,
    setPlaybackSpeed
  } = useTimeline();
  
  
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setTotalSteps(generateSteps().length);
  }, [setTotalSteps]);

  useEffect(() => {
    setCurrentStep(stepIndex);
  }, [stepIndex]);

  const steps = generateSteps();
  const step = steps[currentStep] || steps[0];

  useEffect(() => {
    if (step?.codeLines) {
      setActiveLines(step.codeLines);
    }
  }, [step]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        nextStep();
      }, 2500 / playbackSpeed);
    } else if (currentStep >= steps.length - 1 && isPlaying) {
      pause();
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, playbackSpeed, nextStep, pause]);

  const handleReset = useCallback(() => {
    pause();
    setStep(0);
  }, [pause, setStep]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div>
          <h3 className="text-white font-semibold text-lg">Stack Visualization</h3>
          <p className="text-[#8b949e] text-sm">LIFO: Last In, First Out - Push, Pop, Peek operations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <span className="text-[#8b949e] text-sm">Top Index:</span>
            <span className="text-[#f0883e] font-mono font-bold">{step.topIndex}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <span className="text-[#8b949e] text-sm">Size:</span>
            <span className="text-white font-bold">{step.elements.filter(e => !e.isPopping).length}</span>
          </div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full">
            <div 
              className="h-full bg-[#58a6ff] rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visualization */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              {/* Stack Container */}
              <div className="relative border-2 border-[#30363d] rounded-lg p-4 min-w-[200px] min-h-[300px] flex flex-col-reverse items-center gap-2 bg-[#161b22]/50">
                {/* Empty state */}
                {step.elements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[#6e7681] italic">Empty Stack</span>
                  </div>
                )}
                
                {/* Stack elements */}
                <AnimatePresence mode="popLayout">
                  {step.elements.map((elem, idx) => (
                    <motion.div
                      key={`${elem.value}-${idx}`}
                      initial={elem.isNew ? { y: -100, opacity: 0, scale: 0.5 } : elem.isPopping ? { opacity: 1 } : { y: 50, opacity: 0 }}
                      animate={elem.isPopping ? { y: -100, opacity: 0, scale: 0.5 } : { y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -100, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className="relative"
                    >
                      {/* Top indicator */}
                      {elem.isTop && !elem.isPopping && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="absolute -left-20 top-1/2 -translate-y-1/2 flex items-center gap-1"
                        >
                          <ArrowDown size={16} className="text-[#f0883e]" />
                          <span className="text-[#f0883e] text-xs font-mono">TOP</span>
                        </motion.div>
                      )}
                      
                      {/* Element box */}
                      <div
                        className={`w-32 h-14 border-2 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                          elem.isTop && !elem.isPopping
                            ? "border-[#f0883e] bg-[#f0883e]/20 text-[#f0883e]"
                            : elem.isNew
                            ? "border-[#3fb950] bg-[#3fb950]/20 text-[#3fb950]"
                            : elem.isPopping
                            ? "border-[#f85149] bg-[#f85149]/20 text-[#f85149]"
                            : "border-[#30363d] bg-[#21262d] text-[#c9d1d9]"
                        }`}
                      >
                        {elem.value}
                      </div>
                      
                      {/* Index label */}
                      <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-xs text-[#6e7681] font-mono">
        [{elem.index}]
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Bottom label */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-[#6e7681]">
                  Bottom (index 0)
                </div>
              </div>

              {/* Top pointer visualization */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <span className="text-[#8b949e] text-sm">Top Pointer:</span>
                <span className="text-[#f0883e] font-mono font-bold bg-[#f0883e]/20 px-2 py-1 rounded">
                  {step.topIndex}
                </span>
              </div>
            </div>
          </div>

          {/* Action Badge */}
          <div className="mt-8 text-center">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              step.action === "push" 
                ? "bg-[#3fb950]/20 text-[#3fb950]" 
                : step.action === "pop"
                ? "bg-[#f85149]/20 text-[#f85149]"
                : step.action === "peek"
                ? "bg-[#58a6ff]/20 text-[#58a6ff]"
                : "bg-[#8b949e]/20 text-[#8b949e]"
            }`}>
              {step.action === "push" && <ArrowDown size={16} />}
              {step.action === "pop" && <ArrowUp size={16} />}
              {step.action === "push" && "PUSH Operation"}
              {step.action === "pop" && "POP Operation"}
              {step.action === "peek" && "PEEK Operation"}
              {step.action === "init" && "Stack Overview"}
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-5 border-b border-[#30363d]">
            <span className="text-[#58a6ff] text-xs font-mono uppercase tracking-wider">
              Step {currentStep + 1}: {step.title}
            </span>
            <p className="text-[#c9d1d9] mt-3 leading-relaxed">{step.description}</p>
          </div>

          <div className="p-5 border-b border-[#30363d] flex-1 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">What's Happening</h4>
            <p className="text-[#c9d1d9] text-sm leading-relaxed mb-4">{step.explanation}</p>
            
            <div className="mt-4 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg">
              <h4 className="text-[#3fb950] text-xs uppercase tracking-wider mb-1">💡 Theory Connection</h4>
              <p className="text-[#c9d1d9] text-sm leading-relaxed">{step.theoryConnection}</p>
            </div>

            <div className="mt-4 p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg">
              <h4 className="text-[#58a6ff] text-xs uppercase tracking-wider mb-1">⏱️ Complexity</h4>
              <p className="text-[#c9d1d9] text-sm font-mono">{step.complexity}</p>
            </div>
          </div>

          <div className="p-4 bg-[#0d1117] max-h-56 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">Code Reference</h4>
            <div className="text-xs font-mono">
              {codeLines.map((line, i) => (
                <div 
                  key={i}
                  className={`px-2 py-0.5 rounded ${
                    step.codeLines?.includes(i + 1)
                      ? "bg-[#238636]/30 text-[#7ee787] border-l-2 border-[#238636]"
                      : "text-[#8b949e]"
                  }`}
                >
                  <span className="text-[#6e7681] w-6 inline-block select-none">{i + 1}</span>
                  {line || " "}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => { pause(); setStep(0); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <SkipBack size={18} />
            </button>
            <button onClick={prevStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <ChevronLeft size={20} />
            </button>
            
            <button onClick={togglePlay} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center gap-2">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            
            <button onClick={nextStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <ChevronRight size={20} />
            </button>
            <button onClick={() => { pause(); setStep(steps.length - 1); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <SkipForward size={18} />
            </button>
            <button onClick={handleReset} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#8b949e] text-sm">Speed:</span>
            <div className="flex gap-1">
              {speeds.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setPlaybackSpeed(s.value)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    playbackSpeed === s.value
                      ? "bg-[#58a6ff] text-white"
                      : "bg-[#21262d] text-[#8b949e] hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
