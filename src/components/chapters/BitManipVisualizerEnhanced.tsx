"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft, ChevronRight, Binary, MoveRight } from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Step { step: number; title: string; description: string; codeLines: number[]; num1: number; num2: number; operation: string; result: number; bits1: string; bits2: string; resultBits: string; explanation: string; theoryConnection: string; complexity: string; }

const speeds = [{ label: "0.5x", value: 0.5 }, { label: "1x", value: 1 }, { label: "1.5x", value: 1.5 }, { label: "2x", value: 2 }, { label: "3x", value: 3 }];

const codeLines = ["// Bit Manipulation Operations", "const AND = (a, b) => a & b;   // Both bits 1 → 1", "const OR  = (a, b) => a | b;   // Either bit 1 → 1", "const XOR = (a, b) => a ^ b;   // Bits differ → 1", "const NOT = (a)    => ~a;      // Flip all bits", "const LSHIFT = (a, n) => a << n;  // a × 2^n", "const RSHIFT = (a, n) => a >> n;  // a ÷ 2^n", "", "// Common bit tricks:", "// Check if bit i is set: (n >> i) & 1", "// Set bit i: n | (1 << i)", "// Clear bit i: n & ~(1 << i)", "// Toggle bit i: n ^ (1 << i)", "// Power of 2: n & (n - 1) === 0"];

const toBinary = (n: number, bits: number = 8): string => (n >>> 0).toString(2).padStart(bits, '0').slice(-bits);

const generateSteps = (): Step[] => [
  { step: 0, title: "Bit Manipulation Fundamentals", description: "Directly operate on binary representations for efficiency.", codeLines: [1, 2, 3, 4], num1: 5, num2: 3, operation: "Introduction", result: 0, bits1: "00000101", bits2: "00000011", resultBits: "00000000", explanation: "Bit manipulation operates directly on the binary representation of numbers. Extremely fast (single CPU instruction) and memory-efficient. Essential for: low-level programming, graphics, networking, cryptography, competitive programming.", theoryConnection: "Modern CPUs have dedicated bit operation circuits. AND, OR, XOR, NOT, shifts execute in 1 clock cycle. Used in: flags/masks, permissions, compression, encryption (XOR cipher), hashing.", complexity: "All bit operations: O(1) time. Constant space." },
  { step: 1, title: "Binary Representation", description: "Decimal 5 = binary 00000101 (8-bit view).", codeLines: [1, 2], num1: 5, num2: 3, operation: "Binary", result: 5, bits1: "00000101", bits2: "00000011", resultBits: "00000101", explanation: "5 in binary: 4 + 1 = 2² + 2⁰ = 00000101. Each bit position represents a power of 2. Rightmost = 2⁰=1, then 2¹=2, 2²=4, 2³=8, etc. 3 = 00000011 (2 + 1).", theoryConnection: "All integers stored as binary in memory. 8-bit byte, 32/64-bit words. Understanding binary is fundamental to CS. Two's complement for negative numbers.", complexity: "8 bits = 0 to 255. 32 bits = 0 to 4 billion." },
  { step: 2, title: "Bitwise AND (&)", description: "Result bit is 1 only if BOTH input bits are 1.", codeLines: [2], num1: 5, num2: 3, operation: "AND", result: 1, bits1: "00000101", bits2: "00000011", resultBits: "00000001", explanation: "5 & 3: Bit by bit: positions 0: 1&1=1, position 1: 0&1=0, rest 0&0=0. Result: 00000001 = 1. AND used for masking (extract specific bits).", theoryConnection: "Truth table: 0&0=0, 0&1=0, 1&0=0, 1&1=1. Masking: n & 0xFF extracts low 8 bits. Common in graphics (RGBA channels), networking (IP masks).", complexity: "Single CPU instruction. O(1)." },
  { step: 3, title: "Bitwise OR (|)", description: "Result bit is 1 if EITHER input bit is 1.", codeLines: [3], num1: 5, num2: 3, operation: "OR", result: 7, bits1: "00000101", bits2: "00000011", resultBits: "00000111", explanation: "5 | 3: Bit by bit: position 0: 1|1=1, position 1: 0|1=1, position 2: 1|0=1. Result: 00000111 = 7. OR used for setting flags (combine permissions).", theoryConnection: "Truth table: 0|0=0, 0|1=1, 1|0=1, 1|1=1. Setting bits: n | (1 << i) sets bit i. Used in Unix permissions (rwx), feature flags, combining masks.", complexity: "Single CPU instruction. O(1)." },
  { step: 4, title: "Bitwise XOR (^)", description: "Result bit is 1 if bits DIFFER (one 1, one 0).", codeLines: [4], num1: 5, num2: 3, operation: "XOR", result: 6, bits1: "00000101", bits2: "00000011", resultBits: "00000110", explanation: "5 ^ 3: Position 0: 1^1=0, position 1: 0^1=1, position 2: 1^0=1. Result: 00000110 = 6. XOR is powerful: toggle bits, swap without temp, simple cipher.", theoryConnection: "Truth table: 0^0=0, 0^1=1, 1^0=1, 1^1=0. Properties: a^a=0, a^0=a, a^b^a=b. Used in: toggling, error detection, simple encryption, swap algorithm.", complexity: "O(1). Swapping: a=a^b, b=a^b, a=a^b. No temp variable!" },
  { step: 5, title: "Left Shift (<<)", description: "Shift bits left: equivalent to multiplying by powers of 2.", codeLines: [6], num1: 5, num2: 2, operation: "LSHIFT", result: 20, bits1: "00000101", bits2: "", resultBits: "00010100", explanation: "5 << 2: Shift all bits left by 2 positions. 00000101 becomes 00010100. Lost bits on left, zeros added on right. 5 × 2² = 5 × 4 = 20. Fast multiplication!", theoryConnection: "a << n = a × 2^n. Extremely fast compared to multiplication. Used in: fast arithmetic, creating bit masks (1 << n), alignment in memory.", complexity: "O(1). Faster than multiply on most architectures." },
  { step: 6, title: "Right Shift (>>)", description: "Shift bits right: equivalent to dividing by powers of 2.", codeLines: [7], num1: 20, num2: 2, operation: "RSHIFT", result: 5, bits1: "00010100", bits2: "", resultBits: "00000101", explanation: "20 >> 2: Shift all bits right by 2 positions. 00010100 becomes 00000101. Lost bits on right. 20 ÷ 2² = 20 ÷ 4 = 5. Fast division!", theoryConnection: "a >> n = a ÷ 2^n (floor). Logical shift (>>>): fills with 0. Arithmetic shift (>>): fills with sign bit (preserves negative). Used in: fast division, extracting bits, binary search.", complexity: "O(1). Faster than divide on most architectures." },
  { step: 7, title: "Common Bit Tricks", description: "Essential patterns every programmer should know.", codeLines: [10, 11, 12, 13, 14], num1: 8, num2: 0, operation: "Tricks", result: 0, bits1: "00001000", bits2: "", resultBits: "00000000", explanation: "Power of 2: n & (n-1) === 0 (clears lowest set bit). 8 & 7 = 0, so 8 is power of 2. Get lowest set bit: n & -n. Count set bits: while(n) { n &= n-1; count++; }. Is bit i set? (n >> i) & 1.", theoryConnection: "n & (n-1) clears lowest set bit. n | (n+1) sets lowest clear bit. These tricks appear in: counting set bits (Brian Kernighan's algorithm), finding power of 2, isolating bits.", complexity: "Count bits: O(number of set bits), worst O(log n). Brian Kernighan's algorithm." },
  { step: 8, title: "Applications", description: "Where bit manipulation shines in practice.", codeLines: [1, 2, 3, 4], num1: 255, num2: 0, operation: "Applications", result: 0, bits1: "11111111", bits2: "", resultBits: "", explanation: "1. Graphics: RGBA packed in 32-bit integer. 2. Networking: IP addresses, subnet masks. 3. Compression: Huffman uses bit packing. 4. Cryptography: XOR ciphers. 5. Game dev: Collision masks, tile maps. 6. Embedded: Register control. 7. Algorithms: Union-Find with bitsets.", theoryConnection: "Bit manipulation is everywhere but often hidden. Understanding it makes you a better programmer. Essential for systems programming, performance-critical code, low-level optimization.", complexity: "Applications vary widely. Bit operations themselves always O(1)." },
];

export default function BitManipVisualizerEnhanced() {
  const { currentStep: stepIndex, totalSteps, isPlaying, playbackSpeed, togglePlay, pause, setStep, nextStep, prevStep, setTotalSteps, setPlaybackSpeed } = useTimeline();
  const { setActiveLines } = useCodeHighlight();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => { setTotalSteps(generateSteps().length); }, [setTotalSteps]);
  useEffect(() => { setCurrentStep(stepIndex); }, [stepIndex]);
  const steps = generateSteps();
  const step = steps[currentStep] || steps[0];
  useEffect(() => { if (step?.codeLines) setActiveLines(step.codeLines); }, [step, setActiveLines]);
  useEffect(() => { let interval: NodeJS.Timeout; if (isPlaying && currentStep < steps.length - 1) { interval = setInterval(() => nextStep(), 2500 / playbackSpeed); } else if (currentStep >= steps.length - 1 && isPlaying) pause(); return () => clearInterval(interval); }, [isPlaying, currentStep, steps.length, playbackSpeed, nextStep, pause]);
  const handleReset = useCallback(() => { pause(); setStep(0); }, [pause, setStep]);

  const renderBits = (bits: string, highlight?: boolean[]) => (
    <div className="flex gap-1 font-mono text-lg">
      {bits.split('').map((bit, i) => (
        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.02 }} className={`w-6 h-8 flex items-center justify-center rounded ${bit === '1' ? 'bg-[#3fb950] text-white' : 'bg-[#21262d] text-[#8b949e]'} ${highlight?.[i] ? 'ring-2 ring-[#f0883e]' : ''}`}>
          {bit}
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div><h3 className="text-white font-semibold text-lg">Bit Manipulation</h3><p className="text-[#8b949e] text-sm">AND | OR | XOR | Shifts | Bit Tricks</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg"><Binary size={14} className="text-[#58a6ff]" /><span className="text-[#8b949e] text-xs">Op:</span><span className="text-[#f0883e] font-bold">{step.operation}</span></div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full"><div className="h-full bg-[#58a6ff] rounded-full transition-all" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} /></div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          <div className="flex-1 flex flex-col justify-center gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-4"><span className="text-[#8b949e] w-8">A:</span><span className="text-[#58a6ff] font-mono w-8">{step.num1}</span>{renderBits(step.bits1)}</div>
            </div>
            {step.operation !== "Binary" && step.operation !== "LSHIFT" && step.operation !== "RSHIFT" && step.operation !== "Tricks" && step.operation !== "Applications" && (
              <div className="space-y-3">
                <div className="flex items-center gap-4"><span className="text-[#8b949e] w-8">B:</span><span className="text-[#58a6ff] font-mono w-8">{step.num2}</span>{renderBits(step.bits2)}</div>
              </div>
            )}
            <div className="h-px bg-[#30363d]" />
            <div className="space-y-3">
              <div className="flex items-center gap-4"><span className="text-[#3fb950] w-8 font-bold">R:</span><span className="text-[#3fb950] font-mono w-8 font-bold">{step.result}</span>{renderBits(step.resultBits)}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]"><span className="text-[#8b949e] text-xs">Decimal A</span><p className="text-white font-bold text-lg">{step.num1}</p></div>
            {step.operation !== "Binary" && step.operation !== "LSHIFT" && step.operation !== "RSHIFT" && step.operation !== "Tricks" && step.operation !== "Applications" && (
              <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]"><span className="text-[#8b949e] text-xs">Decimal B</span><p className="text-white font-bold text-lg">{step.num2}</p></div>
            )}
            <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]"><span className="text-[#8b949e] text-xs">Operation</span><p className="text-[#f0883e] font-bold text-lg">{step.operation}</p></div>
            <div className="p-3 bg-[#21262d] rounded-lg border border-[#30363d]"><span className="text-[#8b949e] text-xs">Result</span><p className="text-[#3fb950] font-bold text-lg">{step.result}</p></div>
          </div>
        </div>
        <div className="w-96 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-5 border-b border-[#30363d]"><span className="text-[#58a6ff] text-xs font-mono uppercase tracking-wider">Step {currentStep + 1}: {step.title}</span><p className="text-[#c9d1d9] mt-3 leading-relaxed">{step.description}</p></div>
          <div className="p-5 border-b border-[#30363d] flex-1 overflow-y-auto"><h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">What is Happening</h4><p className="text-[#c9d1d9] text-sm leading-relaxed mb-4">{step.explanation}</p><div className="mt-4 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg"><h4 className="text-[#3fb950] text-xs uppercase tracking-wider mb-1">💡 Theory Connection</h4><p className="text-[#c9d1d9] text-sm leading-relaxed">{step.theoryConnection}</p></div><div className="mt-4 p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg"><h4 className="text-[#58a6ff] text-xs uppercase tracking-wider mb-1">⏱️ Complexity</h4><p className="text-[#c9d1d9] text-sm font-mono">{step.complexity}</p></div></div>
          <div className="p-4 bg-[#0d1117] max-h-56 overflow-y-auto"><h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">Code Reference</h4><div className="text-xs font-mono">{codeLines.map((line, i) => (<div key={i} className={`px-2 py-0.5 rounded ${step.codeLines?.includes(i + 1) ? "bg-[#238636]/30 text-[#7ee787] border-l-2 border-[#238636]" : "text-[#8b949e]"}`}><span className="text-[#6e7681] w-6 inline-block select-none">{i + 1}</span>{line || " "}</div>))}</div></div>
        </div>
      </div>
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><button onClick={() => { pause(); setStep(0); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><SkipBack size={18} /></button><button onClick={prevStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><ChevronLeft size={20} /></button><button onClick={togglePlay} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center gap-2">{isPlaying ? <Pause size={18} /> : <Play size={18} />}{isPlaying ? "Pause" : "Play"}</button><button onClick={nextStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><ChevronRight size={20} /></button><button onClick={() => { pause(); setStep(steps.length - 1); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><SkipForward size={18} /></button><button onClick={handleReset} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white"><RotateCcw size={18} /></button></div>
          <div className="flex items-center gap-3"><span className="text-[#8b949e] text-sm">Speed:</span><div className="flex gap-1">{speeds.map(s => <button key={s.value} onClick={() => setPlaybackSpeed(s.value)} className={`px-2 py-1 rounded text-xs font-medium ${playbackSpeed === s.value ? "bg-[#58a6ff] text-white" : "bg-[#21262d] text-[#8b949e]"}`}>{s.label}</button>)}</div></div>
        </div>
      </div>
    </div>
  );
}
