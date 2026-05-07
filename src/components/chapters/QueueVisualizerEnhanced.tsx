"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  ChevronLeft, ChevronRight, ArrowRight, ArrowLeft
} from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface QueueElement {
  value: string;
  index: number;
  isNew?: boolean;
  isRemoving?: boolean;
  isFront?: boolean;
  isRear?: boolean;
}

interface Step {
  step: number;
  title: string;
  description: string;
  codeLines: number[];
  elements: QueueElement[];
  front: number;
  rear: number;
  action: "init" | "enqueue" | "dequeue" | "peek" | "full";
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
  "// Queue - FIFO: First In, First Out",
  "class Queue {",
  "  constructor(capacity) {",
  "    this.items = new Array(capacity);",
  "    this.front = 0;    // Index of first element",
  "    this.rear = -1;     // Index of last element",
  "    this.size = 0;      // Current number of elements",
  "    this.capacity = capacity;",
  "  }",
  "",
  "  // O(1) - Add to rear",
  "  enqueue(value) {",
  "    if (this.isFull()) return false;",
  "    this.rear = (this.rear + 1) % this.capacity;",
  "    this.items[this.rear] = value;",
  "    this.size++;",
  "    return true;",
  "  }",
  "",
  "  // O(1) - Remove from front",
  "  dequeue() {",
  "    if (this.isEmpty()) return undefined;",
  "    const value = this.items[this.front];",
  "    this.items[this.front] = null;  // Clear slot",
  "    this.front = (this.front + 1) % this.capacity;",
  "    this.size--;",
  "    return value;",
  "  }",
  "",
  "  // O(1) - View front element",
  "  peek() {",
  "    if (this.isEmpty()) return undefined;",
  "    return this.items[this.front];",
  "  }",
  "",
  "  // O(1) - Check if empty",
  "  isEmpty() {",
  "    return this.size === 0;",
  "  }",
  "",
  "  // O(1) - Check if full",
  "  isFull() {",
  "    return this.size === this.capacity;",
  "  }",
  "}",
];

const generateSteps = (): Step[] => [
  {
    step: 0,
    title: "What is a Queue?",
    description: "A Queue is a FIFO (First In, First Out) data structure. Think of a line at a store - first person in line is first to be served.",
    codeLines: [1, 2, 3, 4, 5, 6, 7, 8],
    elements: Array(5).fill(null).map((_, i) => ({ value: "", index: i, isFront: false, isRear: false })),
    front: 0,
    rear: -1,
    action: "init",
    explanation: "Queue initialized with capacity 5. Front = 0, Rear = -1 (empty). Size = 0. This is a circular array implementation - more memory efficient than shifting.",
    theoryConnection: "Real-world examples: Printer job queue, CPU task scheduling, customer service lines, playlist queues. FIFO ensures fairness.",
    complexity: "All operations: O(1) constant time"
  },
  {
    step: 1,
    title: "Enqueue Operation - Add 'A'",
    description: "Enqueue adds an element at the REAR of the queue.",
    codeLines: [11, 12, 13, 14, 15, 16],
    elements: [
      { value: "A", index: 0, isNew: true, isFront: true, isRear: true },
      { value: "", index: 1 },
      { value: "", index: 2 },
      { value: "", index: 3 },
      { value: "", index: 4 },
    ],
    front: 0,
    rear: 0,
    action: "enqueue",
    explanation: "rear = (rear + 1) % 5 = 0. items[0] = 'A'. Both front and rear point to 0. Size becomes 1. Notice: rear moves forward.",
    theoryConnection: "Like joining a line - you always go to the back (rear). The modulo (%) enables circular behavior for efficient space reuse.",
    complexity: "Enqueue: O(1) - No element shifting needed"
  },
  {
    step: 2,
    title: "Enqueue More Elements",
    description: "Add B, C, and D to the queue.",
    codeLines: [11, 12, 13, 14, 15, 16],
    elements: [
      { value: "A", index: 0, isFront: true },
      { value: "B", index: 1 },
      { value: "C", index: 2 },
      { value: "D", index: 3, isRear: true },
      { value: "", index: 4 },
    ],
    front: 0,
    rear: 3,
    action: "enqueue",
    explanation: "After 3 more enqueues: rear = 3, front stays at 0. Queue has A(front), B, C, D(rear). FIFO order is being established.",
    theoryConnection: "The queue grows from the rear. Unlike stacks, we maintain two pointers. This allows O(1) operations at both ends.",
    complexity: "Each enqueue: O(1) time"
  },
  {
    step: 3,
    title: "Dequeue Operation - Remove 'A'",
    description: "Dequeue removes the FRONT element (A). First In, First Out!",
    codeLines: [19, 20, 21, 22, 23, 24, 25],
    elements: [
      { value: "A", index: 0, isFront: true, isRemoving: true },
      { value: "B", index: 1, isFront: false },
      { value: "C", index: 2 },
      { value: "D", index: 3, isRear: true },
      { value: "", index: 4 },
    ],
    front: 0,
    rear: 3,
    action: "dequeue",
    explanation: "A is returned and removed. front moves to 1. B becomes the new front. Notice A stays in memory temporarily but is logically removed.",
    theoryConnection: "This is FIFO: A was First In, so it's First Out. Like the first customer in line being served first. Fair and predictable.",
    complexity: "Dequeue: O(1) - Just move front pointer"
  },
  {
    step: 4,
    title: "After Dequeue - B is Front",
    description: "A is gone. B is now at front. Queue: B → C → D.",
    codeLines: [25, 26],
    elements: [
      { value: "", index: 0 },
      { value: "B", index: 1, isFront: true },
      { value: "C", index: 2 },
      { value: "D", index: 3, isRear: true },
      { value: "", index: 4 },
    ],
    front: 1,
    rear: 3,
    action: "init",
    explanation: "front = 1 (B), rear = 3 (D). Size = 3. The empty slot at 0 will be reused when we wrap around - circular queue efficiency!",
    theoryConnection: "Circular queue: When rear reaches the end, it wraps to index 0 if space available. No wasted space, no shifting needed.",
    complexity: "Space efficient - reuses 'empty' slots"
  },
  {
    step: 5,
    title: "Circular Behavior - Enqueue E",
    description: "Add E. Rear moves to 4. Queue approaches full capacity.",
    codeLines: [11, 12, 13, 14, 15, 16],
    elements: [
      { value: "", index: 0 },
      { value: "B", index: 1, isFront: true },
      { value: "C", index: 2 },
      { value: "D", index: 3 },
      { value: "E", index: 4, isRear: true },
    ],
    front: 1,
    rear: 4,
    action: "enqueue",
    explanation: "rear = 4. Queue: B(front) → C → D → E(rear). Size = 4. One slot remaining at index 0 (where A used to be).",
    theoryConnection: "Notice we didn't shift elements! B stayed at index 1. The circular design means we don't waste time moving elements around.",
    complexity: "Still O(1) - no shifting"
  },
  {
    step: 6,
    title: "Queue Full - Cannot Enqueue",
    description: "Try to add F. Queue is full! (size = capacity)",
    codeLines: [37, 38, 39],
    elements: [
      { value: "", index: 0 },
      { value: "B", index: 1, isFront: true },
      { value: "C", index: 2 },
      { value: "D", index: 3 },
      { value: "E", index: 4, isRear: true },
    ],
    front: 1,
    rear: 4,
    action: "full",
    explanation: "isFull() returns true because size = 5 equals capacity. Cannot enqueue until we dequeue. This is a bounded queue.",
    theoryConnection: "Fixed-size queues are common in embedded systems and network buffers. For dynamic sizing, we'd use a linked list implementation instead.",
    complexity: "Full check: O(1)"
  },
  {
    step: 7,
    title: "Dequeue B and C",
    description: "Remove two elements. Front moves to index 3 (D).",
    codeLines: [19, 20, 21, 22, 23, 24, 25],
    elements: [
      { value: "", index: 0 },
      { value: "", index: 1, isRemoving: true },
      { value: "", index: 2, isRemoving: true },
      { value: "D", index: 3, isFront: true },
      { value: "E", index: 4, isRear: true },
    ],
    front: 3,
    rear: 4,
    action: "dequeue",
    explanation: "After dequeuing B and C: front = 3 (D), rear = 4 (E). Size = 2. Now slots 0, 1, 2 are available for reuse.",
    theoryConnection: "This demonstrates the circular nature. When we enqueue again, rear will wrap to 0, reusing that freed space.",
    complexity: "Each dequeue: O(1)"
  },
  {
    step: 8,
    title: "Circular Wrap - Enqueue F",
    description: "Add F. Watch rear wrap from 4 back to 0!",
    codeLines: [13],
    elements: [
      { value: "F", index: 0, isRear: true },
      { value: "", index: 1 },
      { value: "", index: 2 },
      { value: "D", index: 3, isFront: true },
      { value: "E", index: 4 },
    ],
    front: 3,
    rear: 0,
    action: "enqueue",
    explanation: "rear = (4 + 1) % 5 = 0. F goes to index 0! Queue now: D(front) → E → F(rear). The circular wrap happened!",
    theoryConnection: "The modulo operation (%) creates the circle. Index 0 follows index 4. This is why we call it a 'circular queue'.",
    complexity: "Circular math: O(1)"
  },
  {
    step: 9,
    title: "Queue Applications",
    description: "Queues are essential in computer science. Here are the key applications.",
    codeLines: [27, 28, 29],
    elements: [
      { value: "F", index: 0 },
      { value: "", index: 1 },
      { value: "", index: 2 },
      { value: "D", index: 3 },
      { value: "E", index: 4 },
    ],
    front: 3,
    rear: 0,
    action: "init",
    explanation: "Common uses: 1) CPU scheduling (round-robin), 2) Printer spooling, 3) Breadth-First Search (BFS), 4) Network packet buffering, 5) Keyboard input buffering.",
    theoryConnection: "BFS uses a queue to explore nodes level by level. CPU schedulers use queues to ensure fair process execution. Queues bring order to concurrent systems.",
    complexity: "Queue ops: All O(1) - optimal efficiency"
  },
];

export default function QueueVisualizerEnhanced() {
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
          <h3 className="text-white font-semibold text-lg">Queue Visualization</h3>
          <p className="text-[#8b949e] text-sm">FIFO: First In, First Out - Enqueue at Rear, Dequeue from Front</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <span className="text-[#8b949e] text-xs">Front:</span>
            <span className="text-[#58a6ff] font-mono font-bold">{step.front}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <span className="text-[#8b949e] text-xs">Rear:</span>
            <span className="text-[#f0883e] font-mono font-bold">{step.rear}</span>
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
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Queue Container */}
            <div className="relative w-full max-w-3xl">
              {/* Direction Labels */}
              <div className="flex justify-between mb-2 text-xs text-[#8b949e]">
                <span className="flex items-center gap-1">
                  <ArrowLeft size={12} /> DEQUEUE (Front)
                </span>
                <span className="flex items-center gap-1">
                  ENQUEUE (Rear) <ArrowRight size={12} />
                </span>
              </div>

              {/* Queue Array */}
              <div className="flex gap-2">
                <AnimatePresence mode="popLayout">
                  {step.elements.map((elem, idx) => (
                    <motion.div
                      key={idx}
                      initial={elem.isNew ? { x: 50, opacity: 0 } : elem.isRemoving ? { opacity: 1 } : false}
                      animate={elem.isRemoving ? { x: -50, opacity: 0 } : { x: 0, opacity: 1 }}
                      className="flex-1 relative"
                    >
                      {/* Front indicator */}
                      {elem.isFront && !elem.isRemoving && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
                        >
                          <span className="text-[#58a6ff] text-xs font-mono bg-[#58a6ff]/20 px-2 py-0.5 rounded">FRONT</span>
                          <div className="w-0.5 h-2 bg-[#58a6ff]" />
                        </motion.div>
                      )}

                      {/* Rear indicator */}
                      {elem.isRear && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
                        >
                          <span className="text-[#f0883e] text-xs font-mono bg-[#f0883e]/20 px-2 py-0.5 rounded">REAR</span>
                          <div className="w-0.5 h-2 bg-[#f0883e]" />
                        </motion.div>
                      )}

                      {/* Cell */}
                      <div
                        className={`h-24 border-2 rounded-lg flex items-center justify-center font-bold text-xl transition-all ${
                          elem.value === ""
                            ? "border-[#21262d] bg-[#161b22] border-dashed"
                            : elem.isFront
                            ? "border-[#58a6ff] bg-[#58a6ff]/20 text-[#58a6ff]"
                            : elem.isRear
                            ? "border-[#f0883e] bg-[#f0883e]/20 text-[#f0883e]"
                            : "border-[#30363d] bg-[#21262d] text-[#c9d1d9]"
                        }`}
                      >
                        {elem.value || "∅"}
                      </div>

                      {/* Index */}
                      <div className="text-center mt-1">
                        <span className="text-[#6e7681] text-xs font-mono">[{idx}]</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Size indicator */}
              <div className="mt-6 text-center">
                <span className="text-[#8b949e] text-sm">
                  Queue Size: <span className="text-white font-bold">{step.elements.filter(e => e.value !== "").length}</span> / 5
                </span>
              </div>
            </div>
          </div>

          {/* Action Badge */}
          <div className="mt-8 text-center">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              step.action === "enqueue" 
                ? "bg-[#3fb950]/20 text-[#3fb950]" 
                : step.action === "dequeue"
                ? "bg-[#f85149]/20 text-[#f85149]"
                : step.action === "full"
                ? "bg-[#f0883e]/20 text-[#f0883e]"
                : "bg-[#8b949e]/20 text-[#8b949e]"
            }`}>
              {step.action === "enqueue" && <ArrowRight size={16} />}
              {step.action === "dequeue" && <ArrowLeft size={16} />}
              {step.action === "enqueue" && "ENQUEUE Operation"}
              {step.action === "dequeue" && "DEQUEUE Operation"}
              {step.action === "full" && "Queue Full!"}
              {step.action === "init" && "Queue Overview"}
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
