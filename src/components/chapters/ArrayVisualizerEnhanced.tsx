"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  ChevronLeft, ChevronRight, Info, Zap, Database
} from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface ArrayElement {
  value: number | null;
  index: number;
  isActive?: boolean;
  isNew?: boolean;
  isDeleting?: boolean;
  isResizing?: boolean;
}

interface Step {
  step: number;
  title: string;
  description: string;
  codeLines: number[];
  elements: ArrayElement[];
  capacity: number;
  size: number;
  action: "init" | "insert" | "access" | "resize" | "delete" | "shift";
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
  "// Dynamic Array (Vector/ArrayList) Implementation",
  "class DynamicArray {",
  "  constructor() {",
  "    this.data = new Array(4);  // Initial capacity: 4",
  "    this.size = 0;              // Current elements: 0",
  "    this.capacity = 4;        // Max before resize",
  "  }",
  "",
  "  // O(1) amortized - add to end",
  "  push(value) {",
  "    if (this.size === this.capacity) {",
  "      this._resize();  // Double the capacity",
  "    }",
  "    this.data[this.size] = value;",
  "    this.size++;",
  "  }",
  "",
  "  // O(n) - may need to shift elements",
  "  insert(index, value) {",
  "    if (this.size === this.capacity) this._resize();",
  "    // Shift elements from index to end, one position right",
  "    for (let i = this.size; i > index; i--) {",
  "      this.data[i] = this.data[i - 1];",
  "    }",
  "    this.data[index] = value;",
  "    this.size++;",
  "  }",
  "",
  "  // O(1) - direct index access",
  "  get(index) {",
  "    if (index < 0 || index >= this.size) {",
  "      throw new Error('Index out of bounds');",
  "    }",
  "    return this.data[index];",
  "  }",
  "",
  "  // O(n) - create new array, copy elements",
  "  _resize() {",
  "    const newCapacity = this.capacity * 2;",
  "    const newData = new Array(newCapacity);",
  "    // Copy all existing elements to new array",
  "    for (let i = 0; i < this.size; i++) {",
  "      newData[i] = this.data[i];",
  "    }",
  "    this.data = newData;",
  "    this.capacity = newCapacity;",
  "  }",
  "}",
];

const generateSteps = (): Step[] => [
  {
    step: 0,
    title: "Array Fundamentals",
    description: "Arrays store elements in contiguous memory locations. Each element is accessed by its index (0, 1, 2, ...) in O(1) time.",
    codeLines: [1, 2, 3, 4, 5, 6],
    elements: Array(4).fill(null).map((_, i) => ({ value: null, index: i })),
    capacity: 4,
    size: 0,
    action: "init",
    explanation: "We start with capacity 4. The array is empty (size = 0). All slots show null/empty. The key advantage: memory is contiguous, enabling O(1) index access via pointer arithmetic.",
    theoryConnection: "Think of a parking lot with numbered spaces. You can drive directly to space 42 without checking spaces 0-41. That's O(1) access!",
    complexity: "Access: O(1) | Insert at end: O(1) amortized | Insert at middle: O(n)"
  },
  {
    step: 1,
    title: "First Insertion - Push 10",
    description: "Adding element to the first available slot at index 0.",
    codeLines: [8, 9, 10, 13, 14],
    elements: [
      { value: 10, index: 0, isActive: true, isNew: true },
      { value: null, index: 1 },
      { value: null, index: 2 },
      { value: null, index: 3 },
    ],
    capacity: 4,
    size: 1,
    action: "insert",
    explanation: "data[0] = 10, then size increments to 1. No resize needed since size (1) < capacity (4). This is the best case: O(1) time.",
    theoryConnection: "Inserting at the end is fast when there's space. The array keeps track of where the 'end' is with the size variable.",
    complexity: "Time: O(1) - No shifting or resizing needed"
  },
  {
    step: 2,
    title: "Second Insertion - Push 20",
    description: "Adding element at index 1, right after the first element.",
    codeLines: [13, 14],
    elements: [
      { value: 10, index: 0 },
      { value: 20, index: 1, isActive: true, isNew: true },
      { value: null, index: 2 },
      { value: null, index: 3 },
    ],
    capacity: 4,
    size: 2,
    action: "insert",
    explanation: "data[1] = 20, size becomes 2. Still plenty of capacity remaining. Two elements stored contiguously in memory.",
    theoryConnection: "Elements sit next to each other in RAM. This 'contiguity' is why CPU cache performs well with arrays - adjacent elements are likely in cache.",
    complexity: "Time: O(1) - Still no resize needed"
  },
  {
    step: 3,
    title: "Third & Fourth Insertions",
    description: "Filling up the array with values 30 and 40.",
    codeLines: [13, 14],
    elements: [
      { value: 10, index: 0 },
      { value: 20, index: 1 },
      { value: 30, index: 2, isActive: true, isNew: true },
      { value: 40, index: 3, isActive: true, isNew: true },
    ],
    capacity: 4,
    size: 4,
    action: "insert",
    explanation: "Now size = 4, which equals capacity = 4. The array is FULL! Any new insertion will trigger a resize operation.",
    theoryConnection: "Like a parking lot with no empty spaces. To add another car, you need to build a bigger lot and move ALL cars there.",
    complexity: "Time: O(1) for these, but next will be O(n)"
  },
  {
    step: 4,
    title: "THE RESIZE - Doubling Capacity",
    description: "Array is full! We must create a new, larger array and copy all elements. This is the expensive operation.",
    codeLines: [27, 28, 29, 30, 31, 32, 33, 34, 35],
    elements: [
      { value: 10, index: 0, isResizing: true },
      { value: 20, index: 1, isResizing: true },
      { value: 30, index: 2, isResizing: true },
      { value: 40, index: 3, isResizing: true },
      { value: null, index: 4 },
      { value: null, index: 5 },
      { value: null, index: 6 },
      { value: null, index: 7 },
    ],
    capacity: 8,
    size: 4,
    action: "resize",
    explanation: "NEW array created with capacity 8. All 4 elements copied over. Old array will be garbage collected. This took O(n) time but happens rarely - amortized O(1).",
    theoryConnection: "Resizing is like moving to a bigger house. It's expensive now, but you won't need to move again for a while. That's why we DOUBLE - to make resizes rare.",
    complexity: "Time: O(n) - Must copy all n elements"
  },
  {
    step: 5,
    title: "Insertion After Resize - Push 50",
    description: "Now we have space! Insert 50 at index 4.",
    codeLines: [13, 14],
    elements: [
      { value: 10, index: 0 },
      { value: 20, index: 1 },
      { value: 30, index: 2 },
      { value: 40, index: 3 },
      { value: 50, index: 4, isActive: true, isNew: true },
      { value: null, index: 5 },
      { value: null, index: 6 },
      { value: null, index: 7 },
    ],
    capacity: 8,
    size: 5,
    action: "insert",
    explanation: "After resize, insertion is O(1) again. data[4] = 50, size = 5. Notice we have room for 3 more elements before next resize.",
    theoryConnection: "Amortized analysis: Even though resize is O(n), it happens so rarely that average push is still O(1). For n insertions, total work is O(n), so each is O(1) amortized.",
    complexity: "Time: O(1) amortized"
  },
  {
    step: 6,
    title: "Index Access - The Superpower",
    description: "Accessing element at index 2 directly - O(1) time!",
    codeLines: [20, 21, 22, 23, 24],
    elements: [
      { value: 10, index: 0 },
      { value: 20, index: 1 },
      { value: 30, index: 2, isActive: true },
      { value: 40, index: 3 },
      { value: 50, index: 4 },
      { value: null, index: 5 },
      { value: null, index: 6 },
      { value: null, index: 7 },
    ],
    capacity: 8,
    size: 5,
    action: "access",
    explanation: "Get index 2: directly access data[2] = 30. No traversal needed! Memory address = base_address + (2 * element_size). This is why arrays beat linked lists for random access.",
    theoryConnection: "CPU loves this! It can calculate the exact memory address instantly. With linked lists, you'd have to follow 2 pointers (head→next→target).",
    complexity: "Time: O(1) - Direct memory addressing"
  },
  {
    step: 7,
    title: "Middle Insertion - The Shifting Problem",
    description: "Insert 25 at index 2. Watch elements shift right!",
    codeLines: [16, 17, 18, 19, 20, 21],
    elements: [
      { value: 10, index: 0 },
      { value: 20, index: 1 },
      { value: 25, index: 2, isActive: true, isNew: true },
      { value: 30, index: 3, isResizing: true },
      { value: 40, index: 4, isResizing: true },
      { value: 50, index: 5, isResizing: true },
      { value: null, index: 6 },
      { value: null, index: 7 },
    ],
    capacity: 8,
    size: 6,
    action: "shift",
    explanation: "Insert at index 2 requires shifting elements 30, 40, 50 one position right. Loop runs from size down to index. 3 shifts for this insertion.",
    theoryConnection: "This is arrays' weakness. Inserting at the beginning would shift ALL n elements - O(n) time. Linked lists win here: O(1) insertion if you have the pointer.",
    complexity: "Time: O(n) - Must shift elements after insertion point"
  },
  {
    step: 8,
    title: "Final State & Summary",
    description: "Complete array with 6 elements, capacity 8. Two more insertions possible before resize.",
    codeLines: [36, 37, 38],
    elements: [
      { value: 10, index: 0 },
      { value: 20, index: 1 },
      { value: 25, index: 2 },
      { value: 30, index: 3 },
      { value: 40, index: 4 },
      { value: 50, index: 5 },
      { value: null, index: 6 },
      { value: null, index: 7 },
    ],
    capacity: 8,
    size: 6,
    action: "init",
    explanation: "Summary: push() is O(1) amortized, get() is O(1), insert() at arbitrary position is O(n). Space is O(n) but with overhead for unused capacity.",
    theoryConnection: "Choose arrays when you need fast random access and mostly add/remove at the end. Dynamic arrays (like Java ArrayList, C++ vector, Python list) handle resizing automatically.",
    complexity: "Final load factor: 6/8 = 75% utilized"
  },
];

export default function ArrayVisualizerEnhanced() {
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
  
  const { setActiveLines } = useCodeHighlight();
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

  const loadFactor = ((step.size / step.capacity) * 100).toFixed(0);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div>
          <h3 className="text-white font-semibold text-lg">Dynamic Array Visualization</h3>
          <p className="text-[#8b949e] text-sm">Understanding contiguous memory, resizing, and O(1) access</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <Database size={14} className="text-[#58a6ff]" />
            <span className="text-[#8b949e] text-sm">Size: <span className="text-white font-medium">{step.size}</span></span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <Zap size={14} className="text-[#f0883e]" />
            <span className="text-[#8b949e] text-sm">Capacity: <span className="text-white font-medium">{step.capacity}</span></span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <Info size={14} className="text-[#3fb950]" />
            <span className="text-[#8b949e] text-sm">Load: <span className="text-white font-medium">{loadFactor}%</span></span>
          </div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full ml-2">
            <div 
              className="h-full bg-[#58a6ff] rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visualization Area */}
        <div className="flex-1 flex flex-col p-6">
          {/* Array Container */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex items-end gap-1">
              <AnimatePresence mode="popLayout">
                {step.elements.map((elem, idx) => (
                  <motion.div
                    key={`${idx}-${elem.value}`}
                    initial={elem.isNew ? { scale: 0, y: -50 } : elem.isResizing ? { x: 20, opacity: 0 } : false}
                    animate={{ scale: 1, y: 0, x: 0, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="relative"
                  >
                    {/* Memory address */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-[#6e7681] font-mono whitespace-nowrap">
                      0x{(1000 + idx * 4).toString(16).toUpperCase()}
                    </div>
                    
                    {/* Cell */}
                    <div
                      className={`w-16 h-16 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                        elem.isActive
                          ? "border-[#58a6ff] bg-[#58a6ff]/20"
                          : elem.isNew
                          ? "border-[#3fb950] bg-[#3fb950]/20"
                          : elem.isResizing
                          ? "border-[#f0883e] bg-[#f0883e]/10"
                          : elem.value !== null
                          ? "border-[#30363d] bg-[#21262d]"
                          : "border-[#21262d] bg-[#161b22] border-dashed"
                      }`}
                    >
                      <span className={`text-lg font-bold ${elem.value !== null ? "text-white" : "text-[#6e7681]"}`}>
                        {elem.value !== null ? elem.value : "∅"}
                      </span>
                    </div>
                    
                    {/* Index label */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[#8b949e] font-mono">
                      [{idx}]
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Action Badge */}
            <div className="mt-16">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                step.action === "resize" 
                  ? "bg-[#f0883e]/20 text-[#f0883e]" 
                  : step.action === "shift"
                  ? "bg-[#a371f7]/20 text-[#a371f7]"
                  : step.action === "insert"
                  ? "bg-[#3fb950]/20 text-[#3fb950]"
                  : step.action === "access"
                  ? "bg-[#58a6ff]/20 text-[#58a6ff]"
                  : "bg-[#8b949e]/20 text-[#8b949e]"
              }`}>
                {step.action === "resize" && "⚡ Resizing Array"}
                {step.action === "shift" && "🔄 Shifting Elements"}
                {step.action === "insert" && "➕ Inserting Element"}
                {step.action === "access" && "🔍 Direct Access"}
                {step.action === "init" && "📚 Learning"}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          {/* Step Info */}
          <div className="p-5 border-b border-[#30363d]">
            <span className="text-[#58a6ff] text-xs font-mono uppercase tracking-wider">
              Step {currentStep + 1}: {step.title}
            </span>
            <p className="text-[#c9d1d9] mt-3 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Explanation */}
          <div className="p-5 border-b border-[#30363d] flex-1 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">What's Happening</h4>
            <p className="text-[#c9d1d9] text-sm leading-relaxed mb-4">
              {step.explanation}
            </p>
            
            <div className="mt-4 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg">
              <h4 className="text-[#3fb950] text-xs uppercase tracking-wider mb-1">💡 Theory Connection</h4>
              <p className="text-[#c9d1d9] text-sm leading-relaxed">
                {step.theoryConnection}
              </p>
            </div>

            <div className="mt-4 p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg">
              <h4 className="text-[#58a6ff] text-xs uppercase tracking-wider mb-1">⏱️ Complexity</h4>
              <p className="text-[#c9d1d9] text-sm font-mono">
                {step.complexity}
              </p>
            </div>
          </div>

          {/* Code Panel */}
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
