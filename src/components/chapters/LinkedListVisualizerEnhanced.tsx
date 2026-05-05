"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface ListNode {
  id: string;
  value: string;
  next: string | null;
  isHighlighted?: boolean;
  isNew?: boolean;
  isDeleting?: boolean;
}

interface Step {
  step: number;
  title: string;
  description: string;
  codeLines: number[];
  nodes: ListNode[];
  pointerPosition: number;
  action: "init" | "traverse" | "found" | "insert" | "delete" | "update";
  explanation: string;
  theoryConnection: string;
}

const speeds = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
];

const codeLines = [
  "// Linked List Node Structure",
  "class ListNode {",
  "  constructor(value) {",
  "    this.value = value;  // Store the data",
  "    this.next = null;     // Pointer to next node",
  "  }",
  "}",
  "",
  "// Insert at end - O(n) time complexity",
  "function insertAtEnd(head, value) {",
  "  const newNode = new ListNode(value);",
  "  ",
  "  // Case 1: Empty list",
  "  if (head === null) {",
  "    return newNode;  // New node becomes head",
  "  }",
  "  ",
  "  // Case 2: Traverse to find last node",
  "  let current = head;",
  "  while (current.next !== null) {",
  "    current = current.next;  // Move pointer forward",
  "  }",
  "  ",
  "  // Link new node at the end",
  "  current.next = newNode;",
  "  return head;",
  "}",
  "",
  "// Key Properties:",
  "// - Dynamic size (unlike arrays)",
  "// - Non-contiguous memory",
  "// - O(1) insertion at front",
  "// - O(n) insertion at end (traversal required)",
];

const generateSteps = (): Step[] => [
  {
    step: 0,
    title: "What is a Linked List?",
    description: "A Linked List is a linear data structure where elements are stored in nodes. Each node contains data and a reference (pointer) to the next node in the sequence.",
    codeLines: [1, 2, 3, 4, 5, 6],
    nodes: [],
    pointerPosition: -1,
    action: "init",
    explanation: "Unlike arrays where elements are stored in contiguous memory locations, linked list nodes can be scattered throughout memory. Each node only knows about its immediate neighbor.",
    theoryConnection: "Think of a treasure hunt - each clue (node) leads you to the next location. You don't need to know all locations upfront, just follow the chain."
  },
  {
    step: 1,
    title: "Creating the Head Node",
    description: "We start by creating the first node (head) with value 'A'. This node becomes our entry point to the entire list.",
    codeLines: [9, 10, 13, 14, 15],
    nodes: [{ id: "A", value: "A", next: null, isHighlighted: true, isNew: true }],
    pointerPosition: 0,
    action: "insert",
    explanation: "The head pointer stores the memory address of the first node. If head is null, the list is empty. Creating the first node is always O(1) time.",
    theoryConnection: "The head is crucial - lose it and you lose access to the entire list! This is why we always return/keep track of the head reference."
  },
  {
    step: 2,
    title: "Adding Second Node - Traversal Begins",
    description: "To add node 'B', we need to find the end of the list. We start at head and follow the next pointers.",
    codeLines: [18, 19, 20],
    nodes: [
      { id: "A", value: "A", next: null, isHighlighted: true },
      { id: "B", value: "B", next: null, isNew: true }
    ],
    pointerPosition: 0,
    action: "traverse",
    explanation: "Current pointer starts at head (A). We check if current.next is null. It is! So A is the last node. This took 1 step.",
    theoryConnection: "This is why linked lists have O(n) access time - in the worst case, you must visit every node to reach the end."
  },
  {
    step: 3,
    title: "Linking Node B",
    description: "Now we connect node A to node B by setting A.next to point to B.",
    codeLines: [23],
    nodes: [
      { id: "A", value: "A", next: "B", isHighlighted: false },
      { id: "B", value: "B", next: null, isHighlighted: true, isNew: true }
    ],
    pointerPosition: 0,
    action: "update",
    explanation: "The arrow (pointer) from A now points to B. A is no longer the tail - B is. This linking operation is O(1) once we find the position.",
    theoryConnection: "Changing links is fast! The expensive part is finding where to make the change. This is the fundamental tradeoff of linked lists."
  },
  {
    step: 4,
    title: "Adding Node C - Longer Traversal",
    description: "Let's add node C. Now we have 2 nodes, so traversal takes longer. Watch the current pointer move.",
    codeLines: [18, 19, 20],
    nodes: [
      { id: "A", value: "A", next: "B", isHighlighted: false },
      { id: "B", value: "B", next: null, isHighlighted: true },
      { id: "C", value: "C", next: null, isNew: true }
    ],
    pointerPosition: 1,
    action: "traverse",
    explanation: "Current starts at A. A.next is not null (points to B), so we move current to B. Check B.next - it's null! Found our insertion point after 2 steps.",
    theoryConnection: "As the list grows, insertion at the end becomes slower. For n nodes, we traverse n-1 nodes on average."
  },
  {
    step: 5,
    title: "Linking Node C",
    description: "Connect B to C. C becomes the new tail of our list.",
    codeLines: [23],
    nodes: [
      { id: "A", value: "A", next: "B", isHighlighted: false },
      { id: "B", value: "B", next: "C", isHighlighted: false },
      { id: "C", value: "C", next: null, isHighlighted: true, isNew: true }
    ],
    pointerPosition: 1,
    action: "update",
    explanation: "B.next now points to C. Our list has 3 nodes: A → B → C. The structure is building up!",
    theoryConnection: "Each insertion at the end requires a full traversal. This is why we often maintain a tail pointer for O(1) end insertions."
  },
  {
    step: 6,
    title: "Adding Node D - Even Longer Traversal",
    description: "Adding D requires traversing through A, B, and C. This demonstrates the O(n) nature of end insertions.",
    codeLines: [18, 19, 20, 21],
    nodes: [
      { id: "A", value: "A", next: "B", isHighlighted: false },
      { id: "B", value: "B", next: "C", isHighlighted: true },
      { id: "C", value: "C", next: null, isHighlighted: false },
      { id: "D", value: "D", next: null, isNew: true }
    ],
    pointerPosition: 2,
    action: "traverse",
    explanation: "Watch the current pointer: A → B → C. At C, we find C.next is null. That's 3 traversal steps for a 3-node list.",
    theoryConnection: "This is the worst case - visiting every node. Compare this to arrays where index access is O(1) but insertion might require shifting."
  },
  {
    step: 7,
    title: "Complete List Structure",
    description: "C now points to D. We have a complete linked list with 4 nodes: A → B → C → D.",
    codeLines: [23, 25, 26, 27],
    nodes: [
      { id: "A", value: "A", next: "B", isHighlighted: false },
      { id: "B", value: "B", next: "C", isHighlighted: false },
      { id: "C", value: "C", next: "D", isHighlighted: false },
      { id: "D", value: "D", next: null, isHighlighted: true, isNew: true }
    ],
    pointerPosition: 2,
    action: "update",
    explanation: "Complete chain: A → B → C → D → null. The last node's next pointer is always null, indicating it's the tail.",
    theoryConnection: "The null pointer terminates the list. If you encounter a circular reference (D pointing back to A), that's a circular linked list - a different data structure!"
  },
  {
    step: 8,
    title: "Memory Layout Visualization",
    description: "This shows how nodes are actually stored in memory - NOT contiguous like arrays!",
    codeLines: [29, 30, 31],
    nodes: [
      { id: "A", value: "A", next: "B", isHighlighted: true },
      { id: "B", value: "B", next: "C", isHighlighted: true },
      { id: "C", value: "C", next: "D", isHighlighted: true },
      { id: "D", value: "D", next: null, isHighlighted: true }
    ],
    pointerPosition: -1,
    action: "init",
    explanation: "In reality, these nodes could be at memory addresses: A=0x1000, B=0x5000, C=0x2000, D=0x8000. The pointers link them logically, not physically.",
    theoryConnection: "This non-contiguous nature is why linked lists excel at insertions/deletions in the middle - no shifting required like arrays!"
  },
  {
    step: 9,
    title: "Time Complexity Summary",
    description: "Let's summarize the operations we've learned and their time complexities.",
    codeLines: [33, 34, 35],
    nodes: [
      { id: "A", value: "A", next: "B", isHighlighted: true },
      { id: "B", value: "B", next: "C", isHighlighted: true },
      { id: "C", value: "C", next: "D", isHighlighted: true },
      { id: "D", value: "D", next: null, isHighlighted: true }
    ],
    pointerPosition: -1,
    action: "init",
    explanation: "Access: O(n) - must traverse. Search: O(n) - linear scan. Insert at front: O(1) - just update head. Insert at end: O(n) - must traverse. Delete: O(n) - must find first.",
    theoryConnection: "Choose linked lists when you need frequent insertions/deletions, especially at the front. Use arrays for random access and cache locality."
  },
];

export default function LinkedListVisualizerEnhanced() {
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
  }, [step, setActiveLines]);

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

  const renderNode = (node: ListNode, index: number) => {
    const isPointerHere = step.pointerPosition === index;
    
    return (
      <div key={node.id} className="flex items-center">
        {/* Pointer indicator */}
        <AnimatePresence>
          {isPointerHere && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2"
            >
              <div className="bg-[#f0883e] text-white text-xs px-2 py-1 rounded font-mono">
                current
              </div>
              <div className="w-0.5 h-4 bg-[#f0883e] mx-auto" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Node Box */}
        <motion.div
          initial={node.isNew ? { scale: 0, rotate: -180 } : false}
          animate={{ scale: 1, rotate: 0 }}
          className={`relative w-24 h-16 border-2 rounded-lg flex items-center justify-center font-mono font-bold text-lg transition-colors duration-300 ${
            node.isHighlighted 
              ? "border-[#58a6ff] bg-[#58a6ff]/20 text-[#58a6ff]" 
              : node.isNew
              ? "border-[#3fb950] bg-[#238636]/20 text-[#3fb950]"
              : "border-[#30363d] bg-[#21262d] text-[#c9d1d9]"
          }`}
        >
          <div className="flex w-full">
            <div className="flex-1 flex items-center justify-center border-r border-[#30363d]">
              {node.value}
            </div>
            <div className="w-8 flex items-center justify-center text-xs text-[#8b949e]">
              {node.next ? "→" : "∅"}
            </div>
          </div>
          
          {/* Memory address simulation */}
          <div className="absolute -bottom-5 text-[10px] text-[#6e7681] font-mono">
            0x{1000 + index * 4096}
          </div>
        </motion.div>

        {/* Arrow to next node */}
        {node.next && (
          <motion.div 
            className="w-16 h-0.5 bg-[#8b949e] mx-2 relative"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-[#8b949e] border-t-4 border-t-transparent border-b-4 border-b-transparent" />
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div>
          <h3 className="text-white font-semibold text-lg">Linked List Visualization</h3>
          <p className="text-[#8b949e] text-sm">Understanding node structure, pointers, and traversal</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#8b949e] text-sm">
            Step {currentStep + 1} of {steps.length}
          </span>
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
        {/* Visualization Area */}
        <div className="flex-1 flex flex-col p-8">
          {/* Memory visualization background */}
          <div className="flex-1 bg-[#0d1117] rounded-lg border border-[#30363d] p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="h-full w-full" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, #30363d 0px, transparent 1px, transparent 64px, #30363d 65px)',
                backgroundSize: '100% 64px'
              }} />
            </div>
            
            <div className="relative z-10 h-full flex flex-col">
              {/* Nodes Container */}
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center">
                  <AnimatePresence mode="popLayout">
                    {step.nodes.map((node, index) => renderNode(node, index))}
                  </AnimatePresence>
                  
                  {/* Null terminator */}
                  {step.nodes.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="ml-4 text-[#6e7681] font-mono"
                    >
                      null
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action label */}
              <div className="mt-8 text-center">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  step.action === "traverse" ? "bg-[#f0883e]/20 text-[#f0883e]" :
                  step.action === "insert" ? "bg-[#3fb950]/20 text-[#3fb950]" :
                  step.action === "update" ? "bg-[#a371f7]/20 text-[#a371f7]" :
                  "bg-[#58a6ff]/20 text-[#58a6ff]"
                }`}>
                  {step.action === "traverse" && "🔍 Traversing..."}
                  {step.action === "insert" && "➕ Inserting Node"}
                  {step.action === "update" && "🔗 Updating Pointer"}
                  {step.action === "init" && "📚 Learning Concept"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Info & Code */}
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

          {/* Detailed Explanation */}
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
            <button
              onClick={() => { pause(); setStep(0); }}
              className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"
              title="First step"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={prevStep}
              className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={togglePlay}
              className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center gap-2"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            
            <button
              onClick={nextStep}
              className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => { pause(); setStep(steps.length - 1); }}
              className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"
              title="Last step"
            >
              <SkipForward size={18} />
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"
            >
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
